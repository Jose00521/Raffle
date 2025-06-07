import { Server as SocketServer } from 'socket.io';
import { injectable } from 'tsyringe';
import logger from '@/lib/logger/logger';

/**
 * Serviço para gerenciar operações do Socket.IO
 * Singleton que pode ser injetado em diferentes partes da aplicação
 */
@injectable()
export class SocketService {
  private io: SocketServer | null = null;
  private static instance: SocketService | null = null;
  
  constructor() {
    // Garantir que só exista uma instância
    if (SocketService.instance) {
      return SocketService.instance;
    }
    SocketService.instance = this;
  }

  /**
   * Inicializa o serviço com a instância do Socket.IO
   */
  public initialize(io: SocketServer): void {
    if (this.io) {
      logger.warn('SocketService já inicializado');
      return;
    }
    
    this.io = io;
    logger.info('SocketService inicializado com sucesso');
  }

  /**
   * Verifica se o serviço foi inicializado
   */
  public isInitialized(): boolean {
    return this.io !== null;
  }

  /**
   * Envia notificação para um usuário específico
   */
  public notifyUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      logger.error('SocketService não inicializado');
      return;
    }

    // Emitir para todos os sockets na sala do usuário
    const roomName = `user:${userId}`;
    logger.info(`Emitindo evento ${event} para sala ${roomName}`);
    
    // Verificar se a sala existe e tem sockets conectados
    const sockets = this.io.sockets.adapter.rooms.get(roomName);
    const socketCount = sockets ? sockets.size : 0;
    logger.info(`Sala ${roomName} tem ${socketCount} sockets conectados`);
    
    this.io.to(roomName).emit(event, data);
    
    // Também enviar como broadcast geral para garantir entrega durante testes
    
    logger.info(`Notificação enviada para usuário ${userId}: ${event}`);
  }

  /**
   * Envia notificação para o criador de uma campanha
   */
  public notifyCampaignCreator(creatorId: string, role: string, campaignId: string, event: string, data: any): void {
    if (!this.io) {
      logger.error('SocketService não inicializado');
      return;
    }

    try {
        console.log('#########################role ###############################',role)
      // Emitir para a sala específica do criador
      const roomName = `${role}:${creatorId}`;
      logger.info(`Emitindo evento ${event} para criador na sala ${roomName}`);
      
      // Verificar se a sala existe e tem sockets conectados
      const sockets = this.io.sockets.adapter.rooms.get(roomName);
      const socketCount = sockets ? sockets.size : 0;
      logger.info(`Sala ${roomName} tem ${socketCount} sockets conectados`);
      
      // Também emitir para a sala do usuário como backup
      const userRoomName = `user:${creatorId}`;
      const userSockets = this.io.sockets.adapter.rooms.get(userRoomName);
      const userSocketCount = userSockets ? userSockets.size : 0;
      logger.info(`Sala ${userRoomName} tem ${userSocketCount} sockets conectados`);
      
      // Preparar dados com informações adicionais
      const eventData = {
        ...data,
        campaignId,
        timestamp: new Date().toISOString()
      };
      
      // Emitir para a sala do criador
      this.io.to(roomName).emit(event, eventData);
      
      // Também emitir para a sala do usuário
    //   this.io.to(userRoomName).emit(event, eventData);
      
      logger.info(`Notificação de campanha enviada para criador ${creatorId}: ${event}`);
    } catch (error) {
      logger.error(`Erro ao enviar notificação para criador ${creatorId}:`, error);
      // Não propagar o erro para não interromper o fluxo
    }
  }

  /**
   * Envia notificação para todos os clientes inscritos em uma campanha
   */
  public notifyCampaign(campaignId: string, event: string, data: any): void {
    if (!this.io) {
      logger.error('SocketService não inicializado');
      return;
    }

    try {
      // Emitir para todos os sockets na sala da campanha
      const roomName = `campaign:${campaignId}`;
      logger.info(`Emitindo evento ${event} para sala ${roomName}`);
      
      // Verificar se a sala existe e tem sockets conectados
      const sockets = this.io.sockets.adapter.rooms.get(roomName);
      const socketCount = sockets ? sockets.size : 0;
      logger.info(`Sala ${roomName} tem ${socketCount} sockets conectados`);
      
      // Preparar dados com informações adicionais
      const eventData = {
        ...data,
        campaignId,
        timestamp: new Date().toISOString()
      };
      
      // Emitir para a sala da campanha
      this.io.to(roomName).emit(event, eventData);
      
      logger.info(`Notificação enviada para campanha ${campaignId}: ${event}`);
    } catch (error) {
      logger.error(`Erro ao enviar notificação para campanha ${campaignId}:`, error);
      // Não propagar o erro para não interromper o fluxo
    }
  }
}

// Exportar instância singleton
export default SocketService; 