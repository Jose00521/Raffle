import mongoose from 'mongoose';
import { IPrize } from './IPrizeInterfaces';
import { IWinner } from './IWinnerInterfaces';

export enum CampaignStatusEnum {
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED'
  }


  export interface INumberPackageCampaign {
    _id?: string;
    name: string;     
    campaignCode?: string;      // Nome do pacote (ex: "Pacote Bronze", "Pacote Prata", "Pacote Ouro")
    description?: string;
    isCombo?: boolean;
    quantity: number;       // Quantidade de números no pacote
    price: number;          // Preço total do pacote
    discount?: number;    
    individualNumberPrice?: number;  // Desconto percentual em relação à compra individual
    isActive: boolean;      // Se o pacote está disponível para compra
    highlight?: boolean;    // Se o pacote deve ser destacado (pacote recomendado)
    order?: number;         // Ordem de exibição
    maxPerUser?: number;    // Limite de compra por usuário (opcional)
    totalPrice?: number;
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
    winnerPositions: number;
    coverImage: File | string;
    images: File[] | string[];
    individualNumberPrice: number;
    minNumbersPerUser: number;
    maxNumbersPerUser: number;
    prizes: Array<IPrize>;
    //affiliates: Array<IUser>;
    returnExpected?: string;
    totalNumbers: number;
    drawDate: Date;
    canceled: Boolean; 
    status: CampaignStatusEnum; // Os valores possíveis são: "PENDING", "ACTIVE", "COMPLETED"
    isScheduled: boolean;
    scheduledActivationDate: Date | null;
    winners: Array<IWinner>;
    numberPackages: Array<INumberPackage>;
    enablePackages: boolean;
    // Prêmios distribuídos por posição
    prizeDistribution?: Array<{
      position: number;
      prizes: Array<mongoose.Types.ObjectId | string | IPrize>;
      description?: string;
    }>;
    createdAt: Date;
    updatedAt: Date;
    activatedAt: Date | null;
    // Estatísticas calculadas
    stats?: {
      available: number;
      reserved: number | null;
      sold: number;
      percentComplete: number;
      totalRevenue: number;
      totalParticipants: number;
      totalWins: number;
      totalPrizes: number;
    };
    // Propriedades adicionais para a página de detalhes
    flashOfferTimer?: number; // Tempo em minutos para o timer de oferta relâmpago
    regulation?: string;
  }

  interface CampaignModel extends mongoose.Model<ICampaign> {
    findByCampaignCode(campaignCode: string): Promise<ICampaign | null>;
    findActiveByCreator(creatorId: mongoose.Types.ObjectId | string): Promise<ICampaign[]>;
  }