import { ClientSession } from 'mongoose';
import { PaymentEvent } from './PaymentEvent';
import { IEventNotifier } from './IEventNotifier';
import { ICampaign } from '@/models/Campaign';

export interface StatsProcessorConfig {
  batchSize: number;
  batchTimeoutMs: number;
}

/**
 * Interface para processadores de estatísticas
 * Segue o princípio de Segregação de Interface (I do SOLID)
 */
export interface StatsProcessor {
  /**
   * Processa um lote de eventos de pagamento
   */
  processBatch(
    events: PaymentEvent[], 
    session: ClientSession
  ): Promise<void>;
}

/**
 * Interface para atualizadores de estatísticas de campanha
 * Segue o princípio de Interface Segregation (I do SOLID)
 */
export interface CampaignStatsProcessor extends StatsProcessor {
  /**
   * Atualiza as estatísticas de uma campanha
   */
  updateCampaignStats(
    campaignId: string,
    campaign: ICampaign,
    payments: PaymentEvent[],
    session: ClientSession
  ): Promise<void>;
}

/**
 * Interface para atualizadores de estatísticas de criador
 */
export interface CreatorStatsProcessor extends StatsProcessor {
  /**
   * Atualiza as estatísticas de um criador
   */
  updateCreatorStats(
    creatorId: string,
    campaignTitle: string,
    payments: PaymentEvent[],
    session: ClientSession
  ): Promise<void>;
}

/**
 * Interface para atualizadores de estatísticas de participante
 */
export interface ParticipantStatsProcessor extends StatsProcessor {
  /**
   * Atualiza as estatísticas de um participante
   */
  updateParticipantStats(
    participantId: string,
    campaignTitle: string,
    payments: PaymentEvent[],
    session: ClientSession
  ): Promise<void>;
} 