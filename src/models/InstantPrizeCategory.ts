import mongoose from 'mongoose';

export interface IInstantPrizeCategory {
  _id?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

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

export default mongoose.models.InstantPrizeCategory || mongoose.model<IInstantPrizeCategory>('InstantPrizeCategory', InstantPrizeCategorySchema); 