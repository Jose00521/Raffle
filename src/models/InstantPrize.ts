import mongoose from 'mongoose';

// Enum para categorias
export enum InstantPrizeCategory {
  DIAMOND = 'DIAMOND',
  MASTER = 'MASTER',
  PRIME = 'PRIME'
}

export interface IInstantPrize {
  _id?: string;
  campaignId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  number: string;
  value: number;
  winner: mongoose.Types.ObjectId | null;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Schema de InstantPrize
const InstantPrizeSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
      index: true
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InstantPrizeCategory',
    },
    number: {
      type: String,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    claimed: {
      type: Boolean,
      default: false,
      index: true
    },
    claimedAt: {
      type: Date
    }
  }, 
  { 
    timestamps: true,
    collection: 'instant_prizes' 
  }
);

// Índices compostos para consultas comuns
InstantPrizeSchema.index({ campaignId: 1, number: 1 }, { unique: true });
InstantPrizeSchema.index({ campaignId: 1, category: 1 });
InstantPrizeSchema.index({ campaignId: 1, claimed: 1, category: 1 });
InstantPrizeSchema.index({ campaignId: 1, categoryId: 1, createdAt: -1 });

export default mongoose.models.InstantPrize || mongoose.model<IInstantPrize>('InstantPrize', InstantPrizeSchema); 