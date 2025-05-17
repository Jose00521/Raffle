import mongoose from 'mongoose';
import NumberStatus from './NumberStatus';
import { IUser } from './User';
import { IPrize } from './Prize';
import { IWinner } from './Winner';
import { IInstantPrize } from './InstantPrize';

export enum CampaignStatusEnum {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED'
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
  instantPrizes?: Array<IInstantPrize>;
  
  regulation?: string;
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
      index: true
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
    }
  },
  {
    timestamps: true,
    collection: 'campaigns',
  }
);

// Método adicional para obter estatísticas sobre números disponíveis/reservados/pagos
CampaignSchema.methods.getNumbersStats = async function() {
  return await NumberStatus!.countByStatus(this._id);
};

// Adicione antes do export
CampaignSchema.index({ createdBy: 1 }); // Busca por criador
CampaignSchema.index({ status: 1 }); // Filtrar por status
CampaignSchema.index({ drawDate: 1 }); // Ordenar por data de sorteio
CampaignSchema.index({ createdAt: -1 }); // Listar por data de criação
CampaignSchema.index({ campaignCode: 1 }, { sparse: true }); // Busca por código
CampaignSchema.index({ canceled: 1, status: 1 }); // Consultas combinadas de status
CampaignSchema.index({ 'prizeDistribution.position': 1 });
CampaignSchema.index({ 'winners.position': 1 });
CampaignSchema.index({ 'winners.user': 1 });
CampaignSchema.index({ 'winners.prizesClaimed': 1 });

// Criando ou obtendo o modelo já existente
// @ts-ignore - Ignorando verificações de tipo para simplificar
export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);