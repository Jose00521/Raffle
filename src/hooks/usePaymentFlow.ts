import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { PaymentCreationService } from '@/services/PaymentCreationService';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { INumberPackageCampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IUser } from '@/models/interfaces/IUserInterfaces';

// 🎯 Interfaces específicas do hook
interface CheckoutData {
  campanha: ICampaign;
  campaignSelection: INumberPackageCampaign;
  foundUser: Partial<IUser>;
}

interface Pix {
  pixCode: string;
  pixQrCode: string;
  expiresAt: string | null;
  paymentCode: string;
}

interface PaymentValidation {
  currentAmount: number;
  existingAmount: number;
  amountMatch: boolean;
  campaignMatch: boolean;
  userMatch: boolean;
  pixExpired: boolean;
  canReusePayment: boolean;
}

// 🔧 Hook para gerenciar fluxo de pagamento
export const usePaymentFlow = (campanhaId: string) => {
  // 🏗️ Estados
  const [pix, setPix] = useState<Pix | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔗 Refs para persistência
  const paymentIdempotencyKeyRef = useRef<string | null>(null);
  const paymentAttemptRef = useRef(0);
  
  const router = useRouter();

  // 🔍 Função para validar se pode reutilizar pagamento existente
  const validateExistingPayment = useCallback((
    parsedData: CheckoutData,
    existingPix: Pix,
    lastCheckout: any
  ): PaymentValidation => {
    const currentAmount = (parsedData.campaignSelection.totalPrice || 0) * 100;
    const existingAmount = lastCheckout.amount || 0;
    // Se expiresAt for null, considera como não expirado (usa nosso timer padrão)
    const pixExpired = existingPix.expiresAt ? new Date(existingPix.expiresAt) < new Date() : false;
    
    const amountMatch = currentAmount === existingAmount;
    const campaignMatch = parsedData.campanha.campaignCode === lastCheckout.campaignCode;
    const userMatch = parsedData.foundUser.userCode === lastCheckout.userCode;
    
    const canReusePayment = amountMatch && campaignMatch && userMatch && !pixExpired;
    
    // 🔍 Log detalhado para debug
    console.log('[PAYMENT_VALIDATION] Validando pagamento existente:', {
      currentAmount,
      existingAmount,
      amountMatch,
      campaignMatch,
      userMatch,
      pixExpired,
      canReusePayment,
      pixExpiresAt: existingPix.expiresAt,
      currentTime: new Date().toISOString()
    });
    
    return {
      currentAmount,
      existingAmount,
      amountMatch,
      campaignMatch,
      userMatch,
      pixExpired,
      canReusePayment
    };
  }, []);

  // 💾 Função para criar snapshot dos dados do checkout
  const createCheckoutSnapshot = useCallback((parsedData: CheckoutData) => {
    return {
      amount: (parsedData.campaignSelection.totalPrice || 0) * 100,
      campaignCode: parsedData.campanha.campaignCode,
      userCode: parsedData.foundUser.userCode,
      quantity: parsedData.campaignSelection.quantity,
      price: parsedData.campaignSelection.price,
      timestamp: Date.now()
    };
  }, []);

  // 🧹 Função para limpar dados do sessionStorage
  const clearPaymentData = useCallback(() => {
    sessionStorage.removeItem('pix');
    sessionStorage.removeItem('paymentIdempotencyKey');
    sessionStorage.removeItem('lastCheckoutData');
    paymentIdempotencyKeyRef.current = null;
    paymentAttemptRef.current = 0;
  }, []);

  // 🔄 Função para recuperar pagamento existente
  const recoverExistingPayment = useCallback((parsedData: CheckoutData) => {
    const existingPixData = sessionStorage.getItem('pix');
    const existingIdempotencyKey = sessionStorage.getItem('paymentIdempotencyKey');
    const existingCheckoutData = sessionStorage.getItem('lastCheckoutData');
    
    console.log('[PAYMENT_RECOVERY] Estado do sessionStorage:', {
      hasPixData: !!existingPixData,
      hasIdempotencyKey: !!existingIdempotencyKey,
      hasCheckoutData: !!existingCheckoutData
    });

    // 🧹 Limpeza preventiva: Se tem PIX mas está expirado, limpa tudo
    if (existingPixData) {
      try {
        const existingPix = JSON.parse(existingPixData);
        const pixExpired = existingPix.expiresAt ? new Date(existingPix.expiresAt) < new Date() : false;
        
        if (pixExpired) {
          console.log('[PAYMENT_RECOVERY] 🧹 PIX expirado detectado, limpando dados automaticamente');
          clearPaymentData();
          return false; // Força criação de novo pagamento
        }
      } catch (error) {
        console.error('[PAYMENT_RECOVERY] Erro ao verificar expiração, limpando dados:', error);
        clearPaymentData();
        return false;
      }
    }

    // 🔍 Caso 1: Tem PIX e chave, mas sem dados de checkout (reload antigo)
    if (existingPixData && existingIdempotencyKey && !existingCheckoutData) {
      try {
        const existingPix = JSON.parse(existingPixData);
        // Se expiresAt for null, considera como não expirado (usa nosso timer padrão)
        const pixExpired = existingPix.expiresAt ? new Date(existingPix.expiresAt) < new Date() : false;
        
        if (!pixExpired) {
          console.log('[PAYMENT_RECOVERY] Recuperando PIX válido (reload sem dados)');
          
          setPix(existingPix);
          setIsLoading(false); // ✅ Marca como carregado após recuperação
          paymentIdempotencyKeyRef.current = existingIdempotencyKey;
          
          // Cria snapshot para futuras validações
          const checkoutSnapshot = createCheckoutSnapshot(parsedData);
          sessionStorage.setItem('lastCheckoutData', JSON.stringify(checkoutSnapshot));
          
          return true; // Pagamento recuperado
        } else {
          console.log('[PAYMENT_RECOVERY] PIX expirado, limpando dados');
          clearPaymentData();
        }
      } catch (error) {
        console.error('[PAYMENT_RECOVERY] Erro ao processar PIX existente:', error);
        clearPaymentData();
      }
    }

    // 🔍 Caso 2: Tem todos os dados - validação completa
    if (existingPixData && existingIdempotencyKey && existingCheckoutData) {
      try {
        const existingPix = JSON.parse(existingPixData);
        const lastCheckout = JSON.parse(existingCheckoutData);
        
        const validation = validateExistingPayment(parsedData, existingPix, lastCheckout);
        
        if (validation.canReusePayment) {
          console.log('[PAYMENT_RECOVERY] Reutilizando pagamento válido');
          
          setPix(existingPix);
          setIsLoading(false); // ✅ Marca como carregado após reutilização
          paymentIdempotencyKeyRef.current = existingIdempotencyKey;
          
          return true; // Pagamento reutilizado
        } else {
          console.log('[PAYMENT_RECOVERY] Pagamento incompatível, limpando:', {
            amountChanged: !validation.amountMatch,
            campaignChanged: !validation.campaignMatch,
            userChanged: !validation.userMatch,
            expired: validation.pixExpired
          });
          
          clearPaymentData();
        }
      } catch (error) {
        console.error('[PAYMENT_RECOVERY] Erro ao validar pagamento existente:', error);
        clearPaymentData();
      }
    }

    return false; // Nenhum pagamento válido encontrado
  }, [validateExistingPayment, createCheckoutSnapshot, clearPaymentData]);

  // 🚀 Função principal para criar novo pagamento
  const createNewPayment = useCallback(async (parsedData: CheckoutData) => {
    console.log('[PAYMENT_FLOW] Iniciando criação de pagamento');
    console.log('[PAYMENT_FLOW] Dados recebidos:', parsedData);
    
    // Previne múltiplas chamadas simultâneas usando ref
    if (paymentAttemptRef.current > 0 && isCreatingPayment) {
      console.log('[PAYMENT_FLOW] Pagamento já em criação, ignorando tentativa');
      return;
    }

    setIsCreatingPayment(true);
    paymentAttemptRef.current += 1;

    try {
      // Gera ou reutiliza chave de idempotência
      const idempotencyKey = PaymentCreationService.generateOrReuseIdempotencyKey(
        paymentIdempotencyKeyRef.current
      );
      paymentIdempotencyKeyRef.current = idempotencyKey;

      console.log('[PAYMENT_FLOW] Chamando PaymentCreationService com:', {
        idempotencyKey,
        attempt: paymentAttemptRef.current
      });

      // Chama o serviço de criação
      const result = await PaymentCreationService.createPixPayment({
        parsedData,
        idempotencyKey,
        attempt: paymentAttemptRef.current
      });

      if (result.success && result.pix) {
        setPix(result.pix);
        setIsLoading(false); // ✅ Marca como carregado após sucesso
        return;
      }

      if (result.shouldRetry) {
        // Agenda retry automático
        setTimeout(() => {
          createNewPayment(parsedData);
        }, 2000);
        return;
      }

      if (result.shouldReload) {
        window.location.reload();
        return;
      }

      // Se chegou aqui, houve erro sem retry
      router.push(`/campanhas/${campanhaId}`);

    } catch (error) {
      console.error('[PAYMENT_FLOW] Erro inesperado:', error);
      toast.error('Erro inesperado. Tente novamente.');
      router.push(`/campanhas/${campanhaId}`);
    } finally {
      setIsCreatingPayment(false);
    }
  }, [router, campanhaId]); // ✅ Removendo dependência problemática

  return {
    // Estados
    pix,
    setPix,
    isCreatingPayment,
    setIsCreatingPayment,
    isLoading,
    setIsLoading,
    
    // Refs
    paymentIdempotencyKeyRef,
    paymentAttemptRef,
    
    // Funções
    validateExistingPayment,
    createCheckoutSnapshot,
    clearPaymentData,
    recoverExistingPayment,
    createNewPayment
  };
}; 