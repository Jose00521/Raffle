import { useState, useEffect, useCallback } from 'react';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';

export const usePrizeManager = () => {
  const [availablePrizes, setAvailablePrizes] = useState<IPrize[]>([]);
  const [selectedPrize, setSelectedPrize] = useState<IPrize | null>(null);
  const [showPrizeSelector, setShowPrizeSelector] = useState(false);
  const [showNewPrizeModal, setShowNewPrizeModal] = useState(false);
  const [totalPrizeValue, setTotalPrizeValue] = useState<number>(0);

  // Estados para handlers dinâmicos
  const [currentPrizeSelectHandler, setCurrentPrizeSelectHandler] = useState<(prize: IPrize) => void>(() => () => {});
  const [currentCloseHandler, setCurrentCloseHandler] = useState<() => void>(() => () => {});

  // Carregar prêmios disponíveis
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const prizes = await creatorPrizeAPIClient.getAllPrizes();
        setAvailablePrizes(prizes.data);
      } catch (error) {
        // Ignorar erros
      }
    };
    fetchPrizes();
  }, []);

  // Handlers para modais
  const openPrizeSelector = useCallback(() => {
    setShowPrizeSelector(true);
  }, []);

  const closePrizeSelector = useCallback(() => {
    setShowPrizeSelector(false);
  }, []);

  const openNewPrizeModal = useCallback(() => {
    setShowNewPrizeModal(true);
  }, []);

  const closeNewPrizeModal = useCallback(() => {
    setShowNewPrizeModal(false);
  }, []);

  // Handler para seleção de prêmio
  const handleSelectPrize = useCallback((prize: IPrize) => {
    setSelectedPrize(prize);
    setShowPrizeSelector(false);
  }, []);

  // Handler para criação de prêmio
  const handlePrizeCreated = useCallback((prize: IPrize) => {
    setAvailablePrizes(prev => [prize, ...prev]);
    setSelectedPrize(prize);
    closeNewPrizeModal();
  }, [closeNewPrizeModal]);

  // Limpar prêmio selecionado
  const clearSelectedPrize = useCallback(() => {
    setSelectedPrize(null);
  }, []);

  // Calcular valor total dos prêmios
  const calculateTotalPrizeValue = useCallback((prizesList: any[]) => {
    if (!prizesList || prizesList.length === 0) return 0;
    
    return prizesList.reduce((sum: number, positionObj) => {
      if (!positionObj.prizes || positionObj.prizes.length === 0) return sum;
      
      const positionTotal = positionObj.prizes.reduce((prizeSum: number, prize: {name?: string, value?: string}) => {
        if (!prize.name || !prize.value) return prizeSum;
        let prizeValue = parseFloat(prize.value);
        return prizeSum + (isNaN(prizeValue) ? 0 : prizeValue);
      }, 0);
      
      return sum + positionTotal;
    }, 0);
  }, []);

  return {
    // Estados
    availablePrizes,
    selectedPrize,
    showPrizeSelector,
    showNewPrizeModal,
    totalPrizeValue,
    currentPrizeSelectHandler,
    currentCloseHandler,
    
    // Setters
    setAvailablePrizes,
    setSelectedPrize,
    setTotalPrizeValue,
    setCurrentPrizeSelectHandler,
    setCurrentCloseHandler,
    
    // Handlers
    openPrizeSelector,
    closePrizeSelector,
    openNewPrizeModal,
    closeNewPrizeModal,
    handleSelectPrize,
    handlePrizeCreated,
    clearSelectedPrize,
    calculateTotalPrizeValue
  };
}; 