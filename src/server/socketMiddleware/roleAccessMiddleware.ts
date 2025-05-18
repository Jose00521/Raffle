import { AuthenticatedSocket } from './authMiddleware';

/**
 * Middleware de controle de acesso para eventos do Socket.io baseado em papéis (roles)
 * @param allowedRoles Array de papéis (roles) permitidos para acessar o evento
 * @returns Middleware para verificar se o usuário tem acesso ao evento
 */
export const createRoleAccessMiddleware = (allowedRoles: string[]) => {
  return (socket: AuthenticatedSocket, eventName: string, next: (err?: Error) => void) => {
    try {
      // Verificar se o socket está autenticado
      if (!socket.user) {
        return next(new Error('Usuário não autenticado'));
      }
      
      const userRole = socket.user.role;
      
      // Verificar se o papel do usuário está na lista de papéis permitidos
      if (!allowedRoles.includes(userRole)) {
        return next(new Error(`Acesso negado para o evento: ${eventName}`));
      }
      
      // Usuário tem permissão, continuar
      next();
    } catch (error) {
      console.error('Erro no middleware de controle de acesso:', error);
      next(new Error('Falha na verificação de acesso'));
    }
  };
};

/**
 * Middleware para restringir eventos apenas para administradores
 */
export const adminOnlyMiddleware = createRoleAccessMiddleware(['admin']);

/**
 * Middleware para restringir eventos apenas para criadores
 */
export const creatorOnlyMiddleware = createRoleAccessMiddleware(['creator', 'admin']);

/**
 * Middleware para restringir eventos apenas para participantes
 */
export const participantOnlyMiddleware = createRoleAccessMiddleware(['participant', 'admin']);

/**
 * Middleware para eventos que requerem autenticação, mas sem restrição de papel
 */
export const authenticatedOnlyMiddleware = (
  socket: AuthenticatedSocket,
  eventName: string,
  next: (err?: Error) => void
) => {
  if (!socket.user) {
    return next(new Error('Usuário não autenticado'));
  }
  next();
}; 