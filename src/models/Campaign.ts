import mongoose from 'mongoose';
import NumberStatus from './NumberStatus';
import { IUser } from './User';
import { IPrize } from './Prize';
import { IWinner } from './Winner';
import { IInstantPrize } from './InstantPrize';
import { generateEntityCode } from './utils/idGenerator';

// Constantes para a geração de IDs estilo Snowflake
// Removidos e movidos para utils/idGenerator.ts

export enum CampaignStatusEnum {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PENDING = 'PENDING'
}

// Interface principal da Rifa
export interface ICampaign {
  _id?: string;
  campaignCode?: string;
  createdBy: mongoose.Types.ObjectId | null;
  title: string;
  description: string;
  price: number;
  prizes: Array<IPrize>;
  //affiliates: Array<IUser>;
  returnExpected?: string;
  totalNumbers: number;
  drawDate: Date;
  canceled: Boolean; 
  status: CampaignStatusEnum; // Os valores possíveis são: "PENDING", "ACTIVE", "COMPLETED"
  scheduledActivationDate: Date | null;
  winnerNumber: number | null;
  winnerUser?: mongoose.Types.ObjectId | null;
  winner: Array<IWinner>;
  createdAt: Date;
  updatedAt: Date;
  activatedAt: Date | null;
  // Estatísticas calculadas
  stats?: {
    available: number;
    reserved: number | null;
    sold: number;
    percentComplete: number;
  };
  // Propriedades adicionais para a página de detalhes
  
  regulation?: string;
}

// Interface para o modelo com métodos estáticos
interface CampaignModel extends mongoose.Model<ICampaign> {
  findByCampaignCode(campaignCode: string): Promise<ICampaign | null>;
  findActiveByCreator(creatorId: mongoose.Types.ObjectId | string): Promise<ICampaign[]>;
}

const CampaignSchema = new mongoose.Schema(
  {
    campaignCode: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the raffle'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price per number'],
    },
    prizes:[{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Prize',
      required: [true, 'Please provide at least one prize'],
    }],
    totalNumbers: {
      type: Number,
      required: [true, 'Please provide the total number of tickets'],
    },
    drawDate: {
      type: Date,
      required: [true, 'Please provide a draw date'],
    },
    status: {
      type: String,
      enum: Object.values(CampaignStatusEnum),
      default: CampaignStatusEnum.ACTIVE,
      required: true,
    },
    canceled: {
      type: Boolean,
      default: false,
      index: true
    },
    scheduledActivationDate: {
      type: Date,
      default: null,
    },
    winnerPositions: {
      type: Number,
      default: 1,
      min: 1,
      required: true
    },
     // Define os prêmios para cada posição
    prizeDistribution: [{
      position: {
        type: Number,
        required: true,
        min: 1
      },
      prizes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prize',
        required: true
      }],
      description: String // Descrição opcional para esta posição
    }],
    winners: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Winner',
      default: null
    }],

    // Campos adicionais para detalhes da campanha
    regulation: {
      type: String,
    },
    returnExpected: {
      type: String,
    },

  },
  {
    timestamps: true,
    collection: 'campaigns',
  }
);

// Adiciona um hook pre-save para gerar automaticamente o código da campanha
CampaignSchema.pre('save', async function(this: mongoose.Document & { campaignCode?: string; _id: mongoose.Types.ObjectId }, next) {
  // Só gera o código se ele ainda não existir
  if (!this.campaignCode) {
    // Usa a mesma abordagem dos outros modelos
    this.campaignCode = generateEntityCode(this._id, 'RA');
  }
  next();
});

// Métodos estáticos do modelo
CampaignSchema.statics.findByCampaignCode = function(campaignCode: string) {
  return this.findOne({ campaignCode })
    .populate('createdBy', 'name email userCode')
    .populate({
      path: 'prizes',
      select: 'name image value prizeCode'
    });
};

CampaignSchema.statics.findActiveByCreator = function(creatorId: mongoose.Types.ObjectId | string) {
  return this.find({
    createdBy: creatorId,
    status: CampaignStatusEnum.ACTIVE,
    canceled: false
  })
  .sort({ createdAt: -1 });
};

// Método adicional para obter estatísticas sobre números disponíveis/reservados/pagos
CampaignSchema.methods.getNumbersStats = async function() {
  return await NumberStatus!.countByStatus(this._id);
};

// Adicione antes do export
CampaignSchema.index({ createdBy: 1 }); // Busca por criador
CampaignSchema.index({ status: 1 }); // Filtrar por status
CampaignSchema.index({ drawDate: 1 }); // Ordenar por data de sorteio
CampaignSchema.index({ createdAt: -1 }); // Listar por data de criação
CampaignSchema.index({ campaignCode: 1 }, { unique: true, sparse: true }); // Busca por código (agora com unique)
CampaignSchema.index({ canceled: 1, status: 1 }); // Consultas combinadas de status
CampaignSchema.index({ 'prizeDistribution.position': 1 });
CampaignSchema.index({ 'winners.position': 1 });
CampaignSchema.index({ 'winners.user': 1 });
CampaignSchema.index({ 'winners.prizesClaimed': 1 });

// Novos índices otimizados
CampaignSchema.index({ status: 1, drawDate: 1 }); // Para listar rifas ativas por data de sorteio
CampaignSchema.index({ createdBy: 1, status: 1, createdAt: -1 }); // Para dashboard de criador
CampaignSchema.index({ price: 1 }); // Para filtrar por preço
CampaignSchema.index({ title: 'text', description: 'text' }); // Para busca textual
CampaignSchema.index({ totalNumbers: 1 }); // Para filtrar por tamanho da rifa
CampaignSchema.index({ createdBy: 1, drawDate: 1 }); // Para alertas de sorteios próximos
CampaignSchema.index({ status: 1, createdAt: -1 }); // Para listagem de rifas mais recentes por status
CampaignSchema.index({ scheduledActivationDate: 1 }, { sparse: true }); // Para ativação programada

// Adicionar índices para verificação
CampaignSchema.index({ 'verification.status': 1 }); // Para listar campanhas por status de verificação
CampaignSchema.index({ 'verification.expiresAt': 1 }); // Para alertas de verificação a expirar
CampaignSchema.index({ 'verification.reviewedAt': 1 }); // Para auditorias de verificação

// Criando ou obtendo o modelo já existente
export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);