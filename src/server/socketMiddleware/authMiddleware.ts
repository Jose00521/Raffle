import { Socket } from 'socket.io';
import { verifyToken, JWTPayload } from '@/lib/auth/jwtUtils';

// Tipo para representar erros estendidos do Socket.io
type ExtendedError = Error | null;

// Interface estendida para Socket.io com informações do usuário
export interface AuthenticatedSocket extends Socket {
  user?: JWTPayload;
}

/**
 * Middleware de autenticação para Socket.io
 * Verifica se o token JWT é válido e adiciona informações do usuário ao socket
 */
export const socketAuthMiddleware = async (
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
) => {
  try {
    // Obter token do handshake (enviado durante a conexão)
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
      return next(new Error('Token de autenticação não fornecido'));
    }
    
    // Verificar e decodificar o token
    const decoded = await verifyToken(token);
    
    if (!decoded) {
      return next(new Error('Token de autenticação inválido'));
    }
    
    // Adicionar informações do usuário ao socket para uso posterior
    socket.user = decoded;
    
    // Adicionar o socket a uma sala específica do usuário para mensagens direcionadas
    socket.join(`user:${decoded.userId}`);
    
    // Adicionar à sala baseada no papel (role) do usuário
    if (decoded.role) {
      socket.join(`role:${decoded.role}`);
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação do Socket.io:', error);
    next(new Error('Falha na autenticação'));
  }
}; 