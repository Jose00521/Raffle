import cron from 'node-cron';
import type { ScheduledTask } from 'node-cron';
import { CRON_CONFIG } from './config';
import activateCampaigns from './jobs/activateCampaigns';
import expirePixPayments from './jobs/expirePixPayments';
import logger from '@/lib/logger/logger';
import mongoose from 'mongoose';
import type { IDBConnection } from '@/server/lib/dbConnect';
import { inject, injectable } from 'tsyringe';
import { container } from '@/server/container/container';

/**
 * Gerenciador de Cron Jobs
 * Responsável por inicializar, registrar e parar os cron jobs
 */
@injectable()
class CronManager {
  private jobs: Map<string, ScheduledTask> = new Map();
  private initialized = false;

  constructor(
    @inject('db') private db: IDBConnection,
  ) {

  }
  
  /**
   * Inicializa o gerenciador de cron jobs
   * - Conecta ao banco de dados
   * - Registra os jobs configurados
   */
  async init() {
    if (this.initialized) {
      logger.warn('Cron manager já inicializado, ignorando chamada');
      return;
    }
    
    try {
      // Verificar se já existe uma conexão ativa com o banco de dados
      if (mongoose.connection.readyState !== 1) {
        logger.info('Conectando ao banco de dados para cron jobs');
        await this.db.connect();
        logger.info('Conexão com o banco de dados estabelecida');
      }
      
      // Registrar os jobs
      this.registerJobs();
      
      this.initialized = true;
      logger.info('Cron manager inicializado com sucesso');
    } catch (error) {
      logger.error('Erro ao inicializar cron manager', { 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }
  
  /**
   * Registra os jobs configurados no CRON_CONFIG
   */
  private registerJobs() {
    // Job para ativar campanhas agendadas
    if (CRON_CONFIG.ACTIVATE_CAMPAIGNS.enabled) {
      const task = cron.schedule(
        CRON_CONFIG.ACTIVATE_CAMPAIGNS.schedule, 
        async () => {
          try {
            logger.info('Executando job de ativação de campanhas');
            await activateCampaigns();
          } catch (error) {
            logger.error('Erro ao executar job de ativação de campanhas', { 
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        }
      );
      
      this.jobs.set('activateCampaigns', task);
      logger.info('Job de ativação de campanhas registrado', { 
        schedule: CRON_CONFIG.ACTIVATE_CAMPAIGNS.schedule 
      });
    }
    
    // Job para expirar PIX
    if (CRON_CONFIG.EXPIRE_PIX_PAYMENTS.enabled) {
      const pixTask = cron.schedule(
        CRON_CONFIG.EXPIRE_PIX_PAYMENTS.schedule, 
        async () => {
          try {
            logger.info('Executando job de expiração de PIX');
            await expirePixPayments();
          } catch (error) {
            logger.error('Erro ao executar job de expiração de PIX', { 
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined
            });
          }
        }
      );
      
      this.jobs.set('expirePixPayments', pixTask);
      logger.info('Job de expiração de PIX registrado', { 
        schedule: CRON_CONFIG.EXPIRE_PIX_PAYMENTS.schedule 
      });
    }
    
    // Adicione aqui o registro de outros jobs conforme necessário
  }
  
  /**
   * Para todos os jobs e limpa os recursos
   */
  async stop() {
    if (!this.initialized) {
      logger.warn('Cron manager não está inicializado');
      return;
    }
    
    for (const [name, job] of this.jobs.entries()) {
      job.stop();
      logger.info(`Job ${name} parado`);
    }
    
    // Limpar a coleção de jobs
    this.jobs.clear();
    
    this.initialized = false;
    logger.info('Cron manager parado com sucesso');
  }
  
  /**
   * Verifica se um job específico está registrado
   */
  hasJob(name: string): boolean {
    return this.jobs.has(name);
  }
  
  /**
   * Retorna o status do cron manager
   */
  getStatus() {
    return {
      initialized: this.initialized,
      jobsCount: this.jobs.size,
      jobsRegistered: Array.from(this.jobs.keys())
    };
  }
}

// Obter a instância de DBConnection do container
const db = container.resolve<IDBConnection>('db');

// Criar o cronManager manualmente
export const cronManager = new CronManager(db);

export default cronManager; 