import mongoose from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const PrizeCategorySchema = new mongoose.Schema<ICategory>(
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
    collection: 'prize_categories'
  }
);

export default mongoose.models.PrizeCategory || mongoose.model<ICategory>('PrizeCategory', PrizeCategorySchema); 