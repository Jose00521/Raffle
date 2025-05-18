import mongoose from 'mongoose';
import { CampaignStatsHistory } from '@/models/CampaignStatsHistory';
import { CreatorStatsHistory } from '@/models/CreatorStatsHistory';
import { ParticipantStatsHistory } from '@/models/ParticipantStatsHistory';
import Campaign from '@/models/Campaign';

class StatisticsRepository {
  /**
   * Atualiza as estatísticas da campanha com base em um pagamento
   */
  async updateCampaignStats(campaignId: string, payment: any): Promise<any> {
    try {
      // Buscar informações da campanha
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        throw new Error(`Campanha não encontrada: ${campaignId}`);
      }
      
      // Obter ou criar o snapshot do dia atual
      const snapshot = await CampaignStatsHistory.getOrCreateTodaySnapshot(
        campaignId, 
        campaign.createdBy,
        campaign.status,
        campaign.totalNumbers
      );
      
      // Atualizar total de números vendidos e receita
      snapshot.soldNumbers += payment.numbersCount;
      snapshot.totalRevenue += payment.amount;
      
      // Atualizar contadores do período
      snapshot.periodNumbersSold += payment.numbersCount;
      snapshot.periodRevenue += payment.amount;
      
      // Calcular porcentagem completa
      snapshot.percentComplete = (snapshot.soldNumbers / snapshot.totalNumbers) * 100;
      
      // Verificar se é um novo participante
      const isNewParticipant = await this.isNewParticipant(campaignId, payment.userId);
      if (isNewParticipant) {
        snapshot.uniqueParticipants += 1;
        snapshot.periodNewParticipants += 1;
      }
      
      // Recalcular números disponíveis
      snapshot.availableNumbers = snapshot.totalNumbers - snapshot.soldNumbers - snapshot.reservedNumbers;
      
      // Atualizar timestamp da última atualização
      snapshot.lastUpdated = new Date();
      
      // Salvar alterações
      await snapshot.save();
      
      return snapshot;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas da campanha:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza as estatísticas do criador com base em um pagamento
   */
  async updateCreatorStats(creatorId: string, payment: any, campaignTitle: string): Promise<any> {
    try {
      // Obter ou criar o snapshot do dia atual
      const snapshot = await CreatorStatsHistory.getOrCreateTodaySnapshot(creatorId);
      
      // Atualizar totais
      snapshot.totalRevenue += payment.amount;
      snapshot.totalNumbersSold += payment.numbersCount;
      
      // Atualizar contadores do período
      snapshot.periodRevenue += payment.amount;
      snapshot.periodNumbersSold += payment.numbersCount;
      
      // Verificar se é um novo participante
      const isNewParticipant = await this.isNewParticipant(payment.campaignId, payment.userId);
      if (isNewParticipant) {
        snapshot.totalParticipants += 1;
        snapshot.periodNewParticipants += 1;
      }
      
      // Atualizar timestamp da última atualização
      snapshot.lastUpdated = new Date();
      
      // Atualizar distribuição de receita por dia da semana
      const dayOfWeek = new Date().getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const day = dayNames[dayOfWeek] as keyof typeof snapshot.revenueByDayOfWeek;
      snapshot.revenueByDayOfWeek[day] += payment.amount;
      
      // Atualizar lista de top campanhas
      await this.updateTopCampaigns(snapshot, payment.campaignId, campaignTitle, payment.amount, payment.numbersCount);
      
      // Salvar alterações
      await snapshot.save();
      
      return snapshot;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do criador:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza as estatísticas do participante com base em um pagamento
   */
  async updateParticipantStats(userId: string, payment: any, campaignTitle: string): Promise<any> {
    try {
      // Obter ou criar o snapshot do dia atual
      const snapshot = await ParticipantStatsHistory.getOrCreateTodaySnapshot(userId);
      
      // Atualizar totais
      snapshot.participationCount += 1;
      snapshot.totalSpent += payment.amount;
      snapshot.totalNumbersOwned += payment.numbersCount;
      
      // Atualizar contadores do período
      snapshot.periodParticipations += 1;
      snapshot.periodSpent += payment.amount;
      snapshot.periodNumbersPurchased += payment.numbersCount;
      
      // Calcular valor médio do ticket
      snapshot.avgTicketValue = snapshot.totalSpent / snapshot.participationCount;
      
      // Atualizar dados da participação mais recente
      snapshot.lastParticipation = {
        campaignId: new mongoose.Types.ObjectId(payment.campaignId),
        campaignTitle,
        amount: payment.amount,
        numbersCount: payment.numbersCount,
        date: new Date()
      };
      
      // Atualizar timestamp da última atualização
      snapshot.lastUpdated = new Date();
      
      // Atualizar lista de top campanhas
      await this.updateParticipantTopCampaigns(snapshot, payment.campaignId, campaignTitle, payment.amount, payment.numbersCount);
      
      // Salvar alterações
      await snapshot.save();
      
      return snapshot;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do participante:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se este é o primeiro pagamento do usuário para a campanha
   */
  private async isNewParticipant(campaignId: string, userId: string): Promise<boolean> {
    try {
      const previousPaymentsCount = await mongoose.connection.collection('payments').countDocuments({
        campaignId: new mongoose.Types.ObjectId(campaignId),
        userId: new mongoose.Types.ObjectId(userId),
        status: 'confirmed',
        createdAt: { $lt: new Date() }
      });
      
      return previousPaymentsCount === 0;
    } catch (error) {
      console.error('Erro ao verificar se é novo participante:', error);
      return false;
    }
  }
  
  /**
   * Atualiza a lista de top campanhas do criador
   */
  private async updateTopCampaigns(snapshot: any, campaignId: string, title: string, amount: number, numbersCount: number): Promise<void> {
    try {
      // Verificar se a campanha já está na lista
      const existingIndex = snapshot.topCampaigns.findIndex(
        (c: any) => c.campaignId.toString() === campaignId
      );
      
      if (existingIndex >= 0) {
        // Atualizar campanha existente
        snapshot.topCampaigns[existingIndex].revenue += amount;
        snapshot.topCampaigns[existingIndex].numbersSold += numbersCount;
        
        // Recalcular taxa de conclusão
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
          snapshot.topCampaigns[existingIndex].completionRate = 
            (snapshot.topCampaigns[existingIndex].numbersSold / campaign.totalNumbers) * 100;
        }
      } else {
        // Adicionar nova campanha
        const campaign = await Campaign.findById(campaignId);
        if (campaign) {
          snapshot.topCampaigns.push({
            campaignId: new mongoose.Types.ObjectId(campaignId),
            title,
            revenue: amount,
            numbersSold: numbersCount,
            completionRate: (numbersCount / campaign.totalNumbers) * 100
          });
        }
      }
      
      // Ordenar por receita e limitar a 5
      snapshot.topCampaigns.sort((a: any, b: any) => b.revenue - a.revenue);
      if (snapshot.topCampaigns.length > 5) {
        snapshot.topCampaigns = snapshot.topCampaigns.slice(0, 5);
      }
    } catch (error) {
      console.error('Erro ao atualizar top campanhas:', error);
    }
  }
  
  /**
   * Atualiza a lista de top campanhas do participante
   */
  private async updateParticipantTopCampaigns(snapshot: any, campaignId: string, title: string, amount: number, numbersCount: number): Promise<void> {
    try {
      // Verificar se a campanha já está na lista
      const existingIndex = snapshot.topCampaigns.findIndex(
        (c: any) => c.campaignId.toString() === campaignId
      );
      
      if (existingIndex >= 0) {
        // Atualizar campanha existente
        snapshot.topCampaigns[existingIndex].spent += amount;
        snapshot.topCampaigns[existingIndex].numbersCount += numbersCount;
      } else {
        // Adicionar nova campanha
        snapshot.topCampaigns.push({
          campaignId: new mongoose.Types.ObjectId(campaignId),
          title,
          spent: amount,
          numbersCount: numbersCount
        });
      }
      
      // Ordenar por valor gasto e limitar a 5
      snapshot.topCampaigns.sort((a: any, b: any) => b.spent - a.spent);
      if (snapshot.topCampaigns.length > 5) {
        snapshot.topCampaigns = snapshot.topCampaigns.slice(0, 5);
      }
    } catch (error) {
      console.error('Erro ao atualizar top campanhas do participante:', error);
    }
  }
  
  /**
   * Obtém o snapshot mais recente para uma campanha
   */
  async getLatestCampaignSnapshot(campaignId: string): Promise<any> {
    return await CampaignStatsHistory.getLatestSnapshot(campaignId);
  }
  
  /**
   * Obtém o snapshot mais recente para um criador
   */
  async getLatestCreatorSnapshot(creatorId: string): Promise<any> {
    return await CreatorStatsHistory.getLatestSnapshot(creatorId);
  }
  
  /**
   * Obtém o snapshot mais recente para um participante
   */
  async getLatestParticipantSnapshot(participantId: string): Promise<any> {
    return await ParticipantStatsHistory.getLatestSnapshot(participantId);
  }
  
  /**
   * Obtém snapshots para um período específico
   */
  async getCampaignStatsByPeriod(campaignId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await CampaignStatsHistory.getSnapshotsByPeriod(campaignId, startDate, endDate);
  }
  
  /**
   * Obtém snapshots para um período específico de um criador
   */
  async getCreatorStatsByPeriod(creatorId: string, startDate: Date, endDate: Date): Promise<any[]> {
    return await CreatorStatsHistory.getSnapshotsByPeriod(creatorId, startDate, endDate);
  }
  
  /**
   * Obtém estatísticas agregadas de um criador para um período
   */
  async getCreatorAggregatedStats(creatorId: string, startDate: Date, endDate: Date): Promise<any> {
    return await CreatorStatsHistory.getAggregatedStats(creatorId, startDate, endDate);
  }
}

export default new StatisticsRepository(); 