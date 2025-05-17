import mongoose from 'mongoose';

export interface IPrize {
  _id?: string;
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


PrizeSchema.index({ name: 'text', description: 'text' }); // Text search for name and description
PrizeSchema.index({ category: 1 }); // For filtering prizes by category
PrizeSchema.index({ value: 1 }); // For sorting/filtering by value
PrizeSchema.index({ createdAt: -1 }); // For recent prizes queries

export default mongoose.models.Prize || mongoose.model<IPrize>('Prize', PrizeSchema); 