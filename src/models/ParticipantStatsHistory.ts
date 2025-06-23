import mongoose, { Schema, Document, Model } from 'mongoose';
import { IParticipantStatsHistory } from './interfaces/IParticipantStatsHistoryInterfaces';


// Interface for the model with static methods
interface IParticipantStatsHistoryModel extends Model<IParticipantStatsHistory> {
  getLatestSnapshot(participantId: string): Promise<IParticipantStatsHistory | null>;
  getSnapshotsByPeriod(participantId: string, startDate: Date, endDate: Date): Promise<IParticipantStatsHistory[]>;
  getTopParticipantsBySpent(limit?: number, period?: number): Promise<IParticipantStatsHistory[]>;
  getOrCreateTodaySnapshot(participantId: string): Promise<IParticipantStatsHistory>;
}

const ParticipantStatsHistorySchema = new Schema({
  // Referência ao participante
  participantId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  // Data do snapshot (apenas a data, sem hora/minutos/segundos)
  dateKey: {
    type: Date,
    required: true,
    index: true
  },
  // Timestamp da última atualização
  lastUpdated: {
    type: Date,
    default: Date.now,
    required: true
  },
  
  // Estatísticas totais (valores acumulados)
  participationCount: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  activeCampaigns: { type: Number, default: 0 },
  completedCampaigns: { type: Number, default: 0 },
  totalNumbersOwned: { type: Number, default: 0 },
  rafflesWon: { type: Number, default: 0 },
  
  // Estatísticas incrementais (valores do período)
  periodParticipations: { type: Number, default: 0 },
  periodSpent: { type: Number, default: 0 },
  periodNumbersPurchased: { type: Number, default: 0 },
  periodWins: { type: Number, default: 0 },
  
  // Estatísticas de engajamento
  avgTicketValue: { type: Number, default: 0 },
  purchaseFrequency: { type: Number, default: 0 }, // Compras por semana/mês
  loyaltyScore: { type: Number, default: 0 },      // Score calculado de fidelidade
  
  // Dados da participação mais recente
  lastParticipation: {
    campaignId: { type: mongoose.Types.ObjectId, ref: 'Campaign' },
    campaignTitle: String,
    amount: Number,
    numbersCount: Number,
    date: Date
  },
  
  // Top campanhas do participante
  topCampaigns: [{
    campaignId: { type: mongoose.Types.ObjectId, ref: 'Campaign' },
    title: String,
    spent: Number,
    numbersCount: Number
  }]
}, {
  timestamps: true,
  collection: 'participant_stats_history'
});

// Índices para consultas frequentes
ParticipantStatsHistorySchema.index({ participantId: 1, dateKey: -1 }, { unique: true });
ParticipantStatsHistorySchema.index({ rafflesWon: -1 });

// Método estático para obter o último snapshot de um participante
ParticipantStatsHistorySchema.statics.getLatestSnapshot = function(participantId) {
  return this.findOne({ participantId }, {}, { sort: { dateKey: -1 } });
};

// Método estático para obter snapshots por período
ParticipantStatsHistorySchema.statics.getSnapshotsByPeriod = function(participantId, startDate, endDate) {
  const query = { 
    participantId,
    dateKey: { $gte: startDate, $lte: endDate }
  };
  
  return this.find(query).sort({ dateKey: 1 });
};

// Método para obter os melhores participantes por gastos
ParticipantStatsHistorySchema.statics.getTopParticipantsBySpent = async function(limit = 10, period = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);
  
  // Busca os últimos snapshots diários para cada participante
  const aggregation = await this.aggregate([
    { $match: { dateKey: { $gte: startDate } } },
    { $sort: { dateKey: -1 } },
    { $group: {
        _id: "$participantId",
        latestSnapshot: { $first: "$$ROOT" }
    }},
    { $sort: { "latestSnapshot.totalSpent": -1 } },
    { $limit: limit }
  ]);
  
  return aggregation.map((item: any) => item.latestSnapshot);
};

// Método para obter ou criar snapshot do dia atual
ParticipantStatsHistorySchema.statics.getOrCreateTodaySnapshot = async function(participantId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Buscar o snapshot mais recente para inicializar os valores
    const previousSnapshot = await this.findOne(
      { participantId },
      {},
      { sort: { dateKey: -1 } }
    );
    
    // Preparar os valores iniciais baseados no snapshot anterior ou com valores default
    const initialValues = {
      participantId,
      dateKey: today,
      lastUpdated: new Date(),
      
      // Usar valores do snapshot anterior ou inicializar com zeros
      participationCount: previousSnapshot ? previousSnapshot.participationCount : 0,
      totalSpent: previousSnapshot ? previousSnapshot.totalSpent : 0,
      activeCampaigns: previousSnapshot ? previousSnapshot.activeCampaigns : 0,
      completedCampaigns: previousSnapshot ? previousSnapshot.completedCampaigns : 0,
      totalNumbersOwned: previousSnapshot ? previousSnapshot.totalNumbersOwned : 0,
      rafflesWon: previousSnapshot ? previousSnapshot.rafflesWon : 0,
      
      // Resetar contadores do período
      periodParticipations: 0,
      periodSpent: 0,
      periodNumbersPurchased: 0,
      periodWins: 0,
      
      // Estatísticas de engajamento
      avgTicketValue: previousSnapshot ? previousSnapshot.avgTicketValue : 0,
      purchaseFrequency: previousSnapshot ? previousSnapshot.purchaseFrequency : 0,
      loyaltyScore: previousSnapshot ? previousSnapshot.loyaltyScore : 0,
      
      // Dados da participação mais recente e top campanhas
      lastParticipation: previousSnapshot ? previousSnapshot.lastParticipation : null,
      topCampaigns: previousSnapshot ? previousSnapshot.topCampaigns : []
    };
    
    // Usar findOneAndUpdate com upsert para evitar erros de chave duplicada
    const result = await this.findOneAndUpdate(
      { participantId, dateKey: today },
      { $setOnInsert: initialValues },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );
    
    return result;
  } catch (error) {
    console.error('Erro ao obter/criar snapshot de estatísticas do participante:', error);
    throw error;
  }
};

const ParticipantStatsHistory = (mongoose.models.ParticipantStatsHistory || 
  mongoose.model<IParticipantStatsHistory, IParticipantStatsHistoryModel>('ParticipantStatsHistory', ParticipantStatsHistorySchema)) as IParticipantStatsHistoryModel;

export { ParticipantStatsHistory, ParticipantStatsHistorySchema }; 