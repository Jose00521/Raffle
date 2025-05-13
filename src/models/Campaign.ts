import mongoose from 'mongoose';
import NumberStatus from './NumberStatus';
import { IUser } from './User';

// Interface principal da Rifa
export interface ICampaign {
  _id?: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[]
  totalNumbers: number;
  drawDate: Date;
  isActive: boolean;
  winnerNumber: number | null;
  winnerUser?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
  // Estatísticas calculadas
  // stats?: {
  //   available: number;
  //   reserved: number;
  //   sold: number;
  //   percentComplete: number;
  // };
  // Propriedades adicionais para a página de detalhes
  instantPrizes: Array<{
    number: string;
    value: number;
    winner: string | null;
  }>;
  
  regulation?: string;
  campaignCode?: string;
  mainPrize?: string;
  valuePrize?: string;
  returnExpected?: string;
}

const subSchema = new mongoose.Schema({
  number: {
    type: String
  },
  value: {
    type: Number
  },
  winner: {
    type: String,
    default: null
  }
});

const CampaignSchema = new mongoose.Schema(
  {
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
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    images: [{
      type: String
    }],
    totalNumbers: {
      type: Number,
      required: [true, 'Please provide the total number of tickets'],
    },
    drawDate: {
      type: Date,
      required: [true, 'Please provide a draw date'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    winnerNumber: {
      type: Number,
      default: null,
    },
    winnerUser: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      default: null
    },
    // Campos adicionais para detalhes da campanha
    instantPrizes: {
      type: Array,
      default: []
    },
    regulation: {
      type: String,
    },
    campaignCode: {
      type: String,
    },
    mainPrize: {
      type: String,
    },
    valuePrize: {
      type: String,
    },
    returnExpected: {
      type: String,
    }
  },
  {
    timestamps: true,
    collection: 'campaigns',
    strict: false
  }
);

// Hook para inicializar todos os números na coleção NumberStatus após salvar uma nova rifa
CampaignSchema.post('save', async function(doc) {
  // Verificar se é um documento novo comparando timestamps
  if (doc.createdAt && doc.updatedAt && doc.createdAt.getTime() === doc.updatedAt.getTime()) {
    try {
      await NumberStatus!.initializeForRifa(doc._id.toString(), doc.totalNumbers);
      console.log(`Initialized ${doc.totalNumbers} numbers for Rifa ${doc._id}`);
    } catch (error) {
      console.error('Error initializing numbers for rifa:', error);
    }
  }
});

// Método adicional para obter estatísticas sobre números disponíveis/reservados/pagos
CampaignSchema.methods.getNumbersStats = async function() {
  return await NumberStatus!.countByStatus(this._id);
};

// Criando ou obtendo o modelo já existente
// @ts-ignore - Ignorando verificações de tipo para simplificar
export default mongoose.models.Campaign || mongoose.model('Campaign', CampaignSchema);