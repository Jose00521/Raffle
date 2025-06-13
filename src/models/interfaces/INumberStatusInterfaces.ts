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
    number: string;
    status: NumberStatusEnum;
    userId?: mongoose.Types.ObjectId | string;
    paymentId?: mongoose.Types.ObjectId | string;
    reservedAt?: Date;
    paidAt?: Date;
    expiresAt?: Date;
    metadata?: Record<string, any>; // Para informações adicionais flexíveis
  }
  


  export interface InstantPrizeData {
    type: 'money' | 'item';
    categoryId: string;
    quantity?: number;      // Para money prizes
    number?: string;  
    numbers?: string[];      // Para item prizes (número temporário)
    value: number;
    prizeId?: string;       // Para item prizes (Snowflake ID)
    name?: string;          // Para item prizes
    image?: string;         // Para item prizes
  }
  
  // Interface para o formato de entrada do frontend
  export interface InstantPrizesPayload {
    prizes: InstantPrizeData[];
  }