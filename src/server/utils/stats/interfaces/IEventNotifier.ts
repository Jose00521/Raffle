import { Types } from 'mongoose';

/**
 * Define eventos de estatísticas para notificações em tempo real
 */
export enum StatsEventType {
  CAMPAIGN_STATS_UPDATED = 'campaign_stats_updated',
  CREATOR_STATS_UPDATED = 'creator_stats_updated',
  PARTICIPANT_STATS_UPDATED = 'participant_stats_updated',
  PAYMENT_PROCESSED = 'payment_processed'
}

/**
 * Interface para payload de eventos de estatísticas
 */
export interface StatsEventPayload {
  eventType: StatsEventType;
  entityId: Types.ObjectId | string; // ID da campanha, criador ou participante
  timestamp: Date;
  data: any; // Dados específicos do evento
}

/**
 * Interface para sistema de notificação de eventos
 * Segue o princípio de Segregação de Interface (I do SOLID)
 */
export interface IEventNotifier {
  /**
   * Notifica sobre atualização nas estatísticas
   */
  notifyStatsUpdate(payload: StatsEventPayload): Promise<void>;
  
  /**
   * Inscreve um cliente para receber atualizações de uma entidade específica
   */
  subscribeToEntity(clientId: string, entityId: string, eventType: StatsEventType): void;
  
  /**
   * Cancela inscrição de um cliente
   */
  unsubscribeFromEntity(clientId: string, entityId: string, eventType: StatsEventType): void;
} 