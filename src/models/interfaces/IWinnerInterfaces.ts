import mongoose from 'mongoose';

export interface IWinner {
    _id?: mongoose.Types.ObjectId;
    winnerCode?: string; // Snowflake ID único
    campaignId: mongoose.Types.ObjectId;
    position: number;
    number: string;
    prizes: mongoose.Types.ObjectId[];
    userId: mongoose.Types.ObjectId;
    prizesClaimed: boolean;
    awardedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}