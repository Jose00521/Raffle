import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { INumberPackageCampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IUser } from '@/models/interfaces/IUserInterfaces';

// 🎯 Interface para dados do checkout
export interface CheckoutData {
  campanha: ICampaign;
  campaignSelection: INumberPackageCampaign;
  foundUser: Partial<IUser>;
}

// 🔧 Hook para gerenciar dados do checkout
export const useCheckoutData = (campanhaId: string) => {
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [campanha, setCampanha] = useState<ICampaign | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const router = useRouter();

  // 🔍 Função para carregar dados do localStorage
  const loadCheckoutData = useCallback((): CheckoutData | null => {
    try {
      console.log('[CHECKOUT_DATA] Tentando carregar dados do localStorage...');
      
      // Debug: verificar todas as chaves do localStorage
      const allKeys = Object.keys(localStorage);
      console.log('[CHECKOUT_DATA] Chaves disponíveis no localStorage:', allKeys);
      
      const storedData = localStorage.getItem('checkoutData');
      console.log('[CHECKOUT_DATA] Dados brutos do localStorage:', storedData?.substring(0, 200) + '...');
      
      if (!storedData) {
        console.error('[CHECKOUT_DATA] Dados não encontrados no localStorage');
        console.error('[CHECKOUT_DATA] localStorage keys:', Object.keys(localStorage));
        toast.error('Dados de checkout não encontrados');
        router.push(`/campanhas/${campanhaId}`);
        return null;
      }

      const parsedData: CheckoutData = JSON.parse(storedData);
      
      // Validações básicas
      if (!parsedData.campanha || !parsedData.campaignSelection || !parsedData.foundUser) {
        console.error('[CHECKOUT_DATA] Dados incompletos:', parsedData);
        toast.error('Dados de checkout incompletos');
        router.push(`/campanhas/${campanhaId}`);
        return null;
      }

      console.log('[CHECKOUT_DATA] Dados carregados com sucesso:', parsedData);

      return parsedData;
    } catch (error) {
      console.error('[CHECKOUT_DATA] Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do checkout');
      router.push(`/campanhas/${campanhaId}`);
      return null;
    }
  }, [campanhaId, router]);

  // 🔄 Função para recarregar dados
  const reloadCheckoutData = useCallback(() => {
    setIsLoadingData(true);
    const data = loadCheckoutData();
    if (data) {
      setCheckoutData(data);
      setCampanha(data.campanha);
    }
    setIsLoadingData(false);
  }, [loadCheckoutData]);

  // 🧹 Função para limpar dados
  const clearCheckoutData = useCallback(() => {
    localStorage.removeItem('checkoutData');
    setCheckoutData(null);
    setCampanha(null);
  }, []);

  // 🚀 Efeito para carregar dados na inicialização
  useEffect(() => {
    console.log('[CHECKOUT_DATA] Inicializando carregamento de dados');
    reloadCheckoutData();
  }, [reloadCheckoutData]);

  return {
    // Estados
    checkoutData,
    campanha,
    isLoadingData,
    
    // Funções
    loadCheckoutData,
    reloadCheckoutData,
    clearCheckoutData,
    setCheckoutData,
    setCampanha
  };
}; 