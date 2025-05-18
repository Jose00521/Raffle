import mongoose from 'mongoose';
import { generateEntityCode } from './utils/idGenerator';

export interface IPrize {
  _id?: string;
  prizeCode?: string; // Código único no formato Snowflake ID
  name: string;
  description?: string;
  categoryId?: mongoose.Types.ObjectId;
  image: string;
  images: string[];
  value: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeSchema = new mongoose.Schema<IPrize>(
  {
    prizeCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true
    },
    name: {
      type: String,
      trim: true,
      required: [true, 'Please provide a name for the prize'],
    },
    description: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PrizeCategory',
    },
    image: {
      type: String,
      required: [true, 'Please provide an image URL'],
    },
    images: [{
      type: String
    }],
    value: {
      type: String,
      required: [true, 'Please provide the prize value'],
    }
  },
  {
    timestamps: true,
    collection: 'prizes'
  }
);

// Adiciona um hook pre-save para gerar automaticamente o código do prêmio
PrizeSchema.pre('save', function(this: any, next) {
  // Só gera o código se ele ainda não existir e se estiver no servidor
  if (!this.prizeCode && typeof window === 'undefined') {
    this.prizeCode = generateEntityCode(this._id, 'PR');
  }
  next();
});

PrizeSchema.index({ name: 'text', description: 'text' }); // Text search for name and description
PrizeSchema.index({ categoryId: 1 }); // For filtering prizes by category
PrizeSchema.index({ value: 1 }); // For sorting/filtering by value
PrizeSchema.index({ createdAt: -1 }); // For recent prizes queries

// Índices adicionais otimizados
PrizeSchema.index({ prizeCode: 1 }, { unique: true, sparse: true }); // Para busca direta por código
PrizeSchema.index({ categoryId: 1, createdAt: -1 }); // Para listagem de prêmios por categoria ordenados por data
PrizeSchema.index({ categoryId: 1, value: -1 }); // Para listagem dos prêmios mais valiosos por categoria
PrizeSchema.index({ name: 1 }); // Para busca por nome e ordenação alfabética
PrizeSchema.index({ name: 1, value: -1 }); // Para busca por nome ordenando por valor

// Métodos estáticos do modelo
PrizeSchema.statics.findByPrizeCode = function(prizeCode: string) {
  return this.findOne({ prizeCode });
};

PrizeSchema.statics.findByCategory = function(categoryId: mongoose.Types.ObjectId | string) {
  return this.find({ categoryId }).sort({ createdAt: -1 });
};

// Verifica se o modelo já existe para evitar redefini-lo em hot-reload
const PrizeModel = mongoose.models.Prize || mongoose.model<IPrize>('Prize', PrizeSchema);

// Adicionamos as funções estáticas na exportação para uso externo
export default PrizeModel; 