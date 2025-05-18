import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { StatsEventType } from '@/server/utils/stats/interfaces/IEventNotifier';

let socket: Socket | null = null;

interface UseStatsSocketOptions {
  entityId: string;
  eventType: StatsEventType;
  userId?: string;
  userType?: 'creator' | 'participant';
}

/**
 * Hook para assinar atualizações de estatísticas em tempo real
 */
export function useStatsSocket<T = any>({ 
  entityId, 
  eventType, 
  userId,
  userType
}: UseStatsSocketOptions) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  
  useEffect(() => {
    if (!entityId) return;
    
    // Inicializar socket se ainda não existir
    if (!socket) {
      // Usar URL relativa para funcionar em desenvolvimento e produção
      socket = io();
      
      socket.on('connect', () => {
        console.log('Conectado ao servidor de estatísticas');
      });
      
      socket.on('connect_error', (err) => {
        console.error('Erro ao conectar com o servidor de estatísticas:', err);
        setError(new Error(`Erro de conexão: ${err.message}`));
        setLoading(false);
      });
      
      // Ouvir eventos de erro de autenticação
      socket.on('auth_error', (err) => {
        console.error('Erro de autenticação:', err);
        setError(new Error(`Erro de autenticação: ${err.message}`));
        setLoading(false);
      });
      
      // Ouvir eventos de erro de inscrição
      socket.on('subscription_error', (err) => {
        console.error('Erro ao assinar estatísticas:', err);
        setError(new Error(`Erro ao assinar: ${err.message}`));
        setLoading(false);
      });
    }
    
    // Autenticar se tivermos userId e userType
    if (userId && userType && !isAuthenticated && socket) {
      socket.emit('authenticate', { userId, userType });
      
      socket.on('authenticated', () => {
        setIsAuthenticated(true);
        
        // Após autenticação, inscrever-se para atualizações
        subscribeToStats();
      });
    } else if (socket) {
      // Se não tivermos info do usuário ou já estivermos autenticados,
      // apenas se inscrever para estatísticas (especialmente para campanhas)
      subscribeToStats();
    }
    
    function subscribeToStats() {
      // Inscrever-se para atualizações de estatísticas específicas
      socket?.emit('subscribe_stats', { entityId, eventType });
      
      // Receber atualizações em tempo real
      const handleStatsUpdate = (payload: any) => {
        if (payload.entityId.toString() === entityId.toString() && 
            payload.eventType === eventType) {
          setData(payload.data);
          setLoading(false);
        }
      };
      
      socket?.on('stats_updated', handleStatsUpdate);
      
      return () => {
        socket?.off('stats_updated', handleStatsUpdate);
      };
    }
    
    // Limpar ao desmontar
    return () => {
      if (socket) {
        socket.off('stats_updated');
        socket.off('authenticated');
        socket.off('auth_error');
        socket.off('subscription_error');
        socket.emit('unsubscribe_stats', { entityId, eventType });
      }
    };
  }, [entityId, eventType, userId, userType, isAuthenticated]);
  
  return { data, loading, error };
}

/**
 * Hook para assinar atualizações de estatísticas de campanha
 * Qualquer usuário autenticado pode acessar
 */
export function useCampaignStats(campaignId: string) {
  return useStatsSocket({
    entityId: campaignId,
    eventType: StatsEventType.CAMPAIGN_STATS_UPDATED
  });
}

/**
 * Hook para assinar atualizações de estatísticas de criador
 * Apenas o próprio criador pode acessar
 */
export function useCreatorStats(creatorId: string) {
  return useStatsSocket({
    entityId: creatorId,
    eventType: StatsEventType.CREATOR_STATS_UPDATED,
    userId: creatorId,
    userType: 'creator'
  });
}

/**
 * Hook para assinar atualizações de estatísticas de participante
 * Apenas o próprio participante pode acessar
 */
export function useParticipantStats(participantId: string) {
  return useStatsSocket({
    entityId: participantId,
    eventType: StatsEventType.PARTICIPANT_STATS_UPDATED,
    userId: participantId,
    userType: 'participant'
  });
} 