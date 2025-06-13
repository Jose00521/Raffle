import { useEffect, useCallback } from 'react';
import { useCheckoutData, CheckoutData } from './useCheckoutData';
import { usePaymentFlow } from './usePaymentFlow';
import { usePaymentTimer } from './usePaymentTimer';

// 🎯 Hook principal que orquestra todo o fluxo de checkout
export const useCheckoutFlow = (campanhaId: string) => {
  // 🔗 Hooks especializados
  const checkoutDataHook = useCheckoutData(campanhaId);
  const paymentFlowHook = usePaymentFlow(campanhaId);
  const paymentTimerHook = usePaymentTimer(campanhaId);

  // 🚀 Função principal para inicializar o fluxo
  const initializeCheckoutFlow = useCallback(async (checkoutData: CheckoutData) => {
    console.log('[CHECKOUT_FLOW] Inicializando fluxo de checkout');
    console.log('[CHECKOUT_FLOW] Dados do checkout recebidos:', {
      campanhaId: checkoutData.campanha._id,
      campaignCode: checkoutData.campanha.campaignCode,
      userCode: checkoutData.foundUser.userCode,
      amount: checkoutData.campaignSelection.totalPrice
    });

    // 2. Tenta recuperar pagamento existente
    console.log('[CHECKOUT_FLOW] Verificando pagamento existente...');
    console.log('[CHECKOUT_FLOW] SessionStorage atual:', {
      pix: !!sessionStorage.getItem('pix'),
      idempotencyKey: !!sessionStorage.getItem('paymentIdempotencyKey'),
      lastCheckoutData: !!sessionStorage.getItem('lastCheckoutData')
    });
    
    const hasExistingPayment = paymentFlowHook.recoverExistingPayment(checkoutData);
    
    if (hasExistingPayment) {
      console.log('[CHECKOUT_FLOW] ✅ Pagamento existente recuperado com sucesso');
      return;
    }

    // 3. Cria novo pagamento
    console.log('[CHECKOUT_FLOW] ❌ Nenhum pagamento válido encontrado, criando novo...');
    try {
      await paymentFlowHook.createNewPayment(checkoutData);
      console.log('[CHECKOUT_FLOW] Pagamento criado com sucesso');
    } catch (error) {
      console.error('[CHECKOUT_FLOW] Erro ao criar pagamento:', error);
    }
    
  }, []); // ✅ Removendo dependência problemática

  // 🔄 Efeito para inicializar quando dados estão prontos
  useEffect(() => {
    console.log('[CHECKOUT_FLOW] useEffect - Estado dos dados:', {
      isLoadingData: checkoutDataHook.isLoadingData,
      hasCheckoutData: !!checkoutDataHook.checkoutData,
      shouldInitialize: !checkoutDataHook.isLoadingData && checkoutDataHook.checkoutData
    });
    
    if (!checkoutDataHook.isLoadingData && checkoutDataHook.checkoutData) {
      console.log('[CHECKOUT_FLOW] Condições atendidas, inicializando fluxo');
      initializeCheckoutFlow(checkoutDataHook.checkoutData);
    } else {
      console.log('[CHECKOUT_FLOW] Aguardando condições para inicializar');
    }
  }, [checkoutDataHook.isLoadingData, checkoutDataHook.checkoutData, initializeCheckoutFlow]);

  // ⏰ Efeito para inicializar timer quando PIX está pronto
  useEffect(() => {
    if (paymentFlowHook.pix) {
      paymentTimerHook.initializeTimer(paymentFlowHook.pix);
    }
  }, [paymentFlowHook.pix]); // ✅ Removendo dependência problemática

  // 🧹 Cleanup ao sair da página
  useEffect(() => {
    return () => {
      const paymentCompleted = sessionStorage.getItem('paymentCompleted');
      if (paymentCompleted) {
        console.log('[CHECKOUT_FLOW] Limpando dados ao sair da página');
        checkoutDataHook.clearCheckoutData();
        paymentFlowHook.clearPaymentData();
        sessionStorage.removeItem('paymentCompleted');
      }
    };
  }, []); // ✅ Cleanup só precisa rodar uma vez

  // 🎯 Estados computados
  const isLoading = checkoutDataHook.isLoadingData || paymentFlowHook.isLoading;
  const isCreatingPayment = paymentFlowHook.isCreatingPayment;

  return {
    // Estados principais
    checkoutData: checkoutDataHook.checkoutData,
    campanha: checkoutDataHook.campanha,
    pix: paymentFlowHook.pix,
    timeLeft: paymentTimerHook.timeLeft,
    
    // Estados de loading
    isLoading,
    isCreatingPayment,
    
    // Refs importantes
    paymentAttemptRef: paymentFlowHook.paymentAttemptRef,
    
    // Funções utilitárias
    formatTimeLeft: paymentTimerHook.formatTimeLeft,
    
    // Funções de controle (se necessário)
    reloadCheckoutData: checkoutDataHook.reloadCheckoutData,
    clearPaymentData: paymentFlowHook.clearPaymentData
  };
}; 