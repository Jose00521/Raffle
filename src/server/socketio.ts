import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { socketAuthMiddleware, AuthenticatedSocket } from './socketMiddleware/authMiddleware';
import { 
  adminOnlyMiddleware, 
  creatorOnlyMiddleware, 
  participantOnlyMiddleware, 
  authenticatedOnlyMiddleware
} from './socketMiddleware/roleAccessMiddleware';

// Interface estendida para Socket com identificação não autenticada
export interface IdentifiedSocket extends AuthenticatedSocket {
  userIdentity?: {
    userCode: string;
    isAuthenticated: boolean;
    userType?: string;
  };
}

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

  // Configurar eventos gerais no namespace principal
  io.on('connection', (socket: IdentifiedSocket) => {
    console.log(`Socket conectado: ${socket.id}`);
    
    // Evento para identificação do usuário (autenticado ou não)
    socket.on('identify', (data: { userCode: string, isAuthenticated: boolean, userType?: string }) => {
      if (data.userCode) {
        // Armazenar identificação no objeto do socket
        socket.userIdentity = {
          userCode: data.userCode,
          isAuthenticated: data.isAuthenticated,
          userType: data.userType
        };
        
        console.log(`Usuário identificado: ${data.userCode} (autenticado: ${data.isAuthenticated})`);
        socket.emit('identified', { success: true });
      } else {
        console.log(`Falha na identificação: userCode não fornecido`);
        socket.emit('identified', { success: false, error: 'userCode não fornecido' });
      }
    });
    
    // Evento para entrar em uma room específica
    socket.on('joinRoom', (roomName: string) => {
      // Verificar se o usuário está tentando entrar em sua própria room
      if (socket.userIdentity && roomName === `user:${socket.userIdentity.userCode}`) {
        socket.join(roomName);
        console.log(`Usuário ${socket.userIdentity.userCode} entrou na room ${roomName}`);
        socket.emit('roomJoined', { room: roomName, success: true });
      } else if (socket.user && socket.user.role === 'admin') {
        // Admins podem entrar em qualquer room
        socket.join(roomName);
        console.log(`Admin ${socket.user.userId} entrou na room ${roomName}`);
        socket.emit('roomJoined', { room: roomName, success: true });
      } else {
        console.log(`Acesso negado: Socket ${socket.id} tentou entrar na room ${roomName} sem identificação adequada`);
        socket.emit('roomJoined', { success: false, error: 'Acesso negado a esta room' });
      }
    });
    
    // Evento para inscrição em atualizações de pagamento específico
    socket.on('subscribePayment', (paymentId: string) => {
      const roomName = `payment:${paymentId}`;
      
      // Verificar se o usuário está identificado
      if (socket.userIdentity || socket.user) {
        socket.join(roomName);
        console.log(`Usuário ${socket.userIdentity?.userCode || socket.user?.userId} inscrito nas atualizações do pagamento ${paymentId}`);
      } else {
        console.log(`Tentativa de inscrição em pagamento sem identificação: ${socket.id}`);
      }
    });
    
    // Evento de desconexão
    socket.on('disconnect', () => {
      console.log(`Socket desconectado: ${socket.id}`);
    });
  });

  // Namespace para estatísticas gerais (requer apenas autenticação)
  const statsNamespace = io.of('/stats');
  statsNamespace.use(socketAuthMiddleware as any);
  
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
  adminNamespace.use(socketAuthMiddleware as any);
  
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