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

// Tipo para notificações de pagamento
interface PaymentNotification {
  paymentId: string;
  status: string;
  message: string;
  redirectUrl?: string;
  orderDetails?: any;
  timestamp: string;
}

// Interface do contexto
interface SocketContextProps {
  socket: Socket | null;
  isConnected: boolean;
  error: string | null;
  subscribeToCampaign: (campaignId: string) => void;
  subscribeToPayment: (paymentId: string) => void;
  joinPaymentRoom: () => void;
  notifications: CampaignNotification[];
  paymentNotifications: PaymentNotification[];
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
  const [paymentNotifications, setPaymentNotifications] = useState<PaymentNotification[]>([]);

  // Função para obter o userCode (da sessão ou do localStorage)
  const getUserCode = useCallback(() => {
    // Primeiro, tentar obter da sessão autenticada
    if (session?.user?.id) {
      return session.user.id;
    }
    
    // Se não estiver autenticado, tentar obter do localStorage
    try {
      // Verificar se há dados de checkout no localStorage
      const checkoutDataStr = localStorage.getItem('checkoutData');
      if (checkoutDataStr) {
        const checkoutData = JSON.parse(checkoutDataStr);
        if (checkoutData.foundUser?.userCode) {
          return checkoutData.foundUser.userCode;
        }
      }
    } catch (error) {
      console.error('Erro ao obter userCode do localStorage:', error);
    }
    
    return null;
  }, [session?.user?.id]);

  // Inicializar a conexão Socket.IO quando o usuário estiver identificado
  useEffect(() => {
    const userCode = getUserCode();
    
    // Se não há identificação de usuário, não faz nada
    if (!userCode) return;
    
    // Criar socket apenas se ainda não existe
    if (!socketRef.current) {
      console.log('Inicializando conexão Socket.IO...');
      const socketInstance = io(process.env.NEXTAUTH_URL, {
        path: '/api/socket/io'
      });
      socketRef.current = socketInstance;
      
      socketInstance.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Conectado ao servidor Socket.IO');
        
        // Enviar identificação do usuário - autenticado ou não
        socketInstance.emit('authenticate', { 
          userCode: userCode,
          isAuthenticated: !!session?.user?.id,
          userType: session?.user?.role
        });

        // Entrar automaticamente na room específica do usuário
        socketInstance.emit('joinRoom', `${session?.user?.role}:${userCode}`);
        console.log(`Entrando na room ${session?.user?.role}:${userCode}`);
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

      // Ouvir eventos de pagamento aprovado
      socketInstance.on('payment:approved', (notification: PaymentNotification) => {
        console.log('Pagamento aprovado recebido:', notification);
        setPaymentNotifications(prev => [notification, ...prev]);
        
        // Mostrar toast se autoToast está ativado
        if (autoToast) {
          toast.success(`Pagamento aprovado! ${notification.message}`, {
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
  }, [getUserCode, session?.user?.role, autoToast]);

  // Função para entrar na room específica do usuário para pagamentos
  const joinPaymentRoom = useCallback(() => {
    const userCode = getUserCode();
    
    if (socketRef.current && isConnected && userCode) {
      const roomName = `user:${userCode}`;
      console.log(`Entrando na room de pagamento: ${roomName}`);
      socketRef.current.emit('joinRoom', roomName);
    } else {
      console.warn('Não é possível entrar na room de pagamento: Socket não conectado ou usuário não identificado');
    }
  }, [isConnected, getUserCode]);

  // Função para subscrever a atualizações de uma campanha específica
  const subscribeToCampaign = useCallback((campaignId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`Inscrevendo-se para atualizações da campanha ${campaignId}`);
      socketRef.current.emit('subscribeCampaign', campaignId);
    } else {
      console.warn(`Não é possível se inscrever na campanha ${campaignId}: Socket ${socketRef.current ? 'conectado' : 'não inicializado'}, Conectado: ${isConnected}`);
    }
  }, [isConnected]);

  // Função para subscrever a atualizações de um pagamento específico
  const subscribeToPayment = useCallback((paymentId: string) => {
    if (socketRef.current && isConnected) {
      console.log(`Inscrevendo-se para atualizações do pagamento ${paymentId}`);
      socketRef.current.emit('subscribePayment', paymentId);
    } else {
      console.warn(`Não é possível se inscrever no pagamento ${paymentId}: Socket não conectado`);
    }
  }, [isConnected]);

  // Função para limpar notificações
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setPaymentNotifications([]);
  }, []);

  // Valor do contexto
  const contextValue: SocketContextProps = {
    socket: socketRef.current,
    isConnected,
    error,
    subscribeToCampaign,
    subscribeToPayment,
    joinPaymentRoom,
    notifications,
    paymentNotifications,
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