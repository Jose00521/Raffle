import mongoose from 'mongoose';
const Schema = mongoose.Schema;


export interface IWinner {
    _id:  mongoose.Types.ObjectId;
    campaign:  mongoose.Types.ObjectId;
    position: number;
    number: string;
    prizes:  mongoose.Types.ObjectId[];
    user:  mongoose.Types.ObjectId;
    prizesClaimed: boolean;
    awardedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const WinnerSchema = new Schema<IWinner>({
    campaign: { 
        type: Schema.Types.ObjectId, 
        ref: 'Campaign' 
    },
    position: {
        type: Number,
        required: true,
        min: 1
      },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
    number: {
        type: String,
        required: true
      },
    prizesClaimed: {
        type: Boolean,
        default: false
      },
    awardedAt: {
        type: Date,
        default: Date.now
      }
}, { timestamps: true , collection: 'winners'});

// Add these indexes

WinnerSchema.index({ campaign: 1 }); // For queries filtering by campaign
WinnerSchema.index({ winnerUser: 1 }); // For queries finding user's wins
WinnerSchema.index({ createdAt: -1 }); // For sorting by most recent

// Compound index for common query pattern
WinnerSchema.index({ campaign: 1, createdAt: -1 }); // For listing winners by campaign, sorted by date

export default mongoose.models.Winner || mongoose.model<IWinner>('Winner', WinnerSchema); 
