import mongoose from 'mongoose';

export interface ICategory {
  _id?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new mongoose.Schema<ICategory>(
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
    collection: 'categories'
  }
);

export default mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema); 