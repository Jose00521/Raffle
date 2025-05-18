import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socketMiddleware/authMiddleware';
import { 
  adminOnlyMiddleware, 
  creatorOnlyMiddleware, 
  participantOnlyMiddleware, 
  authenticatedOnlyMiddleware
} from './socketMiddleware/roleAccessMiddleware';

// Interface estendida para Server com tipos mais específicos
export interface SocketIOServer extends Server {
  // Adicione funções ou propriedades adicionais específicas se necessário
}

let io: SocketIOServer | null = null;

/**
 * Inicializa o servidor Socket.io com middleware de autenticação
 */
export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  if (io) {
    console.log('Socket.io já está inicializado, retornando instância existente');
    return io;
  }

  // Criar servidor Socket.io
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    path: '/api/socket/io'
  }) as SocketIOServer;

  // Aplicar middleware de autenticação global
  io.use(socketAuthMiddleware);

  // Configurar namespaces diferentes para diferentes tipos de dados
  
  // Namespace para estatísticas gerais (requer apenas autenticação)
  const statsNamespace = io.of('/stats');
  statsNamespace.use(socketAuthMiddleware);
  
  // Configurar eventos no namespace de estatísticas
  statsNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Usuário conectado ao namespace /stats: ${socket.user?.userId}`);
    
    // Evento para escutar atualizações de estatísticas da campanha (qualquer usuário autenticado)
    socket.on('subscribe:campaignStats', (campaignId: string) => {
      socket.join(`campaign:${campaignId}`);
      console.log(`Usuário ${socket.user?.userId} inscrito nas estatísticas da campanha ${campaignId}`);
    });
    
    // Evento para escutar atualizações de estatísticas do criador (apenas o próprio criador)
    socket.on('subscribe:creatorStats', (creatorId: string, callback?: Function) => {
      // Verificar se o usuário está tentando acessar suas próprias estatísticas ou é admin
      if (socket.user?.userId === creatorId || socket.user?.role === 'admin') {
        socket.join(`creator:${creatorId}`);
        console.log(`Usuário ${socket.user?.userId} inscrito nas estatísticas do criador ${creatorId}`);
        if (callback) callback({ success: true });
      } else {
        console.log(`Acesso negado: Usuário ${socket.user?.userId} tentou acessar estatísticas do criador ${creatorId}`);
        if (callback) callback({ success: false, error: 'Acesso negado' });
      }
    });
    
    // Evento para escutar atualizações de estatísticas do participante (apenas o próprio participante)
    socket.on('subscribe:participantStats', (participantId: string, callback?: Function) => {
      // Verificar se o usuário está tentando acessar suas próprias estatísticas ou é admin
      if (socket.user?.userId === participantId || socket.user?.role === 'admin') {
        socket.join(`participant:${participantId}`);
        console.log(`Usuário ${socket.user?.userId} inscrito nas estatísticas do participante ${participantId}`);
        if (callback) callback({ success: true });
      } else {
        console.log(`Acesso negado: Usuário ${socket.user?.userId} tentou acessar estatísticas do participante ${participantId}`);
        if (callback) callback({ success: false, error: 'Acesso negado' });
      }
    });
    
    // Evento de desconexão
    socket.on('disconnect', () => {
      console.log(`Usuário desconectado do namespace /stats: ${socket.user?.userId}`);
    });
  });

  // Namespace para administradores (requer papel de admin)
  const adminNamespace = io.of('/admin');
  adminNamespace.use(socketAuthMiddleware);
  
  // Middleware adicional para verificar se o usuário é admin
  adminNamespace.use((socket: AuthenticatedSocket, next) => {
    if (socket.user?.role !== 'admin') {
      return next(new Error('Acesso negado: Não é administrador'));
    }
    next();
  });
  
  // Configurar eventos no namespace de administração
  adminNamespace.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`Administrador conectado: ${socket.user?.userId}`);
    
    // Eventos específicos de administração podem ser configurados aqui
    
    socket.on('disconnect', () => {
      console.log(`Administrador desconectado: ${socket.user?.userId}`);
    });
  });

  console.log('Servidor Socket.io inicializado com sucesso');
  return io;
};

/**
 * Obtém a instância do servidor Socket.io
 */
export const getSocketServer = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.io não foi inicializado. Chame initSocketServer primeiro.');
  }
  return io;
}; 