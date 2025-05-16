import mongoose from 'mongoose';

export interface IPrize {
  _id?: string;
  name: string;
  description?: string;
  category?: mongoose.Types.ObjectId;
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
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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

export default mongoose.models.Prize || mongoose.model<IPrize>('Prize', PrizeSchema); 