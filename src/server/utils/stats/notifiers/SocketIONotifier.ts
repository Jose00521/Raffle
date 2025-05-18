import { Server as SocketServer } from 'socket.io';
import { IEventNotifier, StatsEventPayload, StatsEventType } from '../interfaces/IEventNotifier';
import { Types } from 'mongoose';

/**
 * Implementação do notificador usando Socket.io
 * Segue o princípio de Responsabilidade Única (S do SOLID) - gerencia apenas notificações
 */
export class SocketIONotifier implements IEventNotifier {
  private io: SocketServer;
  private subscriptions: Map<string, Set<string>> = new Map();
  private userConnections: Map<string, string> = new Map(); // userId -> socketId
  
  constructor(io: SocketServer) {
    this.io = io;
    this.setupSocketListeners();
  }
  
  /**
   * Configura os listeners de eventos do Socket.io
   */
  private setupSocketListeners(): void {
    this.io.on('connection', (socket) => {
      console.log('Cliente conectado aos eventos de estatísticas:', socket.id);
      
      // Autenticação do socket
      socket.on('authenticate', (data: { 
        userId: string, 
        userType: 'creator' | 'participant'
      }) => {
        if (!data.userId) {
          socket.emit('auth_error', { message: 'ID de usuário é obrigatório' });
          return;
        }
        
        // Associar o socketId ao userId
        this.userConnections.set(data.userId, socket.id);
        
        socket.data.userId = data.userId;
        socket.data.userType = data.userType;
        
        console.log(`Socket ${socket.id} autenticado como ${data.userType} (${data.userId})`);
        socket.emit('authenticated', { success: true });
      });
      
      // Gerenciar inscrições
      socket.on('subscribe_stats', (data: { 
        entityId: string, 
        eventType: StatsEventType 
      }) => {
        // Verificar se o socket está autenticado
        if (!socket.data.userId) {
          socket.emit('subscription_error', { 
            message: 'Autenticação necessária para assinar atualizações'
          });
          return;
        }
        
        // Verificar permissões com base no tipo de evento
        if (!this.hasPermissionForEntity(socket, data.entityId, data.eventType)) {
          socket.emit('subscription_error', { 
            message: 'Sem permissão para receber estas estatísticas' 
          });
          return;
        }
        
        this.subscribeToEntity(socket.id, data.entityId, data.eventType);
        console.log(`Cliente ${socket.id} inscrito em ${data.eventType} para entidade ${data.entityId}`);
      });
      
      socket.on('unsubscribe_stats', (data: { 
        entityId: string, 
        eventType: StatsEventType 
      }) => {
        this.unsubscribeFromEntity(socket.id, data.entityId, data.eventType);
        console.log(`Cliente ${socket.id} cancelou inscrição em ${data.eventType} para entidade ${data.entityId}`);
      });
      
      // Limpar inscrições quando o cliente desconectar
      socket.on('disconnect', () => {
        this.clearClientSubscriptions(socket.id);
        
        // Remover da lista de conexões de usuário
        if (socket.data.userId) {
          this.userConnections.delete(socket.data.userId);
        }
        
        console.log('Cliente desconectado dos eventos de estatísticas:', socket.id);
      });
    });
  }
  
  /**
   * Verifica se um socket tem permissão para acessar estatísticas de uma entidade
   */
  private hasPermissionForEntity(
    socket: any, 
    entityId: string, 
    eventType: StatsEventType
  ): boolean {
    const userId = socket.data.userId;
    const userType = socket.data.userType;
    
    // Campanha - qualquer usuário logado pode ver estatísticas de campanha
    if (eventType === StatsEventType.CAMPAIGN_STATS_UPDATED) {
      return true;
    }
    
    // Criador - apenas o próprio criador pode ver suas estatísticas
    if (eventType === StatsEventType.CREATOR_STATS_UPDATED) {
      return userType === 'creator' && userId === entityId;
    }
    
    // Participante - apenas o próprio participante pode ver suas estatísticas
    if (eventType === StatsEventType.PARTICIPANT_STATS_UPDATED) {
      return userType === 'participant' && userId === entityId;
    }
    
    return false;
  }
  
  /**
   * Gera uma chave única para identificar uma inscrição
   */
  private getSubscriptionKey(entityId: string, eventType: StatsEventType): string {
    return `${eventType}:${entityId}`;
  }
  
  /**
   * Notifica sobre atualização nas estatísticas
   */
  public async notifyStatsUpdate(payload: StatsEventPayload): Promise<void> {
    const { eventType, entityId } = payload;
    
    if (eventType === StatsEventType.CREATOR_STATS_UPDATED) {
      // Para estatísticas de criador, enviar apenas para o socket do criador
      const creatorSocketId = this.userConnections.get(entityId.toString());
      if (creatorSocketId) {
        this.io.to(creatorSocketId).emit('stats_updated', payload);
        console.log(`Notificação de estatísticas enviada para o criador ${entityId}`);
      }
    } 
    else if (eventType === StatsEventType.PARTICIPANT_STATS_UPDATED) {
      // Para estatísticas de participante, enviar apenas para o socket do participante
      const participantSocketId = this.userConnections.get(entityId.toString());
      if (participantSocketId) {
        this.io.to(participantSocketId).emit('stats_updated', payload);
        console.log(`Notificação de estatísticas enviada para o participante ${entityId}`);
      }
    } 
    else {
      // Para outros tipos (como campanha), usar o sistema de salas
      const key = this.getSubscriptionKey(entityId.toString(), eventType);
      this.io.to(key).emit('stats_updated', payload);
      console.log(`Notificação enviada: ${eventType} para sala ${key}`);
    }
  }
  
  /**
   * Inscreve um cliente para receber atualizações de uma entidade específica
   */
  public subscribeToEntity(clientId: string, entityId: string, eventType: StatsEventType): void {
    const key = this.getSubscriptionKey(entityId, eventType);
    
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Set());
    }
    
    this.subscriptions.get(key)?.add(clientId);
    
    // Adicionar o cliente à sala Socket.io correspondente
    const socket = this.io.sockets.sockets.get(clientId);
    if (socket) {
      socket.join(key);
    }
  }
  
  /**
   * Cancela inscrição de um cliente
   */
  public unsubscribeFromEntity(clientId: string, entityId: string, eventType: StatsEventType): void {
    const key = this.getSubscriptionKey(entityId, eventType);
    
    this.subscriptions.get(key)?.delete(clientId);
    
    // Remover o cliente da sala Socket.io correspondente
    const socket = this.io.sockets.sockets.get(clientId);
    if (socket) {
      socket.leave(key);
    }
  }
  
  /**
   * Limpa todas as inscrições de um cliente quando ele desconecta
   */
  private clearClientSubscriptions(clientId: string): void {
    for (const [key, clients] of this.subscriptions.entries()) {
      if (clients.has(clientId)) {
        clients.delete(clientId);
      }
    }
  }
} 