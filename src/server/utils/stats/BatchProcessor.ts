import { ClientSession } from 'mongoose';
import { PaymentEvent, BatchProcessingResult } from './interfaces/PaymentEvent';
import { StatsProcessorConfig, StatsProcessor } from './interfaces/StatsProcessors';
import SessionManager from './SessionManager';

/**
 * Gerencia o processamento em lote de eventos de pagamento
 * Segue o princípio de Inversão de Dependência (D do SOLID)
 */
export class BatchProcessor {
  private eventQueue: PaymentEvent[] = [];
  private isProcessing = false;
  private batchTimer: NodeJS.Timeout | null = null;
  private readonly config: StatsProcessorConfig;
  private readonly processor: StatsProcessor;
  
  constructor(config: StatsProcessorConfig, processor: StatsProcessor) {
    this.config = config;
    this.processor = processor;
  }
  
  /**
   * Adiciona um evento à fila de processamento
   */
  public addEvent(event: PaymentEvent): void {
    this.eventQueue.push(event);
    this.scheduleProcessing();
  }
  
  /**
   * Agenda o processamento do próximo lote
   */
  private scheduleProcessing(): void {
    // Se já está processando ou fila vazia, não fazer nada
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }
    
    // Se atingiu o tamanho do lote, processar imediatamente
    if (this.eventQueue.length >= this.config.batchSize) {
      this.processNextBatch();
      return;
    }
    
    // Agendar processamento com timeout
    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.batchTimer = null;
        if (this.eventQueue.length > 0) {
          this.processNextBatch();
        }
      }, this.config.batchTimeoutMs);
    }
  }
  
  /**
   * Processa o próximo lote de eventos com transação
   */
  private async processNextBatch(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }
    
    this.isProcessing = true;
    let session: ClientSession | null = null;
    
    try {
      // Obter lote da fila
      const batchSize = Math.min(this.config.batchSize, this.eventQueue.length);
      const batch = this.eventQueue.splice(0, batchSize);
      
      console.log(`Processando lote de ${batch.length} eventos`);
      
      // Agrupar por campanha
      const eventsByCampaign = this.groupEventsByCampaign(batch);
      
      // Processar cada grupo de campanha em uma transação
      for (const [campaignId, events] of Object.entries(eventsByCampaign)) {
        await this.processCampaignEvents(campaignId, events);
      }
      
      console.log(`Lote de ${batch.length} eventos processado com sucesso`);
    } catch (error) {
      console.error('Erro ao processar lote de eventos:', error);
      
      if (this.eventQueue.length > 100) {
        console.error(`Fila acumulando (${this.eventQueue.length} eventos). Possível gargalo.`);
      }
    } finally {
      this.isProcessing = false;
      
      // Verificar se ainda existem eventos na fila
      if (this.eventQueue.length > 0) {
        this.scheduleProcessing();
      }
    }
  }
  
  /**
   * Processa eventos de uma campanha específica em uma transação
   */
  private async processCampaignEvents(
    campaignId: string, 
    events: PaymentEvent[]
  ): Promise<void> {
    if (events.length === 0) return;
    
    const session = await SessionManager.getSession();
    
    try {
      session.startTransaction();
      
      // Delegar processamento para a implementação do processador
      await this.processor.processBatch(events, session);
      
      await session.commitTransaction();
    } catch (error) {
      console.error(`Erro ao processar eventos da campanha ${campaignId}:`, error);
      await session.abortTransaction();
      throw error;
    } finally {
      SessionManager.releaseSession(session);
    }
  }
  
  /**
   * Agrupa eventos por campaignId
   */
  private groupEventsByCampaign(events: PaymentEvent[]): Record<string, PaymentEvent[]> {
    return events.reduce((groups, event) => {
      const campaignId = event.campaignId.toString();
      if (!groups[campaignId]) {
        groups[campaignId] = [];
      }
      groups[campaignId].push(event);
      return groups;
    }, {} as Record<string, PaymentEvent[]>);
  }
} 