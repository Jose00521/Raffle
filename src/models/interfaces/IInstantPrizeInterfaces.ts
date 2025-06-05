import mongoose from 'mongoose';

export enum InstantPrizeCategory {
    DIAMOND = 'DIAMOND',
    MASTER = 'MASTER',
    PRIME = 'PRIME'
}

// 🎯 INTERFACE BASE para prêmios instantâneos
export interface IInstantPrize {
  _id?: string;
  campaignId: mongoose.Types.ObjectId;
  categoryId: string; // Mudado para string para compatibilidade
  number: string;
  value: number;
  type: 'money' | 'item'; // 🔑 Campo discriminator
  winner: mongoose.Types.ObjectId | null;
  claimed: boolean;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// 💰 INTERFACE ESPECÍFICA para prêmios em dinheiro
export interface IMoneyPrize extends IInstantPrize {
  type: 'money';
}

// 🎁 INTERFACE ESPECÍFICA para prêmios físicos
export interface IItemPrize extends IInstantPrize {
  type: 'item';
  categoryId: string;
  prizeRef?: mongoose.Types.ObjectId;
}

// 🔄 UNION TYPE para type safety
export type InstantPrizeUnion = IMoneyPrize | IItemPrize;

// 📝 TIPOS para criação de prêmios
export interface CreateMoneyPrizeData {
  campaignId: string;
  categoryId: string;
  numbers: string[];
  value: number;
}

export interface CreateItemPrizeData {
  campaignId: string;
  categoryId: string;
  prizeRef?: string;
}

// 🎯 ESTRUTURA HÍBRIDA SIMPLIFICADA para o frontend
export interface InstantPrizeRequest {
  prizes: Array<SpecificItemPrize | MoneyPrizeCategory>;
}

// 🎁 Prêmio físico específico (já com número definido)
export interface SpecificItemPrize {
  type: 'item';
  categoryId: string;
  prizeId: string;
}

// 💰 Categoria de prêmios em dinheiro (backend gera números)
export interface MoneyPrizeCategory {
  type: 'money';
  categoryId: string;
  quantity: number;      // Quantidade de prêmios a gerar
  value: number;         // Valor de cada prêmio
}

// 🔄 Union type para type safety
export type InstantPrizeConfigUnion = SpecificItemPrize | MoneyPrizeCategory;

// Interface para categoria de prêmios (se ainda for necessária)
export interface IInstantPrizeCategory {
  _id?: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}