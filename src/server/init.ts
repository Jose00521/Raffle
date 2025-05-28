import { Server as SocketServer } from 'socket.io';
import StatsService from '@/server/utils/stats/StatsService';
import logger from '@/lib/logger/logger';
/**
 * Inicializa serviços que devem rodar no backend
 * @param io Instância do Socket.io para comunicação em tempo real
 */
export async function initializeServices(io: SocketServer) {
  try {
    logger.info('Inicializando serviços do servidor...');
    
    // Iniciar o serviço de monitoramento de estatísticas
    // Injeção de dependência (D do SOLID)
    const statsService = new StatsService(io);
    await statsService.start();
    
    logger.info('Todos os serviços inicializados com sucesso.');
  } catch (error) {
    logger.error('Erro ao inicializar serviços:', error);
  }
} 