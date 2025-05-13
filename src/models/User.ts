import mongoose from 'mongoose';

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  password: string;
  purchasedNumbers: {
    rifaId: string;
    numbers: number[];
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Please provide your phone number'],
      trim: true,
    },
    purchasedNumbers: [
      {
        rifaId: {
          type: String,
          required: true,
        },
        numbers: [
          {
            type: Number,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 