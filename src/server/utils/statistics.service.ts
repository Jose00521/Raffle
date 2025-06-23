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
      
      // Verificar se este é um novo participante
      const isNewParticipant = await this.isNewParticipant(campaignId, payment.userId);
      
      // Usar updateOne com operadores atômicos para evitar condições de corrida
      const result = await CampaignStatsHistory.updateOne(
        { _id: snapshot._id },
        {
          $inc: {
            // Incrementar contadores
            soldNumbers: payment.numbersCount,
            totalRevenue: payment.amount,
            periodNumbersSold: payment.numbersCount,
            periodRevenue: payment.amount,
            uniqueParticipants: isNewParticipant ? 1 : 0,
            periodNewParticipants: isNewParticipant ? 1 : 0
          },
          $set: {
            // Atualizar timestamp
            lastUpdated: new Date()
          },
          $setOnInsert: {
            // Garantir que esses campos existam caso seja uma inserção
            campaignId: campaignId,
            creatorId: campaign.createdBy,
            totalNumbers: campaign.totalNumbers,
            status: campaign.status
          }
        },
        { upsert: true }
      );
      
      // Recalcular campos derivados (percentComplete e availableNumbers)
      const updatedSnapshot = await CampaignStatsHistory.findByIdAndUpdate(
        snapshot._id,
        [
          {
            $set: {
              percentComplete: { $multiply: [{ $divide: ["$soldNumbers", "$totalNumbers"] }, 100] },
              availableNumbers: { $subtract: ["$totalNumbers", { $add: ["$soldNumbers", "$reservedNumbers"] }] }
            }
          }
        ],
        { new: true }
      );
      
      return updatedSnapshot;
    } catch (error: any) {
      console.error('Erro ao atualizar estatísticas da campanha:', error);
      
      // Se for erro de chave duplicada, tentar novamente após um pequeno delay
      if (error.name === 'MongoServerError' && error.code === 11000) {
        console.log('Erro de chave duplicada, tentando novamente após delay...');
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.updateCampaignStats(campaignId, payment);
      }
      
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
      
      // Verificar se é um novo participante
      const isNewParticipant = await this.isNewParticipant(payment.campaignId, payment.userId);
      
      // Obter o dia da semana para atualização da distribuição de receita
      const dayOfWeek = new Date().getDay();
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const day = dayNames[dayOfWeek];
      
      // Construir o campo para atualização de receita por dia da semana
      const revenueByDayField = `revenueByDayOfWeek.${day}`;
      const updateObj: any = {
        $inc: {
          // Incrementar totais
          totalRevenue: payment.amount,
          totalNumbersSold: payment.numbersCount,
          
          // Incrementar contadores do período
          periodRevenue: payment.amount,
          periodNumbersSold: payment.numbersCount,
          
          // Incrementar novos participantes se aplicável
          totalParticipants: isNewParticipant ? 1 : 0,
          periodNewParticipants: isNewParticipant ? 1 : 0
        },
        $set: {
          // Atualizar timestamp
          lastUpdated: new Date()
        }
      };
      
      // Adicionar incremento para o dia da semana específico
      updateObj.$inc[revenueByDayField] = payment.amount;
      
      // Usar updateOne com operadores atômicos para evitar condições de corrida
      await CreatorStatsHistory.updateOne(
        { _id: snapshot._id },
        updateObj,
        { upsert: true }
      );
      
      // Buscar o snapshot atualizado para atualizar a lista de top campanhas
      const updatedSnapshot = await CreatorStatsHistory.findById(snapshot._id);
      if (updatedSnapshot) {
      // Atualizar lista de top campanhas
        await this.updateTopCampaigns(updatedSnapshot, payment.campaignId, campaignTitle, payment.amount, payment.numbersCount);
        await updatedSnapshot.save();
      }
      
      return updatedSnapshot;
    } catch (error: any) {
      console.error('Erro ao atualizar estatísticas do criador:', error);
      
      // Se for erro de chave duplicada, tentar novamente após um pequeno delay
      if (error.name === 'MongoServerError' && error.code === 11000) {
        console.log('Erro de chave duplicada, tentando novamente após delay...');
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.updateCreatorStats(creatorId, payment, campaignTitle);
      }
      
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
      
      // Dados da participação mais recente
      const lastParticipation = {
        campaignId: new mongoose.Types.ObjectId(payment.campaignId),
        campaignTitle,
        amount: payment.amount,
        numbersCount: payment.numbersCount,
        date: new Date()
      };
      
      // Usar updateOne com operadores atômicos para evitar condições de corrida
      await ParticipantStatsHistory.updateOne(
        { _id: snapshot._id },
        {
          $inc: {
            // Atualizar totais
            participationCount: 1,
            totalSpent: payment.amount,
            totalNumbersOwned: payment.numbersCount,
            
            // Atualizar contadores do período
            periodParticipations: 1,
            periodSpent: payment.amount,
            periodNumbersPurchased: payment.numbersCount
          },
          $set: {
            // Atualizar timestamp e dados da participação mais recente
            lastUpdated: new Date(),
            lastParticipation: lastParticipation
          }
        },
        { upsert: true }
      );
      
      // Buscar o snapshot atualizado para recalcular campos derivados e atualizar top campanhas
      const updatedSnapshot = await ParticipantStatsHistory.findById(snapshot._id);
      if (updatedSnapshot) {
        // Recalcular valor médio do ticket
        updatedSnapshot.avgTicketValue = updatedSnapshot.totalSpent / updatedSnapshot.participationCount;
      
      // Atualizar lista de top campanhas
        await this.updateParticipantTopCampaigns(updatedSnapshot, payment.campaignId, campaignTitle, payment.amount, payment.numbersCount);
      
      // Salvar alterações
        await updatedSnapshot.save();
      }
      
      return updatedSnapshot;
    } catch (error: any) {
      console.error('Erro ao atualizar estatísticas do participante:', error);
      
      // Se for erro de chave duplicada, tentar novamente após um pequeno delay
      if (error.name === 'MongoServerError' && error.code === 11000) {
        console.log('Erro de chave duplicada, tentando novamente após delay...');
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.updateParticipantStats(userId, payment, campaignTitle);
      }
      
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