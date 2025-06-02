import mongoose from 'mongoose';

export interface IPrize {
    _id?: string;
    prizeCode?: string; // Código único no formato Snowflake ID
    name: string;
    description?: string;
    categoryId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    image: string;
    images: string[];
    value: string;
    createdAt?: Date;
    updatedAt?: Date;
  }


  export interface ICategory {
    _id?: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }