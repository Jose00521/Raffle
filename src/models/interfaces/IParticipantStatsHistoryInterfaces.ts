import mongoose, { Document } from 'mongoose';



// Interface for the last participation
export interface ILastParticipation {
    campaignId: mongoose.Types.ObjectId;
    campaignTitle: string;
    amount: number;
    numbersCount: number;
    date: Date;
  }
  
  // Interface for top campaigns
  export interface ITopCampaign {
    campaignId: mongoose.Types.ObjectId;
    title: string;
    spent: number;
    numbersCount: number;
  }
  
  // Interface for the document
  export interface IParticipantStatsHistory extends Document {
    participantId: mongoose.Types.ObjectId;
    dateKey: Date;
    lastUpdated: Date;
    participationCount: number;
    totalSpent: number;
    activeCampaigns: number;
    completedCampaigns: number;
    totalNumbersOwned: number;
    rafflesWon: number;
    periodParticipations: number;
    periodSpent: number;
    periodNumbersPurchased: number;
    periodWins: number;
    avgTicketValue: number;
    purchaseFrequency: number;
    loyaltyScore: number;
    lastParticipation: ILastParticipation | null;
    topCampaigns: ITopCampaign[];
    save(options?: any): Promise<this>;
  }