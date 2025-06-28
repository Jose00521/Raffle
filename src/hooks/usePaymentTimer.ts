import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Pix {
  pixCode: string;
  pixQrCode: string;
  expiresAt: string | null;
  paymentCode: string;
}

// 🔧 Hook para gerenciar timer de expiração do PIX
export const usePaymentTimer = (campanhaId: string) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const router = useRouter();
  
  // 🕐 Refs para controle de tempo real
  const expirationTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(Date.now());

  // 🔄 Função para calcular tempo restante baseado no tempo real
  const calculateTimeLeft = useCallback((expiresAt: string | null): number => {
    // Se expiresAt for null, undefined ou string vazia, usa tempo padrão de 10 minutos
    if (!expiresAt || expiresAt === 'null' || expiresAt.trim() === '') {
      // Define expiração para 10 minutos a partir de agora
      expirationTimeRef.current = Date.now() + (600 * 1000);
      return 600; // 10 minutos
    }
    
    try {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = Date.now();
      const difference = expirationTime - currentTime;

      // Verifica se a data é válida
      if (isNaN(expirationTime)) {
        // Define expiração para 10 minutos a partir de agora
        expirationTimeRef.current = Date.now() + (600 * 1000);
        return 600; // 10 minutos
      }
      
      // Armazena o tempo de expiração para uso futuro
      expirationTimeRef.current = expirationTime;
      
      return Math.max(0, Math.floor(difference / 1000));
      
    } catch (error) {
      console.error('[PAYMENT_TIMER] Erro ao calcular tempo:', error);
      // Define expiração para 10 minutos a partir de agora
      expirationTimeRef.current = Date.now() + (600 * 1000);
      return 600; // 10 minutos
    }
  }, []);

  // 🕐 Função para atualizar o tempo baseado no tempo real do sistema
  const updateTimeFromRealTime = useCallback(() => {
    if (!expirationTimeRef.current) return;
    
    const currentTime = Date.now();
    const difference = expirationTimeRef.current - currentTime;
    const newTimeLeft = Math.max(0, Math.floor(difference / 1000));
    
    // Atualiza apenas se houver mudança significativa (para evitar re-renders desnecessários)
    setTimeLeft(prevTime => {
      if (Math.abs(prevTime - newTimeLeft) >= 1) {
        console.log(`[PAYMENT_TIMER] Sincronizando tempo: ${prevTime}s → ${newTimeLeft}s`);
        return newTimeLeft;
      }
      return prevTime;
    });
    
    lastUpdateRef.current = currentTime;
    
    // Se o tempo acabou, executa limpeza
    if (newTimeLeft === 0) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      
      toast.error('Tempo para pagamento expirado');
      
      // Limpa dados do sessionStorage
      sessionStorage.removeItem('pix');
      sessionStorage.removeItem('paymentIdempotencyKey');
      sessionStorage.removeItem('lastCheckoutData');
      sessionStorage.setItem('paymentCompleted', 'expired');
      
      // Redireciona para a campanha
      router.push(`/campanhas/${campanhaId}`);
    }
  }, [router, campanhaId]);

  // 🚀 Função para inicializar timer com PIX
  const initializeTimer = useCallback((pix: Pix) => {
    console.log('[PAYMENT_TIMER] Inicializando timer com PIX:', { expiresAt: pix.expiresAt });
    
    // Limpa timer anterior se existir
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    const remainingTime = calculateTimeLeft(pix.expiresAt);
    setTimeLeft(remainingTime);
    
    // Inicia novo timer baseado em tempo real
    timerIntervalRef.current = setInterval(updateTimeFromRealTime, 1000);
    
    console.log(`[PAYMENT_TIMER] Timer iniciado com ${remainingTime}s restantes`);
  }, [calculateTimeLeft, updateTimeFromRealTime]);

  // 🔄 Efeito para detectar quando a aba volta a ficar ativa
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && expirationTimeRef.current) {
        console.log('[PAYMENT_TIMER] Aba voltou a ficar ativa, sincronizando tempo...');
        updateTimeFromRealTime();
      }
    };

    const handleFocus = () => {
      if (expirationTimeRef.current) {
        console.log('[PAYMENT_TIMER] Janela voltou ao foco, sincronizando tempo...');
        updateTimeFromRealTime();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [updateTimeFromRealTime]);

  // 🧹 Cleanup ao desmontar componente
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  // 🕐 Função para formatar tempo restante
  const formatTimeLeft = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // 🔄 Função para resetar timer
  const resetTimer = useCallback(() => {
    setTimeLeft(600); // Reset para 10 minutos
  }, []);

  return {
    // Estados
    timeLeft,
    
    // Funções
    initializeTimer,
    formatTimeLeft,
    resetTimer,
    calculateTimeLeft
  };
}; 