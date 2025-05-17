import { User, Participant, Creator } from '../../models/User';
import Raffle from '../../models/Campaign';
import Purchase from '../../models/Prize';

export class StatisticsService {
  // Update participant statistics incrementally when a purchase is made
  async updateParticipantStatsOnPurchase(userId: string, rifaId: string, amount: number) {
    await Participant.findByIdAndUpdate(userId, {
      $inc: {
        'statistics.participationCount': 1,
        'statistics.totalSpent': amount
      },
      $set: {
        'statistics.lastParticipation': new Date()
      }
    });
  }

  // Update creator statistics when a raffle is created
  async updateCreatorStatsOnRaffleCreation(creatorId: string) {
    await Creator.findByIdAndUpdate(creatorId, {
      $inc: {
        'statistics.rafflesCreated': 1,
        'statistics.activeRaffles': 1
      },
      $set: {
        'statistics.lastRaffleCreated': new Date()
      }
    });
  }

  // Update statistics when a raffle ends
  async updateStatsOnRaffleEnd(rifaId: string) {
    const raffle = await Raffle.findById(rifaId).lean();
    if (!raffle) return;

    // Update winner's stats
    if (raffle.winningUserId) {
      await Participant.findByIdAndUpdate(raffle.winningUserId, {
        $inc: { 'statistics.rafflesWon': 1 }
      });
    }

    // Update creator's stats
    await Creator.findByIdAndUpdate(raffle.creatorId, {
      $inc: { 
        'statistics.activeRaffles': -1,
        'statistics.totalRevenue': raffle.totalRevenue 
      }
    });

    // Update conversion rate
    await this.recalculateCreatorConversionRate(raffle.creatorId);
  }

  // Recalculate complete statistics for a participant (periodic job)
  async recalculateParticipantStats(userId: string) {
    const purchases = await Purchase.find({ userId }).lean();
    const rafflesWon = await Raffle.countDocuments({ winningUserId: userId });
    
    const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    const lastParticipation = purchases.length > 0 
      ? purchases.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
      : undefined;

    await Participant.findByIdAndUpdate(userId, {
      $set: {
        'statistics.participationCount': purchases.length,
        'statistics.totalSpent': totalSpent,
        'statistics.rafflesWon': rafflesWon,
        'statistics.lastParticipation': lastParticipation
      }
    });
  }

  // Recalculate creator conversion rate
  async recalculateCreatorConversionRate(creatorId: string) {
    const raffles = await Raffle.find({ creatorId }).lean();
    if (raffles.length === 0) return;

    const totalConversionRate = raffles.reduce((sum, raffle) => {
      return sum + (raffle.soldNumbers / raffle.totalNumbers);
    }, 0);
    
    const avgConversionRate = totalConversionRate / raffles.length;

    await Creator.findByIdAndUpdate(creatorId, {
      $set: { 'statistics.conversionRate': avgConversionRate }
    });
  }
  // Add to the statistics service
async scheduleStatsReconciliation() {
    // Run this daily or weekly via a cron job
    const participants = await Participant.find({}).select('_id');
    const creators = await Creator.find({}).select('_id');
    
    // Run batch updates with backoff to prevent overwhelming database
    for (const participant of participants) {
      await this.recalculateParticipantStats(participant._id);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay between operations
    }
    
    for (const creator of creators) {
      await this.recalculateCreatorStats(creator._id);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}