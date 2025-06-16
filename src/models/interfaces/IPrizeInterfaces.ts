import mongoose from 'mongoose';

export interface IPrize {
    _id?: string;
    prizeCode?: string; // Código único no formato Snowflake ID
    name: string;
    description?: string;
    categoryId?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    image: string | File;
    images: Array<string | File>;
    value: string;
    createdAt?: Date;
    updatedAt?: Date;
  }


  
export interface IPrizeInitialData {
  _id?: string;
  prizeCode?: string; // Código único no formato Snowflake ID
  name: string;
  description?: string;
  categoryId:{
    categoryCode: string;
    name: string;
  }
  createdBy?: mongoose.Types.ObjectId;
  image: string | File;
  images: Array<string | File>;
  value: string;
  createdAt?: Date;
  updatedAt?: Date;
}


  


  export interface ICategory {
    _id?: string;
    name: string;
    categoryCode: string;
    createdAt: Date;
    updatedAt: Date;
  }