import mongoose from 'mongoose';
import { IPrize } from './IPrizeInterfces';
import { IWinner } from './IWinnerInterfaces';

export enum CampaignStatusEnum {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING'
  }
  
  export interface INumberPackage {
    _id?: string;
    name: string;           // Nome do pacote (ex: "Pacote Bronze", "Pacote Prata", "Pacote Ouro")
    description?: string;   // Descrição opcional do pacote
    quantity: number;       // Quantidade de números no pacote
    price: number;          // Preço total do pacote
    discount?: number;      // Desconto percentual em relação à compra individual
    isActive: boolean;      // Se o pacote está disponível para compra
    highlight?: boolean;    // Se o pacote deve ser destacado (pacote recomendado)
    order?: number;         // Ordem de exibição
    maxPerUser?: number;    // Limite de compra por usuário (opcional)
  }
  
  // Interface principal da Rifa
  export interface ICampaign {
    _id?: string;
    campaignCode?: string;
    createdBy: mongoose.Types.ObjectId | null;
    title: string;
    description: string;
    price: number;
    prizes: Array<IPrize>;
    //affiliates: Array<IUser>;
    returnExpected?: string;
    totalNumbers: number;
    drawDate: Date;
    canceled: Boolean; 
    status: CampaignStatusEnum; // Os valores possíveis são: "PENDING", "ACTIVE", "COMPLETED"
    scheduledActivationDate: Date | null;
    winnerNumber: number | null;
    winnerUser?: mongoose.Types.ObjectId | null;
    winner: Array<IWinner>;
    numberPackages: Array<INumberPackage>;
    createdAt: Date;
    updatedAt: Date;
    activatedAt: Date | null;
    // Estatísticas calculadas
    stats?: {
      available: number;
      reserved: number | null;
      sold: number;
      percentComplete: number;
    };
    // Propriedades adicionais para a página de detalhes
    
    regulation?: string;
  }

  interface CampaignModel extends mongoose.Model<ICampaign> {
    findByCampaignCode(campaignCode: string): Promise<ICampaign | null>;
    findActiveByCreator(creatorId: mongoose.Types.ObjectId | string): Promise<ICampaign[]>;
  }