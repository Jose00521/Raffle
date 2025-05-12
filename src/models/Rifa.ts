import mongoose from 'mongoose';
import NumberStatus from './NumberStatus';

// Interface principal da Rifa
export interface IRifa {
  _id?: string;
  title: string;
  description: string;
  price: number;
  image: string;
  images: string[]
  totalNumbers: number;
  drawDate: Date;
  isActive: boolean;
  winnerNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  // Estatísticas calculadas
  stats?: {
    available: number;
    reserved: number;
    sold: number;
    percentComplete: number;
  };
  // Propriedades adicionais para a página de detalhes
  instantPrizes?: Array<{
    number: string;
    value: number;
    winner: string | null;
  }>;
  regulamento?: string;
  codigoSorteio?: string;
  premiacaoPrincipal?: string;
  valorPremio?: string;
}

const RifaSchema = new mongoose.Schema(
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
    // Campos adicionais para detalhes da campanha
    instantPrizes: [{
      number: String,
      value: Number,
      winner: {
        type: String,
        default: null
      }
    }],
    regulamento: String,
    codigoSorteio: String,
    premiacaoPrincipal: String,
    valorPremio: String
  },
  {
    timestamps: true,
  }
);

// Hook para inicializar todos os números na coleção NumberStatus após salvar uma nova rifa
RifaSchema.post('save', async function(doc) {
  // Verificar se é um documento novo comparando timestamps
  if (doc.createdAt.getTime() === doc.updatedAt.getTime()) {
    try {
      await NumberStatus!.initializeForRifa(doc._id.toString(), doc.totalNumbers);
      console.log(`Initialized ${doc.totalNumbers} numbers for Rifa ${doc._id}`);
    } catch (error) {
      console.error('Error initializing numbers for rifa:', error);
    }
  }
});

// Método adicional para obter estatísticas sobre números disponíveis/reservados/pagos
RifaSchema.methods.getNumbersStats = async function() {
  return await NumberStatus!.countByStatus(this._id);
};

// Criando ou obtendo o modelo já existente
// @ts-ignore - Ignorando verificações de tipo para simplificar
const RifaModel = mongoose.models.Rifa || mongoose.model('Rifa', RifaSchema);

export default RifaModel; 