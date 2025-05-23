import mongoose, { Model } from 'mongoose';


// Interface for the top campaigns
export interface ITopCampaign {
    campaignId: mongoose.Types.ObjectId;
    title: string;
    revenue: number;
    numbersSold: number;
    completionRate: number;
  }
  
  // Interface for revenue by day of week
  export interface IRevenueByDayOfWeek {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
    [key: string]: number;
  }
  
  // Interface for the document
  export interface ICreatorStatsHistory extends Document {
    creatorId: mongoose.Types.ObjectId;
    dateKey: Date;
    lastUpdated: Date;
    totalCampaigns: number;
    activeCampaigns: number;
    completedCampaigns: number;
    pendingCampaigns: number;
    totalRevenue: number;
    totalNumbersSold: number;
    totalParticipants: number;
    overallCompletionRate: number;
    periodCampaignsCreated: number;
    periodRevenue: number;
    periodNumbersSold: number;
    periodNewParticipants: number;
    avgCompletionRate: number;
    avgTicketPrice: number;
    conversionRate: number;
    topCampaigns: ITopCampaign[];
    revenueByDayOfWeek: IRevenueByDayOfWeek;
  }
  
  // Interface for the model with static methods
  export interface ICreatorStatsHistoryModel extends Model<ICreatorStatsHistory> {
    getLatestSnapshot(creatorId: string): Promise<ICreatorStatsHistory | null>;
    getSnapshotsByPeriod(creatorId: string, startDate: Date, endDate: Date): Promise<ICreatorStatsHistory[]>;
    getAggregatedStats(creatorId: string, startDate: Date, endDate: Date): Promise<any>;
    getOrCreateTodaySnapshot(creatorId: string): Promise<ICreatorStatsHistory>;
  }