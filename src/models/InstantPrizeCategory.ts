import mongoose from 'mongoose';
import { IInstantPrizeCategory } from './interfaces/IInstantPrizeInterfaces';


const InstantPrizeCategorySchema = new mongoose.Schema<IInstantPrizeCategory>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      unique: true
    }
  },
  {
    timestamps: true,
    collection: 'instant_prize_categories'
  }
);

// Índices para otimização de consultas
InstantPrizeCategorySchema.index({ name: 1 }, { unique: true });
InstantPrizeCategorySchema.index({ createdAt: -1 });
InstantPrizeCategorySchema.index({ name: 'text' }); // Para busca textual de categorias

export default mongoose.models.InstantPrizeCategory || mongoose.model<IInstantPrizeCategory>('InstantPrizeCategory', InstantPrizeCategorySchema); 