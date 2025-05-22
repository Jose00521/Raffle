import mongoose, { Model } from 'mongoose';


// Interface for the document
export interface ICampaignStatsHistory extends Document {
    campaignId: mongoose.Types.ObjectId;
    creatorId: mongoose.Types.ObjectId;
    dateKey: Date;
    lastUpdated: Date;
    totalNumbers: number;
    availableNumbers: number;
    reservedNumbers: number;
    soldNumbers: number;
    uniqueParticipants: number;
    totalRevenue: number;
    percentComplete: number;
    periodNumbersSold: number;
    periodRevenue: number;
    periodNewParticipants: number;
    avgTicketPrice: number;
    conversionRate: number;
    salesVelocity: number;
    status: 'PENDING' | 'ACTIVE' | 'COMPLETED';
    daysRemaining?: number;
    isExpired: boolean;
  }
  
  // Interface for the model with static methods
  export interface ICampaignStatsHistoryModel extends Model<ICampaignStatsHistory> {
    getLatestSnapshot(campaignId: string): Promise<ICampaignStatsHistory | null>;
    getSnapshotsByPeriod(campaignId: string, startDate: Date, endDate: Date): Promise<ICampaignStatsHistory[]>;
    getOrCreateTodaySnapshot(campaignId: string, creatorId: string, status: string, totalNumbers: number): Promise<ICampaignStatsHistory>;
  }