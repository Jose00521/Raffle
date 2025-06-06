import mongoose from 'mongoose';
import NumberStatus from './NumberStatus';
import { generateEntityCode } from './utils/idGenerator';
import { CampaignStatusEnum, ICampaign } from './interfaces/ICampaignInterfaces';
// Constantes para a geração de IDs estilo Snowflake
// Removidos e movidos para utils/idGenerator.ts

// Interface para o modelo com métodos estáticos

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
    coverImage: {
      type: String,
      required: [true, 'Pelo menos uma imagem é obrigatória'],
    },
    images: {
      type: [String], 
      required: [true, 'Pelo menos uma imagem é obrigatória'],
    },

    individualNumberPrice: {
      type: Number,
      required: [true, 'Preço do número individual é obrigatório'],
      min: [0, 'Preço não pode ser negativo']
    },
    totalNumbers: {
      type: Number,
      required: [true, 'Please provide the total number of tickets'],
    },
    drawDate: {
      type: Date,
      required: [true, 'Please provide a draw date'],
    },
    returnExpected: {
      type: String,
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
    numberPackages: {
      type: [{
        name: {
          type: String,
          required: [true, 'Nome do pacote é obrigatório']
        },
        description: String,
        quantity: {
          type: Number,
          required: [true, 'Quantidade de números é obrigatória'],
          min: [1, 'Pacote deve ter pelo menos 1 número']
        },
        price: {
          type: Number,
          required: [true, 'Preço do pacote é obrigatório'],
          min: [0, 'Preço não pode ser negativo']
        },
        discount: {
          type: Number,
          min: [0, 'Desconto não pode ser negativo'],
          max: [100, 'Desconto não pode exceder 100%'],
          default: 0
        },
        isActive: {
          type: Boolean,
          default: true
        },
        highlight: {
          type: Boolean,
          default: false
        },
        order: {
          type: Number,
          default: 0
        },
        maxPerUser: Number
      }],
      default: [],
    },
    stats: {
      type: {
        totalNumbers: Number,
        available: Number,
        reserved: Number,
        sold: Number,
        percentComplete: Number,
        totalRevenue: Number,
        totalParticipants: Number,
        totalWins: Number,
        totalPrizes: Number,
      },
      default: {
        totalNumbers: 0,
        available: 0,
        reserved: 0,
        sold: 0,
        percentComplete: 0,
        totalRevenue: 0,
        totalParticipants: 0,
        totalWins: 0,
        totalPrizes: 0
      }
    },

    // Campos adicionais para detalhes da campanha
    regulation: {
      type: String,
    },

  },
  {
    timestamps: true,
    collection: 'campaigns',
  }
);


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
// CampaignSchema.methods.getNumbersStats = async function() {
//   return await NumberStatus!.countByStatus(this._id);
// };

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
export default mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', CampaignSchema);