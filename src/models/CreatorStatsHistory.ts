import mongoose, { Schema, Document, Model } from 'mongoose';

// Interface for the top campaigns
interface ITopCampaign {
  campaignId: mongoose.Types.ObjectId;
  title: string;
  revenue: number;
  numbersSold: number;
  completionRate: number;
}

// Interface for revenue by day of week
interface IRevenueByDayOfWeek {
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
interface ICreatorStatsHistory extends Document {
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
interface ICreatorStatsHistoryModel extends Model<ICreatorStatsHistory> {
  getLatestSnapshot(creatorId: string): Promise<ICreatorStatsHistory | null>;
  getSnapshotsByPeriod(creatorId: string, startDate: Date, endDate: Date): Promise<ICreatorStatsHistory[]>;
  getAggregatedStats(creatorId: string, startDate: Date, endDate: Date): Promise<any>;
  getOrCreateTodaySnapshot(creatorId: string): Promise<ICreatorStatsHistory>;
}

const CreatorStatsHistorySchema = new Schema({
  // Referência ao criador
  creatorId: {
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
  totalCampaigns: { type: Number, default: 0 },
  activeCampaigns: { type: Number, default: 0 },
  completedCampaigns: { type: Number, default: 0 },
  pendingCampaigns: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  totalNumbersSold: { type: Number, default: 0 },
  totalParticipants: { type: Number, default: 0 },
  overallCompletionRate: { type: Number, default: 0 },
  
  // Estatísticas incrementais (valores do período)
  periodCampaignsCreated: { type: Number, default: 0 },
  periodRevenue: { type: Number, default: 0 },
  periodNumbersSold: { type: Number, default: 0 },
  periodNewParticipants: { type: Number, default: 0 },
  
  // Estatísticas de desempenho
  avgCompletionRate: { type: Number, default: 0 },
  avgTicketPrice: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 },
  
  // Top performers do período
  topCampaigns: [{
    campaignId: { type: mongoose.Types.ObjectId, ref: 'Campaign' },
    title: String,
    revenue: Number,
    numbersSold: Number,
    completionRate: Number
  }],
  
  // Distribuição de receita por dia da semana
  revenueByDayOfWeek: {
    monday: { type: Number, default: 0 },
    tuesday: { type: Number, default: 0 },
    wednesday: { type: Number, default: 0 },
    thursday: { type: Number, default: 0 },
    friday: { type: Number, default: 0 },
    saturday: { type: Number, default: 0 },
    sunday: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Índices para consultas frequentes
CreatorStatsHistorySchema.index({ creatorId: 1, dateKey: -1 }, { unique: true });

// Método estático para obter o último snapshot de um criador
CreatorStatsHistorySchema.statics.getLatestSnapshot = function(creatorId) {
  return this.findOne({ creatorId }, {}, { sort: { dateKey: -1 } });
};

// Método estático para obter snapshots por período
CreatorStatsHistorySchema.statics.getSnapshotsByPeriod = function(creatorId, startDate, endDate) {
  const query = { 
    creatorId,
    dateKey: { $gte: startDate, $lte: endDate }
  };
  
  return this.find(query).sort({ dateKey: 1 });
};

// Método para obter estatísticas agregadas por período
CreatorStatsHistorySchema.statics.getAggregatedStats = async function(creatorId, startDate, endDate) {
  const snapshots = await this.find({
    creatorId,
    dateKey: { $gte: startDate, $lte: endDate }
  }).sort({ dateKey: 1 });
  
  if (snapshots.length === 0) return null;
  
  // Snapshot inicial e final para comparação
  const initial = snapshots[0];
  const latest = snapshots[snapshots.length - 1];
  
  // Calcular valores agregados do período
  let periodRevenue = 0;
  let periodNumbersSold = 0;
  let periodNewParticipants = 0;
  
  snapshots.forEach((snapshot: any) => {
    periodRevenue += snapshot.periodRevenue || 0;
    periodNumbersSold += snapshot.periodNumbersSold || 0;
    periodNewParticipants += snapshot.periodNewParticipants || 0;
  });
  
  return {
    startDate,
    endDate,
    initial: {
      totalRevenue: initial.totalRevenue,
      totalNumbersSold: initial.totalNumbersSold,
      totalParticipants: initial.totalParticipants
    },
    latest: {
      totalRevenue: latest.totalRevenue,
      totalNumbersSold: latest.totalNumbersSold,
      totalParticipants: latest.totalParticipants,
      activeCampaigns: latest.activeCampaigns
    },
    period: {
      revenue: periodRevenue,
      numbersSold: periodNumbersSold,
      newParticipants: periodNewParticipants
    },
    growth: {
      revenue: latest.totalRevenue - initial.totalRevenue,
      numbersSold: latest.totalNumbersSold - initial.totalNumbersSold,
      participants: latest.totalParticipants - initial.totalParticipants
    }
  };
};

// Método para obter ou criar snapshot do dia atual
CreatorStatsHistorySchema.statics.getOrCreateTodaySnapshot = async function(creatorId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let snapshot = await this.findOne({ creatorId, dateKey: today });
  
  if (!snapshot) {
    // Buscar o snapshot mais recente para inicializar os valores
    const previousSnapshot = await this.findOne(
      { creatorId },
      {},
      { sort: { dateKey: -1 } }
    );
    
    // Criar novo snapshot baseado no anterior ou com valores iniciais
    snapshot = new this({
      creatorId,
      dateKey: today,
      lastUpdated: new Date(),
      
      // Usar valores do snapshot anterior ou inicializar com zeros
      totalCampaigns: previousSnapshot ? previousSnapshot.totalCampaigns : 0,
      activeCampaigns: previousSnapshot ? previousSnapshot.activeCampaigns : 0,
      completedCampaigns: previousSnapshot ? previousSnapshot.completedCampaigns : 0,
      pendingCampaigns: previousSnapshot ? previousSnapshot.pendingCampaigns : 0,
      totalRevenue: previousSnapshot ? previousSnapshot.totalRevenue : 0,
      totalNumbersSold: previousSnapshot ? previousSnapshot.totalNumbersSold : 0,
      totalParticipants: previousSnapshot ? previousSnapshot.totalParticipants : 0,
      overallCompletionRate: previousSnapshot ? previousSnapshot.overallCompletionRate : 0,
      
      // Resetar contadores do período
      periodCampaignsCreated: 0,
      periodRevenue: 0,
      periodNumbersSold: 0,
      periodNewParticipants: 0,
      
      // Estatísticas adicionais
      avgCompletionRate: previousSnapshot ? previousSnapshot.avgCompletionRate : 0,
      avgTicketPrice: previousSnapshot ? previousSnapshot.avgTicketPrice : 0,
      conversionRate: previousSnapshot ? previousSnapshot.conversionRate : 0,
      
      // Top performers e distribuição de receita
      topCampaigns: previousSnapshot ? previousSnapshot.topCampaigns : [],
      revenueByDayOfWeek: previousSnapshot ? previousSnapshot.revenueByDayOfWeek : {
        monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0
      }
    });
    
    await snapshot.save();
  }
  
  return snapshot;
};

const CreatorStatsHistory = (mongoose.models.CreatorStatsHistory || 
  mongoose.model<ICreatorStatsHistory, ICreatorStatsHistoryModel>('CreatorStatsHistory', CreatorStatsHistorySchema)) as ICreatorStatsHistoryModel;

export { CreatorStatsHistory, CreatorStatsHistorySchema }; 