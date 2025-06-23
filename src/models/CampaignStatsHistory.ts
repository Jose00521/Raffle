import mongoose, { Schema } from 'mongoose';
import { ICampaignStatsHistory, ICampaignStatsHistoryModel } from './interfaces/ICampaignStatsHistoryInterfaces';


const CampaignStatsHistorySchema = new Schema({
  // Referência à campanha
  campaignId: {
    type: mongoose.Types.ObjectId,
    ref: 'Campaign',
    required: true,
    index: true
  },
  // Referência ao criador da campanha
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
  totalNumbers: { type: Number, default: 0 },
  availableNumbers: { type: Number, default: 0 },
  reservedNumbers: { type: Number, default: 0 },
  soldNumbers: { type: Number, default: 0 },
  uniqueParticipants: { type: Number, default: 0 },
  totalRevenue: { type: Number, default: 0 },
  percentComplete: { type: Number, default: 0 },
  
  // Estatísticas incrementais (valores do período)
  periodNumbersSold: { type: Number, default: 0 },
  periodRevenue: { type: Number, default: 0 },
  periodNewParticipants: { type: Number, default: 0 },
  
  // Estatísticas adicionais
  avgTicketPrice: { type: Number, default: 0 },
  conversionRate: { type: Number, default: 0 }, // % de reservas convertidas em vendas
  salesVelocity: { type: Number, default: 0 },  // números vendidos por hora
  
  // Metadados do snapshot
  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'COMPLETED'],
    required: true
  },
  daysRemaining: { type: Number }, // Dias até o sorteio
  isExpired: { type: Boolean, default: false }
}, {
  timestamps: true,
  collection: 'campaign_stats_history'
});

// Índices para consultas frequentes
CampaignStatsHistorySchema.index({ campaignId: 1, dateKey: -1 }, { unique: true });
CampaignStatsHistorySchema.index({ creatorId: 1, dateKey: -1 });

// Método estático para obter o último snapshot de uma campanha
CampaignStatsHistorySchema.statics.getLatestSnapshot = function(campaignId) {
  return this.findOne({ campaignId }, {}, { sort: { dateKey: -1 } });
};

// Método estático para obter snapshots por período
CampaignStatsHistorySchema.statics.getSnapshotsByPeriod = function(campaignId, startDate, endDate) {
  const query = { 
    campaignId,
    dateKey: { $gte: startDate, $lte: endDate }
  };
  
  return this.find(query).sort({ dateKey: 1 });
};

// Método para obter snapshot do dia atual ou criar um novo
CampaignStatsHistorySchema.statics.getOrCreateTodaySnapshot = async function(campaignId, creatorId, status, totalNumbers) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  try {
    // Buscar o snapshot mais recente para inicializar os valores
    const previousSnapshot = await this.findOne(
      { campaignId },
      {},
      { sort: { dateKey: -1 } }
    );
    
    // Preparar os valores iniciais baseados no snapshot anterior ou com valores default
    const initialValues = {
      campaignId,
      creatorId,
      dateKey: today,
      lastUpdated: new Date(),
      totalNumbers,
      
      // Usar valores do snapshot anterior ou inicializar com zeros
      availableNumbers: previousSnapshot ? previousSnapshot.availableNumbers : totalNumbers,
      reservedNumbers: previousSnapshot ? previousSnapshot.reservedNumbers : 0,
      soldNumbers: previousSnapshot ? previousSnapshot.soldNumbers : 0,
      uniqueParticipants: previousSnapshot ? previousSnapshot.uniqueParticipants : 0,
      totalRevenue: previousSnapshot ? previousSnapshot.totalRevenue : 0,
      percentComplete: previousSnapshot ? previousSnapshot.percentComplete : 0,
      
      // Resetar contadores do período
      periodNumbersSold: 0,
      periodRevenue: 0,
      periodNewParticipants: 0,
      
      // Metadados
      status,
      daysRemaining: previousSnapshot ? previousSnapshot.daysRemaining : 0,
      isExpired: previousSnapshot ? previousSnapshot.isExpired : false
    };
    
    // Usar findOneAndUpdate com upsert para evitar erros de chave duplicada
    const result = await this.findOneAndUpdate(
      { campaignId, dateKey: today },
      { $setOnInsert: initialValues },
      { 
        new: true, 
        upsert: true,
        runValidators: true
      }
    );
    
    return result;
  } catch (error) {
    console.error('Erro ao obter/criar snapshot de estatísticas:', error);
    throw error;
  }
};

const CampaignStatsHistory = (mongoose.models.CampaignStatsHistory || 
  mongoose.model<ICampaignStatsHistory, ICampaignStatsHistoryModel>('CampaignStatsHistory', CampaignStatsHistorySchema)) as ICampaignStatsHistoryModel;

export { CampaignStatsHistory, CampaignStatsHistorySchema }; 