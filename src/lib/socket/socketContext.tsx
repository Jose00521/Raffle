'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';

// Interface para o contexto do Socket
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

// Criar o contexto
const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

// Hook personalizado para usar o contexto
export const useSocketContext = () => useContext(SocketContext);

// Props para o provedor
interface SocketProviderProps {
  children: React.ReactNode;
  namespace?: string;
}

/**
 * Provedor do Socket.io para toda a aplicação
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ 
  children, 
  namespace = '/stats' 
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    // Só tenta conectar se o usuário estiver autenticado
    if (status !== 'authenticated' || !session?.user?.id) {
      return;
    }

    // Evitar criar múltiplas conexões
    if (socketRef.current) {
      return;
    }

    // Configurar conexão do Socket.io
    const socketInstance = io(namespace, {
      path: '/api/socket/io',
      auth: {
        token: session.user.id,
      },
      autoConnect: true,
    });

    // Eventos de conexão
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    socketRef.current = socketInstance;

    // Limpar ao desmontar
    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
      socketInstance.disconnect();
      socketRef.current = null;
    };
  }, [namespace, session?.user?.id, status]);

  const value = {
    socket: socketRef.current,
    isConnected,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 