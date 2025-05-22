import mongoose from 'mongoose';


export enum NumberStatusEnum {
    AVAILABLE = 'available',
    RESERVED = 'reserved',
    PAID = 'paid',
    EXPIRED = 'expired'
  }
  
  export interface INumberStatus {
    _id?: string;
    campaignId?: mongoose.Types.ObjectId | string;
    number: number;
    status: NumberStatusEnum;
    userId?: mongoose.Types.ObjectId | string;
    reservedAt?: Date;
    paidAt?: Date;
    expiresAt?: Date;
    metadata?: Record<string, any>; // Para informações adicionais flexíveis
  }
  