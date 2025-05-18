import { Server as SocketServer } from 'socket.io';
import StatsService from '@/server/utils/stats/StatsService';

/**
 * Inicializa serviços que devem rodar no backend
 * @param io Instância do Socket.io para comunicação em tempo real
 */
export async function initializeServices(io: SocketServer) {
  try {
    console.log('Inicializando serviços do servidor...');
    
    // Iniciar o serviço de monitoramento de estatísticas
    // Injeção de dependência (D do SOLID)
    const statsService = new StatsService(io);
    await statsService.start();
    
    console.log('Todos os serviços inicializados com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar serviços:', error);
  }
} 