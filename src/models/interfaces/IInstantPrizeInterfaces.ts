import mongoose from 'mongoose';

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


  export interface IInstantPrizeCategory {
    _id?: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
  }