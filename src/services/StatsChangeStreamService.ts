import mongoose from 'mongoose';
import { CampaignStatsHistory } from '@/models/CampaignStatsHistory';
import { CreatorStatsHistory } from '@/models/CreatorStatsHistory';
import { ParticipantStatsHistory } from '@/models/ParticipantStatsHistory';
import Campaign from '@/models/Campaign';

// Configuração de batch e pooling
const BATCH_SIZE = 50;           // Número máximo de eventos no lote
const BATCH_TIMEOUT_MS = 2000;   // Tempo máximo para processar um lote (ms)
const SESSION_POOL_SIZE = 10;    // Tamanho do pool de sessões

class StatsChangeStreamService {
  private changeStream: any;
  private isRunning: boolean = false;
  private eventQueue: any[] = [];
  private processingBatch: boolean = false;
  private batchTimer: NodeJS.Timeout | null = null;
  private sessionPool: mongoose.ClientSession[] = [];

  constructor() {
    // Otimizar conexão MongoDB
    // Note: Connection options should be set when creating the connection,
    // not here. These settings are applied in server.js or lib/dbConnect.ts
  }

  /**
   * Inicia o serviço de monitoramento de pagamentos via ChangeStream
   */
  async start() {
    if (this.isRunning) return;

    try {
      console.log('Iniciando serviço de monitoramento de estatísticas...');

      // Inicializar pool de sessões
      await this.initSessionPool();
      
      // Inicializa o pipeline para monitorar apenas operações de insert e update em pagamentos
      const pipeline = [
        {
          $match: {
            $or: [
              { operationType: 'insert' },
              { 
                operationType: 'update',
                'updateDescription.updatedFields.status': 'confirmed'
              }
            ],
            'fullDocument.status': 'confirmed'
          }
        }
      ];

      // Cria o ChangeStream na coleção de pagamentos
      this.changeStream = mongoose.connection.collection('payments').watch(
        pipeline,
        { 
          fullDocument: 'updateLookup',
          maxAwaitTimeMS: 1000  // Tempo máximo de espera para novos eventos
        }
      );

      // Processa os eventos do ChangeStream
      this.changeStream.on('change', async (change: any) => {
        try {
          const payment = change.fullDocument;
          
          // Verifica se é um pagamento confirmado
          if (payment && payment.status === 'confirmed') {
            // Adicionar à fila de eventos
            this.eventQueue.push(payment);
            console.log(`Evento enfileirado: ${payment._id}. Fila atual: ${this.eventQueue.length}`);
            
            // Iniciar processamento em lote se necessário
            this.scheduleBatchProcessing();
          }
        } catch (error) {
          console.error('Erro ao processar evento de ChangeStream:', error);
        }
      });

      this.changeStream.on('error', (error: any) => {
        console.error('Erro no ChangeStream de estatísticas:', error);
        // Tenta reiniciar após 5 segundos em caso de erro
        setTimeout(() => this.start(), 5000);
      });

      this.isRunning = true;
      console.log('Serviço de monitoramento de estatísticas iniciado com sucesso.');
    } catch (error) {
      console.error('Erro ao iniciar serviço de monitoramento de estatísticas:', error);
      this.isRunning = false;
      // Tenta reiniciar após 5 segundos em caso de erro na inicialização
      setTimeout(() => this.start(), 5000);
    }
  }

  /**
   * Para o serviço de monitoramento
   */
  async stop() {
    if (this.changeStream) {
      await this.changeStream.close();
      this.isRunning = false;
      
      // Limpar timer e outras recursos
      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }
      
      // Fechar sessões do pool
      for (const session of this.sessionPool) {
        session.endSession();
      }
      this.sessionPool = [];
      
      console.log('Serviço de monitoramento de estatísticas parado.');
    }
  }

  /**
   * Inicializa o pool de sessões MongoDB
   */
  private async initSessionPool() {
    console.log(`Inicializando pool de ${SESSION_POOL_SIZE} sessões MongoDB...`);
    
    this.sessionPool = [];
    for (let i = 0; i < SESSION_POOL_SIZE; i++) {
      const session = await mongoose.startSession();
      this.sessionPool.push(session);
    }
    
    console.log('Pool de sessões inicializado com sucesso.');
  }

  /**
   * Obtém uma sessão disponível do pool
   */
  private async getSession(): Promise<mongoose.ClientSession> {
    if (this.sessionPool.length > 0) {
      return this.sessionPool.pop()!;
    }
    
    // Se o pool estiver vazio, criar uma nova sessão
    console.log('Aviso: Pool de sessões esgotado, criando nova sessão.');
    return await mongoose.startSession();
  }

  /**
   * Devolve uma sessão ao pool
   */
  private releaseSession(session: mongoose.ClientSession) {
    if (this.sessionPool.length < SESSION_POOL_SIZE) {
      this.sessionPool.push(session);
    } else {
      // Se o pool está cheio, fechar a sessão
      session.endSession();
    }
  }

  /**
   * Agenda o processamento em lote dos eventos
   */
  private scheduleBatchProcessing() {
    // Se já está processando ou não há eventos, não fazer nada
    if (this.processingBatch || this.eventQueue.length === 0) {
      return;
    }
    
    // Se atingiu o tamanho do lote, processar imediatamente
    if (this.eventQueue.length >= BATCH_SIZE) {
      this.processBatch();
      return;
    }
    
    // Caso contrário, agendar com timeout para garantir que eventos são processados
    // mesmo que o lote não complete
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        if (this.eventQueue.length > 0) {
          this.processBatch();
        }
      }, BATCH_TIMEOUT_MS);
    }
  }

  /**
   * Processa um lote de eventos da fila
   */
  private async processBatch() {
    if (this.processingBatch || this.eventQueue.length === 0) {
      return;
    }
    
    this.processingBatch = true;
    
    try {
      // Pegar no máximo BATCH_SIZE eventos da fila
      const batchSize = Math.min(BATCH_SIZE, this.eventQueue.length);
      const batch = this.eventQueue.splice(0, batchSize);
      
      console.log(`Processando lote de ${batch.length} eventos...`);
      
      // Agrupar por campanha para otimizar atualizações
      const paymentsByCampaign = this.groupPaymentsByCampaign(batch);
      
      // Processar cada grupo de campanha
      for (const [campaignId, payments] of Object.entries(paymentsByCampaign)) {
        await this.processPaymentsForCampaign(campaignId, payments);
      }
      
      console.log(`Lote de ${batch.length} eventos processado com sucesso.`);
    } catch (error) {
      console.error('Erro ao processar lote de eventos:', error);
      
      // Em caso de erro grave, logar eventos não processados para análise posterior
      if (this.eventQueue.length > 100) {
        console.error(`Fila de eventos acumulando (${this.eventQueue.length}). Possível gargalo.`);
      }
    } finally {
      this.processingBatch = false;
      
      // Verificar se há mais eventos para processar
      if (this.eventQueue.length > 0) {
        this.scheduleBatchProcessing();
      }
    }
  }

  /**
   * Agrupa pagamentos por campaignId para processamento otimizado
   */
  private groupPaymentsByCampaign(payments: any[]): Record<string, any[]> {
    const result: Record<string, any[]> = {};
    
    for (const payment of payments) {
      const campaignId = payment.campaignId.toString();
      if (!result[campaignId]) {
        result[campaignId] = [];
      }
      result[campaignId].push(payment);
    }
    
    return result;
  }

  /**
   * Processa todos os pagamentos de uma campanha específica
   */
  private async processPaymentsForCampaign(campaignId: string, payments: any[]) {
    if (payments.length === 0) return;
    
    // Obter uma sessão do pool
    const session = await this.getSession();
    
    try {
      // Iniciar transação
      session.startTransaction();
      
      // Buscar informações da campanha (uma vez para todos os pagamentos)
      const campaign = await Campaign.findById(campaignId).session(session);
      if (!campaign) {
        throw new Error(`Campanha não encontrada: ${campaignId}`);
      }
      
      // Organizar pagamentos por criador e participante
      const paymentsByCreator: Record<string, any[]> = {};
      const paymentsByParticipant: Record<string, any[]> = {};
      
      const creatorId = campaign.createdBy.toString();
      if (!paymentsByCreator[creatorId]) {
        paymentsByCreator[creatorId] = [];
      }
      
      // Agrupar pagamentos
      for (const payment of payments) {
        // Adicionar ao grupo do criador
        paymentsByCreator[creatorId].push(payment);
        
        // Adicionar ao grupo do participante
        const userId = payment.userId.toString();
        if (!paymentsByParticipant[userId]) {
          paymentsByParticipant[userId] = [];
        }
        paymentsByParticipant[userId].push(payment);
      }
      
      // 1. Atualizar estatísticas da campanha com todos os pagamentos de uma vez
      await this.updateCampaignStatsInBatch(campaignId, campaign, payments, session);
      
      // 2. Atualizar estatísticas de cada criador
      for (const [creatorId, creatorPayments] of Object.entries(paymentsByCreator)) {
        await this.updateCreatorStatsInBatch(creatorId, campaign.title, creatorPayments, session);
      }
      
      // 3. Atualizar estatísticas de cada participante
      for (const [userId, participantPayments] of Object.entries(paymentsByParticipant)) {
        await this.updateParticipantStatsInBatch(userId, campaign.title, participantPayments, session);
      }
      
      // Confirmar a transação
      await session.commitTransaction();
      console.log(`Estatísticas atualizadas com sucesso para ${payments.length} pagamentos da campanha ${campaignId}`);
    } catch (error) {
      // Reverter a transação em caso de erro
      await session.abortTransaction();
      console.error(`Erro ao processar pagamentos para campanha ${campaignId}:`, error);
      throw error;
    } finally {
      // Devolver sessão ao pool
      this.releaseSession(session);
    }
  }

  /**
   * Atualiza as estatísticas da campanha para múltiplos pagamentos de uma vez
   */
  private async updateCampaignStatsInBatch(campaignId: string, campaign: any, payments: any[], session: any): Promise<any> {
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
        batchNumbersSold += payment.numbersCount;
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
      
      return snapshot;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas da campanha em lote:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza as estatísticas do criador para múltiplos pagamentos de uma vez
   */
  private async updateCreatorStatsInBatch(creatorId: string, campaignTitle: string, payments: any[], session: any): Promise<any> {
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
        batchNumbersSold += payment.numbersCount;
        batchRevenue += payment.amount;
        
        // Registrar participante para verificação posterior
        uniqueParticipantsInBatch.add(payment.userId.toString());
        
        // Agregar dados por campanha para top campaigns
        const campaignId = payment.campaignId.toString();
        if (!paymentsByCampaign[campaignId]) {
          paymentsByCampaign[campaignId] = { amount: 0, numbersCount: 0 };
        }
        paymentsByCampaign[campaignId].amount += payment.amount;
        paymentsByCampaign[campaignId].numbersCount += payment.numbersCount;
        
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
      
      return snapshot;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do criador em lote:', error);
      throw error;
    }
  }
  
  /**
   * Atualiza as estatísticas do participante com base em múltiplos pagamentos
   */
  private async updateParticipantStatsInBatch(userId: string, campaignTitle: string, payments: any[], session: any): Promise<any> {
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
        batchNumbersPurchased += payment.numbersCount;
        
        // Agregar dados por campanha para top campaigns
        const campaignId = payment.campaignId.toString();
        if (!paymentsByCampaign[campaignId]) {
          paymentsByCampaign[campaignId] = { amount: 0, numbersCount: 0 };
        }
        paymentsByCampaign[campaignId].amount += payment.amount;
        paymentsByCampaign[campaignId].numbersCount += payment.numbersCount;
        
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
        numbersCount: mostRecentPayment.numbersCount,
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
      
      return snapshot;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas do participante em lote:', error);
      throw error;
    }
  }
  
  /**
   * Verifica se este é o primeiro pagamento do usuário para a campanha
   */
  private async isNewParticipant(campaignId: string, userId: string, session: any): Promise<boolean> {
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
  private async updateTopCampaigns(snapshot: any, campaignId: string, title: string, amount: number, numbersCount: number, session: any): Promise<void> {
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
  private async updateParticipantTopCampaigns(snapshot: any, campaignId: string, title: string, amount: number, numbersCount: number, session: any): Promise<void> {
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

export default new StatsChangeStreamService(); 