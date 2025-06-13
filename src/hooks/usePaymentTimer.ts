import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface Pix {
  pixCode: string;
  pixQrCode: string;
  expiresAt: string | null;
}

// 🔧 Hook para gerenciar timer de expiração do PIX
export const usePaymentTimer = (campanhaId: string) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const router = useRouter();

  // 🔄 Função para calcular tempo restante
  const calculateTimeLeft = useCallback((expiresAt: string | null): number => {
    // Se expiresAt for null, undefined ou string vazia, usa tempo padrão de 10 minutos
    if (!expiresAt || expiresAt === 'null' || expiresAt.trim() === '') {
      console.log('[PAYMENT_TIMER] expiresAt é null/vazio, usando tempo padrão de 10 minutos');
      return 600; // 10 minutos
    }
    
    try {
      const expirationTime = new Date(expiresAt).getTime();
      const currentTime = new Date().getTime();
      const difference = expirationTime - currentTime;
      
      console.log('[PAYMENT_TIMER] Calculando tempo restante:', {
        expiresAt,
        expirationTime: new Date(expirationTime).toISOString(),
        currentTime: new Date(currentTime).toISOString(),
        difference,
        differenceInSeconds: Math.floor(difference / 1000),
        differenceInMinutes: Math.floor(difference / 1000 / 60),
        isExpired: difference <= 0,
        isValidDate: !isNaN(expirationTime)
      });
      
      // Verifica se a data é válida
      if (isNaN(expirationTime)) {
        console.log('[PAYMENT_TIMER] ⚠️ Data inválida, usando tempo padrão de 10 minutos');
        return 600; // 10 minutos
      }
      
      // Se a diferença for negativa ou muito pequena (menos de 30 segundos), 
      // usa tempo padrão de 10 minutos
    //   if (difference < 30000) { // menos de 30 segundos
    //     console.log('[PAYMENT_TIMER] ⚠️ PIX expira muito rápido, usando tempo padrão de 10 minutos');
    //     return 600; // 10 minutos
    //   }
      
      return Math.max(0, Math.floor(difference / 1000));
      
    } catch (error) {
      console.error('[PAYMENT_TIMER] Erro ao processar expiresAt:', error);
      console.log('[PAYMENT_TIMER] Usando tempo padrão de 10 minutos devido ao erro');
      return 600; // 10 minutos
    }
  }, []);

  // 🚀 Função para inicializar timer com PIX
  const initializeTimer = useCallback((pix: Pix) => {
    const remainingTime = calculateTimeLeft(pix.expiresAt);
    setTimeLeft(remainingTime);
    
    console.log('[PAYMENT_TIMER] Timer inicializado:', {
      expiresAt: pix.expiresAt,
      remainingSeconds: remainingTime,
      remainingMinutes: Math.floor(remainingTime / 60)
    });
  }, [calculateTimeLeft]);

  // 🧹 Função removida - lógica movida para o useEffect para evitar dependência circular

  // ⏰ Efeito para gerenciar countdown
  useEffect(() => {
    console.log('[PAYMENT_TIMER] useEffect - timeLeft:', timeLeft);
    
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => {
          console.log('[PAYMENT_TIMER] Decrementando timer:', prev, '->', prev - 1);
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      console.log('[PAYMENT_TIMER] ⚠️ Timer expirou, executando limpeza');
      
      // Executa a limpeza diretamente aqui para evitar dependência circular
      toast.error('Tempo para pagamento expirado');
      
      // Limpa dados do sessionStorage
      sessionStorage.removeItem('pix');
      sessionStorage.removeItem('paymentIdempotencyKey');
      sessionStorage.removeItem('lastCheckoutData');
      sessionStorage.setItem('paymentCompleted', 'expired');
      
      // Redireciona para a campanha
      router.push(`/campanhas/${campanhaId}`);
    }
  }, [timeLeft, router, campanhaId]); // Removido handleExpiration da dependência

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