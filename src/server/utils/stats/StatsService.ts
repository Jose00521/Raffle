import { Server as SocketServer } from 'socket.io';
import { StatsProcessorConfig } from './interfaces/StatsProcessors';
import { BatchProcessor } from './BatchProcessor';
import { PaymentEventMonitor } from './PaymentEventMonitor';
import { StatsUpdateProcessor } from './processors/StatsUpdateProcessor';
import { SocketIONotifier } from './notifiers/SocketIONotifier';
import SessionManager from './SessionManager';
import { IEventNotifier } from './interfaces/IEventNotifier';

/**
 * Serviço principal para gerenciamento de estatísticas
 * Segue o princípio de Inversão de Dependência (D do SOLID)
 * recebendo implementações das interfaces via injeção de dependência
 */
export class StatsService {
  private readonly config: StatsProcessorConfig;
  private readonly notifier: IEventNotifier;
  private readonly updateProcessor: StatsUpdateProcessor;
  private readonly batchProcessor: BatchProcessor;
  private readonly eventMonitor: PaymentEventMonitor;
  
  constructor(io: SocketServer) {
    // Configurações padrão
    this.config = {
      batchSize: 50,
      batchTimeoutMs: 2000
    };
    
    // Inicializar componentes seguindo SOLID
    // Injeção de dependências (D do SOLID)
    this.notifier = new SocketIONotifier(io);
    
    // Criamos um processador para atualizar as estatísticas e enviar notificações
    this.updateProcessor = new StatsUpdateProcessor(this.notifier);
    
    this.batchProcessor = new BatchProcessor(this.config, this.updateProcessor);
    this.eventMonitor = new PaymentEventMonitor(this.batchProcessor);
  }

  /**
   * Inicia o serviço de estatísticas
   */
  public async start(): Promise<void> {
    try {
      console.log('Iniciando serviço de estatísticas em tempo real...');
      
      // Inicializar gerenciador de sessões
      await SessionManager.initialize();
      
      // Iniciar monitoramento de eventos
      await this.eventMonitor.start();
      
      console.log('Serviço de estatísticas em tempo real iniciado com sucesso');
    } catch (error) {
      console.error('Erro ao iniciar serviço de estatísticas:', error);
      throw error;
    }
  }

  /**
   * Para o serviço de estatísticas
   */
  public async stop(): Promise<void> {
    try {
      console.log('Parando serviço de estatísticas...');
      
      // Parar monitoramento de eventos
      await this.eventMonitor.stop();
      
      // Fechar sessões
      await SessionManager.close();
      
      console.log('Serviço de estatísticas parado');
    } catch (error) {
      console.error('Erro ao parar serviço de estatísticas:', error);
      throw error;
    }
  }
}

// Não exporte uma instância singleton - permite injeção de dependências
export default StatsService; 