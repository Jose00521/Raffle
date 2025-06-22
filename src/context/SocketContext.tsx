'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import { toast, ToastContainer } from 'react-toastify';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';

// Tipo para notificações de campanha
interface CampaignNotification {
  data:ICampaign,
  message: string;
  status: string;
  timestamp: string;
  activatedAt?: string;
}

// Interface do contexto
interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  subscribeToCampaign: (campaignId: string) => void;
  notifications: CampaignNotification[];
  clearNotifications: () => void;
}

// Criar o contexto
const SocketContext = createContext<SocketContextProps | undefined>(undefined);

// Props do provider
interface SocketProviderProps {
  children: ReactNode;
  autoToast?: boolean;
}

/**
 * Provider que gerencia a conexão global do Socket.IO
 */
export function SocketProvider({ children, autoToast = true }: SocketProviderProps) {
  const { data: session } = useSession();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<CampaignNotification[]>([]);

  // Inicializar a conexão Socket.IO quando o usuário estiver autenticado
  useEffect(() => {
    // Se não há usuário autenticado, não faz nada
    if (!session?.user?.id) return;
    
    // Criar socket apenas se ainda não existe
    if (!socketRef.current) {
      console.log('Inicializando conexão Socket.IO...');
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        path: '/api/socket/io'
      });
      socketRef.current = socketInstance;
      
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Conectado ao servidor Socket.IO');
        
        // Autenticar o socket com o ID do usuário
        socketInstance.emit('authenticate', { 
          userId: session.user.id,
          userType: session.user.role === 'creator' ? 'creator' : 'participant'
        });
      });
      
      socketInstance.on('authenticated', (response) => {
        if (response.success) {
          console.log('Socket autenticado com sucesso');
        } else {
          console.error('Falha na autenticação do socket');
          setError('Falha na autenticação');
        }
      });
      
      socketInstance.on('connect_error', (err) => {
        setIsConnected(false);
        setError(err.message);
        console.error('Erro ao conectar ao Socket.IO:', err);
      });
      
      socketInstance.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log(`Desconectado do servidor Socket.IO: ${reason}`);
      });
      
      // Ouvir eventos de ativação de campanha
      socketInstance.on('campaign:activated', (notification: CampaignNotification) => {
        setNotifications(prev => [notification, ...prev]);
        console.log("#########################notification ###############################", notification);
        // Mostrar toast se autoToast está ativado
        if (autoToast) {
          toast.success(`Campanha "${notification.data.title}" foi ativada!`, {
            position: "top-center",
            autoClose: 5000,
            theme: "colored"
          });
        }
      });
    }

    // Limpar ao desmontar
    return () => {
      if (socketRef.current) {
        console.log('Desconectando Socket.IO...');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session?.user?.id, autoToast]); // Remova a dependência de session e use apenas session?.user?.id

  // Função para subscrever a atualizações de uma campanha específica
  const subscribeToCampaign = useCallback((campaignId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`Inscrevendo-se para atualizações da campanha ${campaignId}`);
      socketRef.current.emit('subscribeCampaign', campaignId);
    } else {
      console.warn(`Não é possível se inscrever na campanha ${campaignId}: Socket ${socketRef.current ? 'conectado' : 'não inicializado'}, Conectado: ${isConnected}`);
    }
  }, [isConnected]);

  // Função para limpar notificações
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Valor do contexto
  const contextValue: SocketContextProps = {
    socket: socketRef.current,
    isConnected,
    error,
    subscribeToCampaign,
    notifications,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

/**
 * Hook para usar o Socket.IO em qualquer componente
 */
export function useSocket() {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket deve ser usado dentro de um SocketProvider');
  }
  
  return context;
} 