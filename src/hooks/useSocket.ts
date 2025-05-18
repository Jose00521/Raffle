import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

type SocketHookReturn = {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
};

/**
 * Hook personalizado para gerenciar conexão Socket.io com autenticação
 * @param namespace Namespace do Socket.io para conectar (opcional)
 */
export const useSocket = (namespace: string = ''): SocketHookReturn => {
  const { data: session } = useSession();
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Limpar socket anterior se existir
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    // Não conectar se não houver sessão (usuário não autenticado)
    if (!session || !session.user) {
      setError(new Error('Usuário não autenticado'));
      return;
    }

    try {
      // Criar nova conexão do socket com token de autenticação
      const socketUrl = namespace 
        ? `${window.location.origin}${namespace}`
        : window.location.origin;

      const socketInstance = io(socketUrl, {
        path: '/api/socket/io',
        auth: {
          token: session.user.id, // Use o ID do usuário como token
        },
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // Configurar eventos de conexão
      socketInstance.on('connect', () => {
        console.log('Socket.io conectado!');
        setIsConnected(true);
        setError(null);
      });

      socketInstance.on('connect_error', (err) => {
        console.error('Erro de conexão Socket.io:', err);
        setError(err);
        setIsConnected(false);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('Socket.io desconectado:', reason);
        setIsConnected(false);
      });

      // Armazenar referência ao socket
      socketRef.current = socketInstance;

      // Limpar ao desmontar o componente
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    } catch (err) {
      console.error('Erro ao inicializar Socket.io:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao inicializar Socket.io'));
      return;
    }
  }, [namespace, session]);

  return {
    socket: socketRef.current,
    isConnected,
    error,
  };
};

export default useSocket; 