import { ClientSession, Types } from 'mongoose';
import { PaymentEvent, PaymentStatusEnum } from '../interfaces/PaymentEvent';
import { CampaignStatsProcessor, CreatorStatsProcessor, ParticipantStatsProcessor } from '../interfaces/StatsProcessors';
import { IEventNotifier, StatsEventType } from '../interfaces/IEventNotifier';
import { CampaignStatsHistory } from '@/models/CampaignStatsHistory';
import { CreatorStatsHistory } from '@/models/CreatorStatsHistory';
import { ParticipantStatsHistory } from '@/models/ParticipantStatsHistory';
import { BitMapProcessor } from './BitMapProcessor';
import Campaign from '@/models/Campaign';
import mongoose from 'mongoose';

/**
 * Processador que implementa a lógica de atualização das estatísticas
 * baseado no StatsChangeStreamService original
 */
export class StatsUpdateProcessor implements CampaignStatsProcessor, CreatorStatsProcessor, ParticipantStatsProcessor {
  private readonly notifier: IEventNotifier;
  private readonly bitmapProcessor: BitMapProcessor;
  
  constructor(notifier: IEventNotifier) {
    this.notifier = notifier;
    this.bitmapProcessor = new BitMapProcessor();
  }
  
  /**
   * Processa um lote de eventos de pagamento
   */
  public async processBatch(events: PaymentEvent[], session: ClientSession): Promise<void> {
    // Ignorar eventos não relevantes
    const relevantEvents = events.filter(event => 
      event.status === PaymentStatusEnum.APPROVED
    );
    
    if (relevantEvents.length === 0) return;

    // 🔄 ATUALIZADO: Atualizar bitmap em paralelo com outras estatísticas
    const statsUpdatePromise = this.updateAllStats(relevantEvents, session);
    const bitmapUpdatePromise = this.bitmapProcessor.processPaymentEvents(relevantEvents);
    
    // Executar ambos em paralelo
    await Promise.all([
      statsUpdatePromise,
      bitmapUpdatePromise
    ]);
  }
  
  /**
   * Atualiza todas as estatísticas tradicionais
   */
  private async updateAllStats(events: PaymentEvent[], session: ClientSession): Promise<void> {
    // Agrupar eventos por entidade para evitar processamento duplicado
    const campaignIds = new Set<string>();
    const participantIds = new Set<string>();
    
    // Mapeamento para rastrear pagamentos por campanha
    const paymentsByCampaign: Record<string, PaymentEvent[]> = {};
    const campaignDetails: Record<string, any> = {};
    
    // Extrair IDs únicos e mapear pagamentos por campanha
    for (const event of events) {
      const campaignId = event.campaignId.toString();
      const userId = event.userId.toString();
      
      // Adicionar aos conjuntos de IDs únicos
      campaignIds.add(campaignId);
      participantIds.add(userId);
      
      // Mapear pagamentos por campanha
      if (!paymentsByCampaign[campaignId]) {
        paymentsByCampaign[campaignId] = [];
      }
      paymentsByCampaign[campaignId].push(event);
    }
    
    // Buscar detalhes das campanhas (uma consulta por campanha)
    for (const campaignId of campaignIds) {
      const campaign = await Campaign.findById(
        campaignId,
        { title: 1, createdBy: 1, totalNumbers: 1, status: 1 },
        { session }
      ).lean();
      
      if (campaign) {
        campaignDetails[campaignId] = campaign;
      }
    }
    
    // Organizar pagamentos por criador
    const creatorIds = new Set<string>();
    const paymentsByCreator: Record<string, PaymentEvent[]> = {};
    
    for (const [campaignId, payments] of Object.entries(paymentsByCampaign)) {
      const campaign = campaignDetails[campaignId];
      if (campaign && campaign.createdBy) {
        const creatorId = campaign.createdBy.toString();
        creatorIds.add(creatorId);
        
        if (!paymentsByCreator[creatorId]) {
          paymentsByCreator[creatorId] = [];
        }
        
        paymentsByCreator[creatorId].push(...payments);
      }
    }
    
    // Organizar pagamentos por participante
    const paymentsByParticipant: Record<string, PaymentEvent[]> = {};
    
    for (const event of events) {
      const userId = event.userId.toString();
      
      if (!paymentsByParticipant[userId]) {
        paymentsByParticipant[userId] = [];
      }
      
      paymentsByParticipant[userId].push(event);
    }
    
    // Processar atualizações em paralelo para cada tipo de estatística
    await Promise.all([
      // Atualizar estatísticas de campanha
      ...Array.from(campaignIds).map(campaignId => {
        const payments = paymentsByCampaign[campaignId] || [];
        const campaign = campaignDetails[campaignId];
        if (campaign) {
          return this.updateCampaignStats(campaignId, campaign, payments, session);
        }
        return Promise.resolve();
      }),
      
      // Atualizar estatísticas de criador
      ...Array.from(creatorIds).map(creatorId => {
        const payments = paymentsByCreator[creatorId] || [];
        const campaignId = payments[0]?.campaignId.toString();
        const campaign = campaignId ? campaignDetails[campaignId] : null;
        if (campaign) {
          return this.updateCreatorStats(creatorId, campaign.title, payments, session);
        }
        return Promise.resolve();
      }),
      
      // Atualizar estatísticas de participante
      ...Array.from(participantIds).map(participantId => {
        const payments = paymentsByParticipant[participantId] || [];
        const campaignId = payments[0]?.campaignId.toString();
        const campaign = campaignId ? campaignDetails[campaignId] : null;
        if (campaign) {
          return this.updateParticipantStats(participantId, campaign.title, payments, session);
        }
        return Promise.resolve();
      })
    ]);
  }
  
  /**
   * Atualiza as estatísticas da campanha para múltiplos pagamentos
   * Implementa a lógica de updateCampaignStatsInBatch do StatsChangeStreamService
   */
  public async updateCampaignStats(
    campaignId: string, 
    campaign: any, 
    payments: PaymentEvent[], 
    session: ClientSession
  ): Promise<void> {
    try {
      // Obter ou criar o snapshot do dia atual
      const snapshot = await CampaignStatsHistory.getOrCreateTodaySnapshot(
        campaignId, 
        campaign.createdBy.toString(),
        campaign.status,
        campaign.totalNumbers
      );
      
      // Calcular totais do lote
      let batchNumbersSold = 0;
      let batchRevenue = 0;
      let batchNewParticipants = 0;
      
      // Set para acompanhar participantes únicos neste lote
      const uniqueParticipantsInBatch = new Set<string>();
      
      // Processar cada pagamento do lote
      for (const payment of payments) {
        batchNumbersSold += payment.numbersCount || payment.numbers.length;
        batchRevenue += payment.amount;
        
        // Registrar participante para verificação posterior
        uniqueParticipantsInBatch.add(payment.userId.toString());
      }
      
      // Verificar quais participantes são novos
      for (const userId of uniqueParticipantsInBatch) {
        const isNewParticipant = await this.isNewParticipant(campaignId, userId, session);
        if (isNewParticipant) {
          batchNewParticipants++;
        }
      }
      
      // Atualizar snapshot com os valores do lote
      snapshot.soldNumbers += batchNumbersSold;
      snapshot.totalRevenue += batchRevenue;
      snapshot.periodNumbersSold += batchNumbersSold;
      snapshot.periodRevenue += batchRevenue;
      snapshot.uniqueParticipants += batchNewParticipants;
      snapshot.periodNewParticipants += batchNewParticipants;
      
      // Calcular porcentagem completa
      snapshot.percentComplete = (snapshot.soldNumbers / snapshot.totalNumbers) * 100;
      
      // Recalcular números disponíveis
      snapshot.availableNumbers = snapshot.totalNumbers - snapshot.soldNumbers - snapshot.reservedNumbers;
      
      // Atualizar timestamp da última atualização
      snapshot.lastUpdated = new Date();
      
      // Salvar alterações
      await snapshot.save({ session });
      
      // Enviar notificação em tempo real
      await this.notifier.notifyStatsUpdate({
        eventType: StatsEventType.CAMPAIGN_STATS_UPDATED,
        entityId: campaignId,
        timestamp: new Date(),
        data: snapshot
      });
      
    } catch (error) {
      console.error('Erro ao atualizar estatísticas da campanha em lote:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza as estatísticas do criador para múltiplos pagamentos
   * Implementa a lógica de updateCreatorStatsInBatch do StatsChangeStreamService
   */
  public async updateCreatorStats(
    creatorId: string, 
    campaignTitle: string, 
    payments: PaymentEvent[], 
    session: ClientSession
  ): Promise<void> {
    try {
      // Obter ou criar o snapshot do dia atual
      const snapshot = await CreatorStatsHistory.getOrCreateTodaySnapshot(creatorId);
      
      // Calcular totais do lote
      let batchNumbersSold = 0;
      let batchRevenue = 0;
      let batchNewParticipants = 0;
      
      // Mapa para agrupar pagamentos por campanha
      const paymentsByCampaign: Record<string, { amount: number, numbersCount: number }> = {};
      
      // Set para acompanhar participantes únicos neste lote
      const uniqueParticipantsInBatch = new Set<string>();
      
      // Contadores para dias da semana
      const revenueByDayOfWeek: Record<string, number> = {
        sunday: 0, monday: 0, tuesday: 0, wednesday: 0, 
        thursday: 0, friday: 0, saturday: 0
      };
      
      // Processar cada pagamento do lote
      for (const payment of payments) {
        batchNumbersSold += payment.numbersCount || payment.numbers.length;
        batchRevenue += payment.amount;
        
        // Registrar participante para verificação posterior
        uniqueParticipantsInBatch.add(payment.userId.toString());
        
        // Agregar dados por campanha para top campaigns
        const campaignId = payment.campaignId.toString();
        if (!paymentsByCampaign[campaignId]) {
          paymentsByCampaign[campaignId] = { amount: 0, numbersCount: 0 };
        }
        paymentsByCampaign[campaignId].amount += payment.amount;
        paymentsByCampaign[campaignId].numbersCount += payment.numbersCount || payment.numbers.length;
        
        // Distribuição por dia da semana
        const dayOfWeek = new Date(payment.createdAt).getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const day = dayNames[dayOfWeek];
        revenueByDayOfWeek[day] += payment.amount;
      }
      
      // Verificar quais participantes são novos
      for (const userId of uniqueParticipantsInBatch) {
        const isNewParticipant = await this.isNewParticipant(payments[0].campaignId.toString(), userId, session);
        if (isNewParticipant) {
          batchNewParticipants++;
        }
      }
      
      // Atualizar snapshot com os valores do lote
      snapshot.totalRevenue += batchRevenue;
      snapshot.totalNumbersSold += batchNumbersSold;
      snapshot.periodRevenue += batchRevenue;
      snapshot.periodNumbersSold += batchNumbersSold;
      snapshot.totalParticipants += batchNewParticipants;
      snapshot.periodNewParticipants += batchNewParticipants;
      
      // Atualizar distribuição de receita por dia da semana
      for (const [day, amount] of Object.entries(revenueByDayOfWeek)) {
        if (amount > 0) {
          snapshot.revenueByDayOfWeek[day as keyof typeof snapshot.revenueByDayOfWeek] += amount;
        }
      }
      
      // Atualizar top campanhas para cada campanha no lote
      for (const [campaignId, data] of Object.entries(paymentsByCampaign)) {
        await this.updateTopCampaigns(
          snapshot, 
          campaignId, 
          campaignTitle, 
          data.amount, 
          data.numbersCount, 
          session
        );
      }
      
      // Atualizar timestamp da última atualização
      snapshot.lastUpdated = new Date();
      
      // Salvar alterações
      await snapshot.save({ session });
      
      // Enviar notificação em tempo real
      await this.notifier.notifyStatsUpdate({
        eventType: StatsEventType.CREATOR_STATS_UPDATED,
        entityId: creatorId,
        timestamp: new Date(),
        data: snapshot
      });
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do criador em lote:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza as estatísticas do participante com base em múltiplos pagamentos
   * Implementa a lógica de updateParticipantStatsInBatch do StatsChangeStreamService
   */
  public async updateParticipantStats(
    userId: string, 
    campaignTitle: string, 
    payments: PaymentEvent[], 
    session: ClientSession
  ): Promise<void> {
    try {
      // Obter ou criar o snapshot do dia atual
      const snapshot = await ParticipantStatsHistory.getOrCreateTodaySnapshot(userId);
      
      // Calcular totais do lote
      let batchParticipationCount = payments.length;
      let batchSpent = 0;
      let batchNumbersPurchased = 0;
      
      // Mapa para agrupar pagamentos por campanha
      const paymentsByCampaign: Record<string, { amount: number, numbersCount: number }> = {};
      
      // Encontrar o pagamento mais recente para lastParticipation
      let mostRecentPayment = payments[0];
      let mostRecentDate = new Date(payments[0].createdAt);
      
      // Processar cada pagamento do lote
      for (const payment of payments) {
        batchSpent += payment.amount;
        batchNumbersPurchased += payment.numbersCount || payment.numbers.length;
        
        // Agregar dados por campanha para top campaigns
        const campaignId = payment.campaignId.toString();
        if (!paymentsByCampaign[campaignId]) {
          paymentsByCampaign[campaignId] = { amount: 0, numbersCount: 0 };
        }
        paymentsByCampaign[campaignId].amount += payment.amount;
        paymentsByCampaign[campaignId].numbersCount += payment.numbersCount || payment.numbers.length;
        
        // Verificar se é o pagamento mais recente
        const paymentDate = new Date(payment.createdAt);
        if (paymentDate > mostRecentDate) {
          mostRecentPayment = payment;
          mostRecentDate = paymentDate;
        }
      }
      
      // Atualizar snapshot com os valores do lote
      snapshot.participationCount += batchParticipationCount;
      snapshot.totalSpent += batchSpent;
      snapshot.totalNumbersOwned += batchNumbersPurchased;
      snapshot.periodParticipations += batchParticipationCount;
      snapshot.periodSpent += batchSpent;
      snapshot.periodNumbersPurchased += batchNumbersPurchased;
      
      // Calcular valor médio do ticket
      snapshot.avgTicketValue = snapshot.totalSpent / snapshot.participationCount;
      
      // Atualizar dados da participação mais recente
      snapshot.lastParticipation = {
        campaignId: new mongoose.Types.ObjectId(mostRecentPayment.campaignId),
        campaignTitle,
        amount: mostRecentPayment.amount,
        numbersCount: mostRecentPayment.numbersCount || mostRecentPayment.numbers.length,
        date: mostRecentDate
      };
      
      // Atualizar top campanhas para cada campanha no lote
      for (const [campaignId, data] of Object.entries(paymentsByCampaign)) {
        await this.updateParticipantTopCampaigns(
          snapshot, 
          campaignId, 
          campaignTitle, 
          data.amount, 
          data.numbersCount, 
          session
        );
      }
      
      // Atualizar timestamp da última atualização
      snapshot.lastUpdated = new Date();
      
      // Salvar alterações
      await snapshot.save({ session });
      
      // Enviar notificação em tempo real
      await this.notifier.notifyStatsUpdate({
        eventType: StatsEventType.PARTICIPANT_STATS_UPDATED,
        entityId: userId,
        timestamp: new Date(),
        data: snapshot
      });
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do participante em lote:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se este é o primeiro pagamento do usuário para a campanha
   */
  private async isNewParticipant(campaignId: string, userId: string, session: ClientSession): Promise<boolean> {
    try {
      const previousPaymentsCount = await mongoose.connection.collection('payments').countDocuments({
        campaignId: new mongoose.Types.ObjectId(campaignId),
        userId: new mongoose.Types.ObjectId(userId),
        status: 'confirmed',
        createdAt: { $lt: new Date() }
      }, { session });
      
      return previousPaymentsCount === 0;
    } catch (error) {
      console.error('Erro ao verificar se é novo participante:', error);
      return false;
    }
  }
  
  /**
   * Atualiza a lista de top campanhas do criador
   */
  private async updateTopCampaigns(
    snapshot: any, 
    campaignId: string, 
    title: string, 
    amount: number, 
    numbersCount: number, 
    session: ClientSession
  ): Promise<void> {
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
        const campaign = await Campaign.findById(campaignId).session(session);
        if (campaign) {
          snapshot.topCampaigns[existingIndex].completionRate = 
            (snapshot.topCampaigns[existingIndex].numbersSold / campaign.totalNumbers) * 100;
        }
      } else {
        // Adicionar nova campanha
        const campaign = await Campaign.findById(campaignId).session(session);
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
  private async updateParticipantTopCampaigns(
    snapshot: any, 
    campaignId: string, 
    title: string, 
    amount: number, 
    numbersCount: number, 
    session: ClientSession
  ): Promise<void> {
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
} 