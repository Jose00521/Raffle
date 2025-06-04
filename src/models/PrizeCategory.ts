import mongoose from 'mongoose';
import { ICategory } from './interfaces/IPrizeInterfaces';


const PrizeCategorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
    },
    categoryCode: {
      type: String,
      trim: true,
    }
  },
  {
    timestamps: true,
    collection: 'prize_categories'
  }
);

// Índices para otimização de consultas
PrizeCategorySchema.index({ name: 1 }, { unique: true });
PrizeCategorySchema.index({ categoryCode: 1 }, { unique: true });
PrizeCategorySchema.index({ createdAt: -1 });
PrizeCategorySchema.index({ name: 'text' }); // Para busca textual de categorias

export default mongoose.models.PrizeCategory || mongoose.model<ICategory>('PrizeCategory', PrizeCategorySchema); 