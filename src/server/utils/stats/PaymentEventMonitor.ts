import mongoose from 'mongoose';
import { PaymentEvent, PaymentStatusEnum } from './interfaces/PaymentEvent';
import { BatchProcessor } from './BatchProcessor';
import { IDBConnection } from '@/server/lib/dbConnect';
import Payment from '@/models/Payment';
/**
 * Monitora eventos de pagamento usando MongoDB ChangeStream
 * Segue o princípio de Responsabilidade Única (S do SOLID)
 */
export class PaymentEventMonitor {
  private changeStream: any = null;
  private isRunning = false;
  private readonly batchProcessor: BatchProcessor;
  private readonly dbConnect: IDBConnection;

  constructor(batchProcessor: BatchProcessor, dbConnect: IDBConnection) {
    this.batchProcessor = batchProcessor;
    this.dbConnect = dbConnect;
  }

  /**
   * Inicia o monitoramento de eventos
   */
  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }
    
    try {
      console.log('Iniciando monitoramento de eventos de pagamento');
      
      // Pipeline de filtro para operações relevantes
      const pipeline = this.createMonitoringPipeline();
      
      await this.dbConnect.connect();
      // Iniciar ChangeStream
      this.changeStream = Payment?.watch(pipeline, { 
          fullDocument: 'updateLookup',
          maxAwaitTimeMS: 1000 
        });
      
      // Configurar handlers de eventos
      this.setupEventHandlers();
      
      this.isRunning = true;
      console.log('Monitoramento de eventos iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao iniciar monitoramento de eventos:', error);
      this.isRunning = false;
      
      // Tentar reiniciar após falha
      setTimeout(() => this.start(), 5000);
    }
  }
  
  /**
   * Para o monitoramento de eventos
   */
  public async stop(): Promise<void> {
    if (!this.isRunning || !this.changeStream) {
      return;
    }
    
    try {
      await this.changeStream.close();
      this.changeStream = null;
      this.isRunning = false;
      console.log('Monitoramento de eventos parado');
    } catch (error) {
      console.error('Erro ao parar monitoramento:', error);
      this.isRunning = false;
    }
  }
  
  /**
   * Cria pipeline para filtrar operações relevantes
   */
  private createMonitoringPipeline(): any[] {
    return [
      {
        $match: {
          $or: [
            { 'operationType': 'insert' },
            { 
              'operationType': 'update',
              'updateDescription.updatedFields.status': { $exists: true }
            }
          ]
        }
      }
    ];
  }
  
  /**
   * Configura handlers para eventos do ChangeStream
   */
  private setupEventHandlers(): void {
    // Handler para novos eventos
    this.changeStream.on('change', (change: any) => {
      this.handleChangeEvent(change);
    });
    
    // Handler para erros
    this.changeStream.on('error', (error: any) => {
      console.error('Erro no ChangeStream:', error);
      this.isRunning = false;
      
      // Tentar reiniciar após erro
      setTimeout(() => this.start(), 5000);
    });
  }
  
  /**
   * Manipula eventos de mudança do ChangeStream
   */
  private handleChangeEvent(change: any): void {
    try {
      console.log('EVENTO DE MUDANÇA NA TABELA PAYMENT:', change);
      
      const { operationType, fullDocument } = change;
      
      // Ignorar se não há documento completo
      if (!fullDocument) {
        return;
      }
      
      // Converter para PaymentEvent
      const paymentEvent: PaymentEvent = {
        _id: fullDocument._id,
        campaignId: fullDocument.campaignId,
        userId: fullDocument.userId,
        amount: fullDocument.amount,
        paymentMethod: fullDocument.paymentMethod,
        status: fullDocument.status,
        numbers: fullDocument.numbers || [],
        numbersCount: fullDocument.numbers?.length || 0,
        createdAt: fullDocument.createdAt,
        updatedAt: fullDocument.updatedAt,
        purchaseDate: fullDocument.purchaseDate,
        paymentCode: fullDocument.paymentCode,
        processorTransactionId: fullDocument.processorTransactionId
      };
      
      // Adicionar evento à fila para processamento em lote
      this.batchProcessor.addEvent(paymentEvent);
      
    } catch (error) {
      console.error('Erro ao processar evento de mudança:', error);
    }
  }
} 