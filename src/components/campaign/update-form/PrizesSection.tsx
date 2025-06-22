import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { FaInfoCircle, FaMoneyBillWave, FaTrophy } from 'react-icons/fa';
import styled from 'styled-components';
import { formatCurrency } from '@/utils/formatNumber';
import CustomDropdown from '@/components/common/CustomDropdown';
import MultiPrizePosition from '@/components/campaign/MultiPrizePosition';
import type { PrizeDistribution, PrizesSectionProps,  } from './types';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import PrizeSelectorModal from '@/components/prize/PrizeSelectorModal';
import PrizeCreatorModal from '@/components/prize/PrizeCreatorModal';

// Styled components
const PrizeSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.08) 0%, rgba(37, 117, 252, 0.08) 100%);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const PrizeSectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${props => props.theme.colors?.primary || '#6a11cb'};
    font-size: 1.4rem;
  }
`;

const WinnerInfoText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
    font-size: 1rem;
  }
`;

const WinnerDropdownContainer = styled.div`
  width: 180px;
`;

const TotalPrizeDisplay = styled.div`
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(106, 17, 203, 0.15);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const PrizeAmountValue = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
  }
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const PrizeCountBadge = styled.div`
  background: rgba(106, 17, 203, 0.1);
  color: #6a11cb;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 1.1rem;
  }
`;

const PrizeListContainer = styled.div`
  margin: 24px 0;
`;

const RequirementAlert = styled.div<{ $type: 'warning' | 'info' | 'error' }>`
  background: ${({ $type }) => {
    switch ($type) {
      case 'warning': return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)';
      case 'error': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)';
      default: return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
    }
  }};
  border: 1px solid ${({ $type }) => {
    switch ($type) {
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      case 'error': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 10;
  
  svg {
    color: ${({ $type }) => {
      switch ($type) {
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#3b82f6';
      }
    }};
    font-size: 1.2rem;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  div {
    flex: 1;
    
    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: ${({ $type }) => {
        switch ($type) {
          case 'warning': return '#f59e0b';
          case 'error': return '#ef4444';
          default: return '#3b82f6';
        }
      }};
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
      margin: 0;
      line-height: 1.5;
    }
  }
`;

const PrizesSection: React.FC<PrizesSectionProps> = ({
  control,
  errors,
  watch,
  setValue,
  getValues,
  isSubmitting,
}) => {
  // Opções para o dropdown de quantidade de vencedores
  const winnerOptions = [
    { value: '1', label: '1 vencedor' },
    { value: '2', label: '2 vencedores' },
    { value: '3', label: '3 vencedores' },
    { value: '4', label: '4 vencedores' },
    { value: '5', label: '5 vencedores' }
  ];

    // Estados para modais de prêmios
    const [showPrizeSelector, setShowPrizeSelector] = useState(false);
    const [showNewPrizeModal, setShowNewPrizeModal] = useState(false);
    const [selectedPrize, setSelectedPrize] = useState<IPrize | null>(null);
    const [availablePrizes, setAvailablePrizes] = useState<IPrize[]>([]);

  // Observar número de vencedores e prêmios
  const winnerCount = watch('winnerPositions');
  const prizes = watch('prizeDistribution');

    // Carregar prêmios disponíveis quando o componente montar
    useEffect(() => {
      const fetchPrizes = async () => {
        try {
          const prizes = await creatorPrizeAPIClient.getAllPrizes();
          setAvailablePrizes(prizes.data);
        } catch (error) {
          console.error('Erro ao carregar prêmios:', error);
        }
      };
      fetchPrizes();
    }, []);
  
  // Calcular valor total dos prêmios
  const totalPrizeValue = useMemo(() => {
    if (prizes && prizes.length > 0) {
      return prizes.reduce((sum: number, positionObj: PrizeDistribution) => {
        if (!positionObj.prizes || positionObj.prizes.length === 0) return sum;
        
        const positionTotal = positionObj.prizes.reduce((prizeSum: number, prize: IPrize) => {
          if (!prize.name || !prize.value) return prizeSum;
          
          // Extrair valor numérico da string formatada em moeda brasileira
          let prizeValue = 0;
          try {
            prizeValue = parseFloat(prize.value.replace(/[^\d,.]/g, '').replace(',', '.'));
            if (isNaN(prizeValue)) prizeValue = 0;
          } catch (error) {
            console.error('Erro ao converter valor do prêmio:', error);
          }
          
          return prizeSum + prizeValue;
        }, 0);
        
        return sum + positionTotal;
      }, 0);
    }
    return 0;
  }, [prizes]);

    // Handlers para Prize Selector
    const openPrizeSelector = () => {
      setShowPrizeSelector(true);
    };
    
    const closePrizeSelector = () => {
      setShowPrizeSelector(false);
    };
    
    const openNewPrizeModal = () => {
      setShowNewPrizeModal(true);
    };
    
    const closeNewPrizeModal = () => {
      setShowNewPrizeModal(false);
    };
    
    function handleSelectPrize(prize: IPrize) {
      console.log('Prêmio selecionado (principal):', prize);
      setSelectedPrize(prize);
      closePrizeSelector();
    }
  
      // Estados para handlers customizados dos modais
      const [currentPrizeSelectHandler, setCurrentPrizeSelectHandler] = useState<(prize: IPrize) => void>(() => handleSelectPrize);
      const [currentCloseHandler, setCurrentCloseHandler] = useState<() => void>(() => closePrizeSelector);
    
    const handlePrizeCreated = (prize: IPrize) => {
      // Adicionar o novo prêmio à lista
      setAvailablePrizes(prev => [prize, ...prev]);
      // Selecionar o prêmio recém-criado
      setSelectedPrize(prize);
      // Fechar o modal
      closeNewPrizeModal();
      // Atualizar o modal de seleção para usar o prêmio recém-criado
      currentPrizeSelectHandler(prize);
    };
  
    // Efeito para atualizar a lista de prêmios quando o número de vencedores muda
    
    useEffect(() => {
      if (!prizes) return;
      
      // Evitar atualizações desnecessárias que causam loops
      const shouldUpdate = () => {
        // Verificar se já temos todas as posições necessárias
        const currentPositions = prizes.map((p: PrizeDistribution) => p.position);
        
        // Se faltam posições ou temos posições extras, precisamos atualizar
        for (let i = 1; i <= winnerCount; i++) {
          if (!currentPositions.includes(i)) return true;
        }
        
        // Se temos posições extras, precisamos remover
        if (currentPositions.some((p: number) => p > winnerCount)) return true;
        
        return false;
      };
      
      // Só atualiza se realmente necessário
      if (!shouldUpdate()) return;
      
      const currentPrizes = [...prizes];
      
      // Mapeamento das posições atuais
      const currentPositions = currentPrizes.map(p => p.position);
      
      // Se aumentou o número de vencedores, adicionar novas posições vazias
      for (let i = 1; i <= winnerCount; i++) {
        if (!currentPositions.includes(i)) {
          currentPrizes.push({
            position: i,
            prizes: []
          });
        }
      }
      
      // Se diminuiu o número de vencedores, remover as posições excedentes
      const updatedPrizes = currentPrizes.filter(p => p.position <= winnerCount);
      
      // Ordenar por posição
      updatedPrizes.sort((a, b) => a.position - b.position);
      
      // Usar setValue com a opção shouldDirty: true para marcar o campo como alterado
      setValue('prizeDistribution', updatedPrizes, { 
        shouldDirty: true,
        shouldTouch: true
      });
    }, [winnerCount, prizes, setValue]);
    
    // Modificar os handlers para garantir que as alterações sejam detectadas
    const handleAddPrizeToPosition = useCallback((position: number) => {
      console.log("handleAddPrizeToPosition", position);
      // Abrir o seletor de prêmios para adicionar um novo prêmio à posição
      const onSelectForPosition = (prize: IPrize) => {
        console.log('Selecionando prêmio completo:', prize);
        
        const prizeIdentifier = prize.prizeCode;
        console.log('Identificador do prêmio para posição:', {
          name: prize.name,
          prizeCode: prize.prizeCode,
          identificador: prizeIdentifier
        });
        
        const currentPrizes = [...getValues('prizeDistribution')] as PrizeDistribution[];
        const positionIndex = currentPrizes.findIndex(p => p.position === position);

        console.log("currentPrizes", currentPrizes);
        
        if (positionIndex >= 0) {
          // Adicionar o prêmio à posição existente
          currentPrizes[positionIndex].prizes.push({
            ...prize
          });
          
          console.log(`Prêmio adicionado à posição ${position}:`, {
            name: prize.name,
            description: "Posição " + position,
            id: prizeIdentifier
          });
        } else {
          // Criar nova posição com o prêmio
          currentPrizes.push({
            position,
            prizes: [{
              ...prize
            }]
          });
          
          console.log(`Nova posição ${position} criada com prêmio:`, {
            name: prize.name,
            id: prizeIdentifier
          });
        }
        
        // Usar setValue com a opção shouldDirty: true para marcar o campo como alterado
        setValue('prizeDistribution', currentPrizes, { 
          shouldDirty: true,
          shouldTouch: true
        });
        setShowPrizeSelector(false);
      };
      
      // Configurar os handlers para o seletor de prêmios
      setCurrentPrizeSelectHandler(() => onSelectForPosition);
      setCurrentCloseHandler(() => {
        return () => {
          setCurrentPrizeSelectHandler(() => handleSelectPrize);
          setCurrentCloseHandler(() => closePrizeSelector);
          closePrizeSelector();
        };
      });
      
      // Abrir o seletor de prêmios
      setShowPrizeSelector(true);
    }, [getValues, setValue]);
    
    const handleRemovePrizeFromPosition = useCallback((position: number, prizeIndex: number) => {
      const currentPrizes = [...getValues('prizeDistribution')];
      const positionIndex = currentPrizes.findIndex(p => p.position === position);
      
      if (positionIndex >= 0) {
        // Remover o prêmio específico da posição
        currentPrizes[positionIndex].prizes.splice(prizeIndex, 1);
        
        // Se não sobrou nenhum prêmio nesta posição e não for a primeira, remover a posição
        if (currentPrizes[positionIndex].prizes.length === 0 && position > 1) {
          currentPrizes.splice(positionIndex, 1);
        } else if (currentPrizes[positionIndex].prizes.length === 0) {
          // Para a posição 1, manter com um prêmio vazio
          currentPrizes[positionIndex].prizes = [];
        }
        
        // Usar setValue com a opção shouldDirty: true para marcar o campo como alterado
        setValue('prizeDistribution', currentPrizes, { 
          shouldDirty: true,
          shouldTouch: true
        });
      }
    }, [getValues, setValue]);
    
    const handleCreatePrize = useCallback(() => {
      openNewPrizeModal();
    }, []);

  // Efeito para notificar o React Hook Form quando o componente montar
  useEffect(() => {
    // Forçar o React Hook Form a reconhecer o campo prizeDistribution como "tocado"
    // Isso ajuda a garantir que as mudanças sejam detectadas
    if (prizes && prizes.length > 0) {
      setValue('prizeDistribution', prizes);
    }
  }, []);  // Executar apenas na montagem do componente
  
  // Handler para alteração do número de vencedores
  const handleWinnerCountChange = (value: string) => {
    setValue('winnerPositions', parseInt(value), { 
      shouldDirty: true,
      shouldTouch: true
    });
  };

  // Total de prêmios configurados
  const totalPrizes = useMemo(() => {
    return prizes?.flatMap((p: PrizeDistribution) => p.prizes).filter((p: IPrize) => p.name).length || 0;
  }, [prizes]);

  return (
    <>
      <PrizeSectionHeader>
        <div>
          <PrizeSectionTitle>
            <FaTrophy /> Configuração de Prêmios
          </PrizeSectionTitle>
          <WinnerInfoText>
            <FaInfoCircle /> 
            {winnerCount === 1 
              ? 'Rifa com um único grande vencedor' 
              : `Rifa com ${winnerCount} vencedores premiados`}
          </WinnerInfoText>
        </div>
        
        <WinnerDropdownContainer>
          <Controller
            name="winnerPositions"
            control={control}
            render={({ field }) => (
              <CustomDropdown
                id="winnerPositions"
                options={winnerOptions}
                value={field.value.toString()}
                onChange={handleWinnerCountChange}
                placeholder="Número de vencedores"
                disabled={isSubmitting}
              />
            )}
          />
        </WinnerDropdownContainer>
      </PrizeSectionHeader>

      <TotalPrizeDisplay>
        <PrizeAmountValue>
          <FaMoneyBillWave />
          {formatCurrency(totalPrizeValue)}
          <span>valor total em prêmios</span>
        </PrizeAmountValue>
        
        <PrizeCountBadge>
          <FaTrophy /> {totalPrizes} prêmios configurados
        </PrizeCountBadge>
      </TotalPrizeDisplay>

      {errors?.prizeDistribution && !prizes?.some((p: PrizeDistribution) => 
        p.position === 1 && 
        p.prizes && 
        p.prizes.length > 0 && 
        p.prizes.some((prize: IPrize) => prize.name && prize.name.trim() !== '')
      ) && (
        <RequirementAlert $type="error" style={{ marginBottom: "20px" }}>
          <FaInfoCircle />
          <div>
            <h5>Prêmio Principal Obrigatório</h5>
            <p>{errors.prizeDistribution.message}</p>
          </div>
        </RequirementAlert>
      )}

      <PrizeListContainer>
        {prizes?.map((prizePosition: PrizeDistribution) => (
          <MultiPrizePosition
            key={`prize-position-${prizePosition.position}`}
            position={prizePosition.position}
            prizes={prizePosition.prizes}
            onAddPrize={handleAddPrizeToPosition}
            onRemovePrize={handleRemovePrizeFromPosition}
            onCreatePrize={handleCreatePrize}
            maxPrizes={5}
          />
        ))}
      </PrizeListContainer>



            {/* Modais para seleção e criação de prêmios */}
       <PrizeSelectorModal 
        isOpen={showPrizeSelector}
        onClose={currentCloseHandler}
        onSelectPrize={currentPrizeSelectHandler}
        availablePrizes={availablePrizes}
      />
      
      <PrizeCreatorModal
        isOpen={showNewPrizeModal}
        onClose={closeNewPrizeModal}
        onPrizeCreated={handlePrizeCreated}
      />
    </>
  );
};

export default PrizesSection; 