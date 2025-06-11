import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaGem, FaTrophy, FaAward, FaPlus, FaTimes, FaEdit, FaMoneyBillWave, FaGift } from 'react-icons/fa';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import PrizeSelectorModal from '../prize/PrizeSelectorModal';

// Interface para prêmio individual (físico ou dinheiro)
interface IndividualPrize {
  id: string;
  type: 'money' | 'item';
  quantity: number;
  value: number;
  prizeId?: string; // Para prêmios físicos
  name?: string; // Para prêmios físicos
  image?: string; // Para prêmios físicos
}

interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
  individualPrizes: IndividualPrize[]; // Nova propriedade para lista de prêmios
}

interface PrizeConfigProps {
  totalNumbers: number;
  onPrizeConfigChange: (config: PrizeCategoriesConfig) => void;
  onPrizesGenerated?: (prizes: InstantPrize[]) => void;
  disabled?: boolean;
}

interface PrizeCategoriesConfig {
  diamante: PrizeCategory;
  master: PrizeCategory;
  premiado: PrizeCategory;
}

// Interface para os prêmios gerados
interface GeneratedPrize {
  number: string;
  value: number;
  category: 'diamante' | 'master' | 'premiado';
}

// Interface para o prêmio instantâneo que será enviado ao componente pai
interface InstantPrize {
  id?: string;
  categoryId: string;
  number: string;
  value: number;
  claimed: boolean;
  type?: 'money' | 'item'; // Novo campo para tipo
  prizeId?: string; // Novo campo para ID do prêmio físico
  name?: string; // Novo campo para nome do prêmio físico
  image?: string; // Novo campo para imagem do prêmio físico
}

// Money Prize Modal Component
interface MoneyPrizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (quantity: number, value: number) => void;
  editingPrize?: IndividualPrize | null;
}

const MoneyPrizeModal: React.FC<MoneyPrizeModalProps> = ({ isOpen, onClose, onSave, editingPrize }) => {
  const [quantity, setQuantity] = useState(1);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (editingPrize) {
      setQuantity(editingPrize.quantity);
      setValue(editingPrize.value);
    } else {
      setQuantity(1);
      setValue(0);
    }
  }, [editingPrize, isOpen]);

  const handleSave = () => {
    if (quantity > 0 && value > 0) {
      onSave(quantity, value);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaMoneyBillWave /> {editingPrize ? 'Editar' : 'Adicionar'} Prêmio em Dinheiro
          </ModalTitle>
          <CloseButton onClick={onClose} title="Fechar">
            &times;
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <FormGroup>
            <FormLabel>Quantidade de Prêmios</FormLabel>
            <FormInput
              type="number"
              min="1"
              max="100"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Valor de Cada Prêmio (R$)</FormLabel>
            <FormInput
              type="number"
              min="1"
              value={value}
              onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
            />
          </FormGroup>
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>Cancelar</CancelButton>
          <SaveButton onClick={handleSave} disabled={quantity <= 0 || value <= 0}>
            <FaMoneyBillWave /> {editingPrize ? 'Salvar' : 'Adicionar'}
          </SaveButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

const PrizeConfigForm: React.FC<PrizeConfigProps> = ({ 
  totalNumbers, 
  onPrizeConfigChange,
  onPrizesGenerated,
  disabled = false
}) => {
  const [prizeConfig, setPrizeConfig] = useState<PrizeCategoriesConfig>({
    diamante: { active: false, quantity: 0, value: 2000, individualPrizes: [] },
    master: { active: false, quantity: 0, value: 1000, individualPrizes: [] },
    premiado: { active: false, quantity: 0, value: 500, individualPrizes: [] }
  });
  
  // Estado para armazenar os prêmios gerados
  const [generatedPrizes, setGeneratedPrizes] = useState<{
    diamante: GeneratedPrize[];
    master: GeneratedPrize[];
    premiado: GeneratedPrize[];
  }>({
    diamante: [],
    master: [],
    premiado: []
  });
  
  // Estados para controlar a quantidade de números visíveis em cada categoria
  const [visibleDiamante, setVisibleDiamante] = useState(15);
  const [visibleMaster, setVisibleMaster] = useState(15);
  const [visiblePremiado, setVisiblePremiado] = useState(15);
  
  // Set para controlar todos os números já usados, mantido como ref para persistir entre renders
  const usedNumbersRef = useRef<Set<number>>(new Set());
  
  // Use useRef to track previous totalNumbers to avoid infinite loops
  const prevTotalNumbers = useRef<number>(totalNumbers);
  
  // Estados para os modais
  const [showPrizeSelector, setShowPrizeSelector] = useState(false);
  const [showMoneyPrizeModal, setShowMoneyPrizeModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<keyof PrizeCategoriesConfig | null>(null);
  const [availablePrizes, setAvailablePrizes] = useState<IPrize[]>([]);
  const [editingPrize, setEditingPrize] = useState<IndividualPrize | null>(null);
  
  // Carregar prêmios disponíveis
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await creatorPrizeAPIClient.getAllPrizes();
        setAvailablePrizes(response.data);
      } catch (error) {
        console.error('Erro ao carregar prêmios:', error);
      }
    };
    fetchPrizes();
  }, []);
  
  // Função para calcular totais de uma categoria
  const calculateCategoryTotals = (category: PrizeCategory) => {
    const totalQuantity = category.individualPrizes.reduce((sum, prize) => sum + prize.quantity, 0);
    const totalValue = category.individualPrizes.reduce((sum, prize) => sum + (prize.quantity * prize.value), 0);
    return { totalQuantity, totalValue };
  };
  
  // Função para adicionar prêmio físico
  const handleAddPhysicalPrize = (categoryKey: keyof PrizeCategoriesConfig) => {
    setCurrentCategory(categoryKey);
    setShowPrizeSelector(true);
  };
  
  // Função para adicionar prêmio em dinheiro
  const handleAddMoneyPrize = (categoryKey: keyof PrizeCategoriesConfig) => {
    setCurrentCategory(categoryKey);
    setEditingPrize(null);
    setShowMoneyPrizeModal(true);
  };
  
  // Função para selecionar prêmio físico
  const handleSelectPhysicalPrize = (prize: IPrize) => {
    if (!currentCategory) return;
    
    const newPrize: IndividualPrize = {
      id: `${currentCategory}-${Date.now()}`,
      type: 'item',
      quantity: 1,
      value: parseFloat(prize.value) || 0,
      prizeId: prize.prizeCode,
      name: prize.name,
      image: typeof prize.image === 'string' ? prize.image : undefined
    };
    
    const updatedConfig = { ...prizeConfig };
    updatedConfig[currentCategory].individualPrizes.push(newPrize);
    
    // Atualizar totais da categoria
    const { totalQuantity } = calculateCategoryTotals(updatedConfig[currentCategory]);
    updatedConfig[currentCategory].quantity = totalQuantity;
    
    setPrizeConfig(updatedConfig);
    onPrizeConfigChange(updatedConfig);
    setShowPrizeSelector(false);
    setCurrentCategory(null);
  };
  
  // Função para salvar prêmio em dinheiro
  const handleSaveMoneyPrize = (quantity: number, value: number) => {
    if (!currentCategory) return;
    
    const updatedConfig = { ...prizeConfig };
    
    if (editingPrize) {
      // Editando prêmio existente
      const prizeIndex = updatedConfig[currentCategory].individualPrizes.findIndex(p => p.id === editingPrize.id);
      if (prizeIndex >= 0) {
        updatedConfig[currentCategory].individualPrizes[prizeIndex] = {
          ...updatedConfig[currentCategory].individualPrizes[prizeIndex],
          quantity,
          value
        };
      }
    } else {
      // Criando novo prêmio
      const newPrize: IndividualPrize = {
        id: `${currentCategory}-money-${Date.now()}`,
        type: 'money',
        quantity,
        value
      };
      updatedConfig[currentCategory].individualPrizes.push(newPrize);
    }
    
    // Atualizar totais da categoria
    const { totalQuantity } = calculateCategoryTotals(updatedConfig[currentCategory]);
    updatedConfig[currentCategory].quantity = totalQuantity;
    
    setPrizeConfig(updatedConfig);
    onPrizeConfigChange(updatedConfig);
    setShowMoneyPrizeModal(false);
    setCurrentCategory(null);
    setEditingPrize(null);
  };
  
  // Função para remover prêmio individual
  const handleRemoveIndividualPrize = (categoryKey: keyof PrizeCategoriesConfig, prizeId: string) => {
    const updatedConfig = { ...prizeConfig };
    updatedConfig[categoryKey].individualPrizes = updatedConfig[categoryKey].individualPrizes.filter(p => p.id !== prizeId);
    
    // Atualizar totais da categoria
    const { totalQuantity } = calculateCategoryTotals(updatedConfig[categoryKey]);
    updatedConfig[categoryKey].quantity = totalQuantity;
    
    setPrizeConfig(updatedConfig);
    onPrizeConfigChange(updatedConfig);
  };
  
  // Função para editar prêmio em dinheiro
  const handleEditMoneyPrize = (categoryKey: keyof PrizeCategoriesConfig, prize: IndividualPrize) => {
    setCurrentCategory(categoryKey);
    setEditingPrize(prize);
    setShowMoneyPrizeModal(true);
  };
  
  // When totalNumbers changes, ensure quantities don't exceed the total
  useEffect(() => {
    if (!totalNumbers || totalNumbers === prevTotalNumbers.current) return;
    
    prevTotalNumbers.current = totalNumbers;
    
    let tempConfig = {...prizeConfig};
    let needsUpdate = false;
    
    // Calculate total quantity across all active categories
    const totalQuantity = Object.values(prizeConfig).reduce((sum, category) => 
      category.active ? sum + category.quantity : sum, 0);
    
    // If total exceeds available numbers, scale back proportionally
    if (totalQuantity > totalNumbers) {
      const ratio = totalNumbers / totalQuantity;
      
      Object.keys(tempConfig).forEach(key => {
        const categoryKey = key as keyof PrizeCategoriesConfig;
        if (tempConfig[categoryKey].active) {
          tempConfig[categoryKey].quantity = Math.floor(tempConfig[categoryKey].quantity * ratio);
          if (tempConfig[categoryKey].quantity < 1) tempConfig[categoryKey].quantity = 1;
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        // Only update the state internally without triggering the callback
        // This prevents the infinite update loop
        setPrizeConfig(tempConfig);
        
        // Schedule the callback to run after the state update is processed
        // This helps break the immediate update cycle
        setTimeout(() => {
          onPrizeConfigChange(tempConfig);
        }, 0);
      }
    }
  }, [totalNumbers]); // Apenas totalNumbers nas dependências
  
  // Atualizar o useEffect para chamar onPrizesGenerated quando os prêmios forem alterados
  useEffect(() => {
    // Apenas se a função de callback foi fornecida
    if (onPrizesGenerated) {
      // Converter IndividualPrize[] para InstantPrize[]
      const allPrizes: InstantPrize[] = [];
      
      Object.entries(prizeConfig).forEach(([categoryKey, category]) => {
        if (category.active && category.individualPrizes.length > 0) {
          category.individualPrizes.forEach((individualPrize: IndividualPrize) => {
            // Para cada prêmio individual, gerar os números baseados na quantidade
            for (let i = 0; i < individualPrize.quantity; i++) {
              const uniqueNum = generateUniqueRandomNumber(totalNumbers);
              if (uniqueNum === -1) return; // Não há mais números disponíveis
              
              allPrizes.push({
                id: `${categoryKey}-${individualPrize.id}-${i}`,
                categoryId: categoryKey,
                number: String(uniqueNum).padStart(6, '0'),
                value: individualPrize.value,
                claimed: false,
                type: individualPrize.type,
                prizeId: individualPrize.prizeId,
                name: individualPrize.name,
                image: individualPrize.image
              });
            }
          });
        }
      });
      
      // Notificar o componente pai sobre os novos prêmios
      onPrizesGenerated(allPrizes);
    }
  }, [prizeConfig]); // Mudou para observar prizeConfig ao invés de generatedPrizes
  
  const handleToggleCategory = (category: keyof PrizeCategoriesConfig) => {
    if (disabled) return;
      
    // Criar cópia do config
    const updatedConfig = { ...prizeConfig };
    
    // Se estamos ativando a categoria
    if (!prizeConfig[category].active) {
      updatedConfig[category] = {
        ...updatedConfig[category],
        active: true,
        individualPrizes: [] // Inicializar com array vazio
      };
    } else {
      // Desativando a categoria simplesmente
      updatedConfig[category] = {
        ...updatedConfig[category],
        active: false,
        individualPrizes: [] // Limpar prêmios
      };
      
      // Limpar números usados desta categoria
      clearCategoryNumbers(category);
    }
    
    setPrizeConfig(updatedConfig);
    onPrizeConfigChange(updatedConfig);
  };
  
  const handleValueChange = (
    category: keyof PrizeCategoriesConfig, 
    field: keyof PrizeCategory, 
    value: number
  ) => {
    if (disabled) return;
    
    // Don't allow negative values or non-numeric values
    if (isNaN(value) || value < 0) return;
    
    // Criar uma cópia da configuração atual
    const updatedConfig = { ...prizeConfig };
    
    // Para o campo quantidade
    if (field === 'quantity') {
      // Calcular o total atual de números em outras categorias ativas
      const otherCategoriesTotal = Object.entries(prizeConfig)
        .filter(([key]) => key !== category && prizeConfig[key as keyof PrizeCategoriesConfig].active)
        .reduce((sum, [_, cat]) => sum + cat.quantity, 0);
      
      // Calcular o máximo disponível para esta categoria
      const maxAvailable = totalNumbers - otherCategoriesTotal;
      
      // Limitar o valor ao menor entre: o máximo disponível, 100, e o valor proposto
      const limitedValue = Math.min(maxAvailable, 100, value);
      
      // Se o valor for menor que 1, defina como 1
      const finalValue = Math.max(1, limitedValue);
      
      // Atualizar o valor com a restrição aplicada
      updatedConfig[category] = {
        ...updatedConfig[category],
        quantity: finalValue
      };
    } else {
      // Para outros campos (como valor), apenas atualize normalmente
      updatedConfig[category] = {
        ...updatedConfig[category],
        [field]: value
      };
    }
    
    // Atualizar o estado e notificar o componente pai
    setPrizeConfig(updatedConfig);
    onPrizeConfigChange(updatedConfig);
    
    // Se a categoria estiver ativa e a quantidade for alterada,
    // regenerar apenas os números dessa categoria
    if (field === 'quantity' && updatedConfig[category].active) {
      generatePrizesForCategory(category, updatedConfig[category].quantity, updatedConfig[category].value);
    }
  };
  
  // Calculate remaining numbers
  const usedNumbers = Object.values(prizeConfig).reduce((sum, category) => 
    category.active ? sum + category.quantity : sum, 0);
  
  const remainingNumbers = Math.max(0, totalNumbers - usedNumbers);
  
  // Limpar números de uma categoria e removê-los do set de usados
  const clearCategoryNumbers = (category: keyof PrizeCategoriesConfig) => {
    // Remover os números desta categoria do Set global de números usados
    generatedPrizes[category].forEach(prize => {
      usedNumbersRef.current.delete(parseInt(prize.number));
    });
    
    // Limpar os números da categoria
    setGeneratedPrizes(prev => ({
      ...prev,
      [category]: []
    }));
  };
  
  // Função para gerar prêmios apenas para uma categoria específica
  const generatePrizesForCategory = (
    category: keyof PrizeCategoriesConfig,
    quantity: number, 
    value: number
  ) => {
    // Limpar os números existentes desta categoria primeiro
    clearCategoryNumbers(category);
    
    const newPrizes: GeneratedPrize[] = [];
    
    // Gerar os novos números únicos para esta categoria
    for (let i = 0; i < quantity; i++) {
      const uniqueNum = generateUniqueRandomNumber(totalNumbers);
      if (uniqueNum === -1) break; // Não há mais números disponíveis
      
      newPrizes.push({
        number: String(uniqueNum).padStart(6, '0'),
        value: value,
        category: category
      });
    }
    
    // Atualizar apenas a categoria específica
    setGeneratedPrizes(prev => ({
      ...prev,
      [category]: newPrizes
    }));
  };
  
  // Função auxiliar para gerar número aleatório único
  const generateUniqueRandomNumber = (max: number): number => {
    // Se já usamos todos os números possíveis, não há mais números únicos para gerar
    if (usedNumbersRef.current.size >= max) return -1;
    
    let randomNum;
    do {
      randomNum = Math.floor(Math.random() * max) + 1;
    } while (usedNumbersRef.current.has(randomNum));
    
    usedNumbersRef.current.add(randomNum);
    return randomNum;
  };
  
  // Função legada para compatibilidade - não é mais usada diretamente
  const generatePrizes = () => {
    // Primeiro, limpar todos os números usados
    usedNumbersRef.current.clear();
    
    // Gerar para cada categoria ativa
    if (prizeConfig.diamante.active) {
      generatePrizesForCategory('diamante', prizeConfig.diamante.quantity, prizeConfig.diamante.value);
    }
    
    if (prizeConfig.master.active) {
      generatePrizesForCategory('master', prizeConfig.master.quantity, prizeConfig.master.value);
    }
    
    if (prizeConfig.premiado.active) {
      generatePrizesForCategory('premiado', prizeConfig.premiado.quantity, prizeConfig.premiado.value);
    }
  };

  // Funções para expandir/colapsar as listas de números
  const showMoreDiamante = () => {
    setVisibleDiamante(prev => 
      prev === 15 ? generatedPrizes.diamante.length : 15
    );
  };

  const showMoreMaster = () => {
    setVisibleMaster(prev => 
      prev === 15 ? generatedPrizes.master.length : 15
    );
  };

  const showMorePremiado = () => {
    setVisiblePremiado(prev => 
      prev === 15 ? generatedPrizes.premiado.length : 15
    );
  };

  const totalPrizes = Object.values(prizeConfig).reduce((sum, category) => 
    category.active ? sum + category.quantity : sum, 0);

  return (
    <Container $disabled={disabled}>
      <FormHeader>
        <FormTitle>Configuração de Prêmios</FormTitle>
        <FormSubtitle>
          {!totalNumbers ? (
            <RequiredWarning>
              <i className="fas fa-exclamation-triangle"></i> 
              Configure o total de números da rifa primeiro
            </RequiredWarning>
          ) : (
            <FormInfo>
              <FormInfoItem $warning={false}>
                <i className="fas fa-ticket-alt"></i> Total de números: <strong>{totalNumbers}</strong>
              </FormInfoItem>
              <FormInfoItem $warning={totalPrizes > 0 && totalPrizes > totalNumbers * 0.5}>
                <i className="fas fa-trophy"></i> Total de prêmios: <strong>{totalPrizes}</strong>
              </FormInfoItem>
              <FormInfoItem $warning={remainingNumbers < totalNumbers * 0.1}>
                <i className="fas fa-calculator"></i> Restantes: <strong>{remainingNumbers}</strong>
              </FormInfoItem>
            </FormInfo>
          )}
        </FormSubtitle>
      </FormHeader>
      
      {totalPrizes > totalNumbers * 0.5 && totalNumbers > 0 && (
        <WarningAlert>
          <i className="fas fa-exclamation-circle"></i>
          <div>
            <strong>Aviso:</strong> A quantidade de prêmios ({totalPrizes}) é muito alta para o total de números ({totalNumbers}).
            <br/>
            <small>Recomendamos manter o total de prêmios abaixo de 50% do total de números para uma melhor experiência.</small>
          </div>
        </WarningAlert>
      )}
      
      {/* Seção Diamante */}
      <CategorySection>
        <CategoryCard $active={prizeConfig.diamante.active} $category="diamante" $disabled={disabled}>
          <CategoryToggle>
            <Checkbox
              type="checkbox"
              checked={prizeConfig.diamante.active}
              onChange={() => handleToggleCategory('diamante')}
              disabled={disabled}
            />
            <CustomCheckbox />
            <CategoryHeader $category="diamante">
              <CategoryIcon $category="diamante">
                <i className="fas fa-gem"></i>
              </CategoryIcon>
              <CategoryTitle>Diamante</CategoryTitle>
            </CategoryHeader>
          </CategoryToggle>
          
          <CategoryBody $visible={prizeConfig.diamante.active}>
            {prizeConfig.diamante.individualPrizes.length === 0 ? (
              <EmptyPrizeSection>
                <EmptyPrizeIcon>🎁</EmptyPrizeIcon>
                <EmptyPrizeText>Nenhum prêmio adicionado ainda</EmptyPrizeText>
                <PrizeButtonsContainer>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddPhysicalPrize('diamante')}
                    $variant="physical"
                  >
                    <FaGift /> Adicionar Prêmio Físico
                  </AddPrizeButton>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddMoneyPrize('diamante')}
                    $variant="money"
                  >
                    <FaMoneyBillWave /> Adicionar Prêmio em Dinheiro
                  </AddPrizeButton>
                </PrizeButtonsContainer>
              </EmptyPrizeSection>
            ) : (
              <>
                <IndividualPrizesList>
                  {prizeConfig.diamante.individualPrizes.map((individualPrize: IndividualPrize) => (
                    <IndividualPrizeCard key={individualPrize.id} $type={individualPrize.type}>
                      <PrizeCardContent>
                        {individualPrize.type === 'item' ? (
                          <>
                            <PrizeCardImage>
                              {individualPrize.image && (
                                <img 
                                  src={typeof individualPrize.image === 'string' ? individualPrize.image : undefined} 
                                  alt={individualPrize.name || 'Prize image'} 
                                />
                              )}
                            </PrizeCardImage>
                            <PrizeCardInfo>
                              <PrizeCardName>{individualPrize.name}</PrizeCardName>
                              <PrizeCardValue>
                                <FaGift /> Valor: R$ {individualPrize.value.toLocaleString('pt-BR')}
                              </PrizeCardValue>
                              <PrizeCardQuantity>
                                Quantidade: {individualPrize.quantity} unidade{individualPrize.quantity > 1 ? 's' : ''}
                              </PrizeCardQuantity>
                            </PrizeCardInfo>
                          </>
                        ) : (
                          <PrizeCardInfo>
                            <PrizeCardName>
                              <FaMoneyBillWave /> Prêmio em Dinheiro
                            </PrizeCardName>
                            <PrizeCardValue>
                              R$ {individualPrize.value.toLocaleString('pt-BR')} cada
                            </PrizeCardValue>
                            <PrizeCardQuantity>
                              Quantidade: {individualPrize.quantity} prêmio{individualPrize.quantity > 1 ? 's' : ''}
                            </PrizeCardQuantity>
                          </PrizeCardInfo>
                        )}
                      </PrizeCardContent>
                      <PrizeCardActions>
                        {individualPrize.type === 'money' && (
                          <ActionButton
                            type="button"
                            onClick={() => handleEditMoneyPrize('diamante', individualPrize)}
                            $variant="edit"
                          >
                            <FaEdit />
                          </ActionButton>
                        )}
                        <ActionButton
                          type="button"
                          onClick={() => handleRemoveIndividualPrize('diamante', individualPrize.id)}
                          $variant="remove"
                        >
                          <FaTimes />
                        </ActionButton>
                      </PrizeCardActions>
                    </IndividualPrizeCard>
                  ))}
                </IndividualPrizesList>
                
                <PrizeButtonsContainer>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddPhysicalPrize('diamante')}
                    $variant="physical"
                  >
                    <FaPlus /> Prêmio Físico
                  </AddPrizeButton>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddMoneyPrize('diamante')}
                    $variant="money"
                  >
                    <FaPlus /> Prêmio em Dinheiro
                  </AddPrizeButton>
                </PrizeButtonsContainer>
                
                <CategorySummary>
                  <SummaryText>
                    <strong>Total: {prizeConfig.diamante.quantity} prêmios</strong> • 
                    <strong>Valor total: R$ {calculateCategoryTotals(prizeConfig.diamante).totalValue.toLocaleString('pt-BR')}</strong>
                  </SummaryText>
                </CategorySummary>
              </>
            )}
          </CategoryBody>
        </CategoryCard>
        
        {/* Lista de números gerados para Diamante */}
        {prizeConfig.diamante.active && generatedPrizes.diamante.length > 0 && (
          <PrizeListContainer>
            <PrizeCategoryHeader $category="diamante">
              <i className="fas fa-gem"></i> Números Diamante - R$ {prizeConfig.diamante.value.toLocaleString('pt-BR')}
              <PrizeCounter>({generatedPrizes.diamante.length} números)</PrizeCounter>
            </PrizeCategoryHeader>
            <PrizeGridWrapper $expanded={visibleDiamante >= generatedPrizes.diamante.length}>
              <PrizeGrid>
                {generatedPrizes.diamante.slice(0, visibleDiamante).map((prize, index) => (
                  <PrizeItem key={`diamante-${index}`}>
                    <PrizeNumber>{prize.number}</PrizeNumber>
                  </PrizeItem>
                ))}
              </PrizeGrid>
              {generatedPrizes.diamante.length > 15 && (
                <FadeOverlay $visible={visibleDiamante < generatedPrizes.diamante.length} />
              )}
            </PrizeGridWrapper>
            
            {generatedPrizes.diamante.length > 15 && (
              <ExpandButton 
                onClick={showMoreDiamante}
                type="button"
              >
                {visibleDiamante < generatedPrizes.diamante.length 
                  ? <>Ver todos <span>({generatedPrizes.diamante.length})</span></> 
                  : <>Mostrar menos <i className="fas fa-chevron-up"></i></>
                }
              </ExpandButton>
            )}
          </PrizeListContainer>
        )}
      </CategorySection>
      
      {/* Seção Master */}
      <CategorySection>
        <CategoryCard $active={prizeConfig.master.active} $category="master" $disabled={disabled}>
          <CategoryToggle>
            <Checkbox
              type="checkbox"
              checked={prizeConfig.master.active}
              onChange={() => handleToggleCategory('master')}
              disabled={disabled}
            />
            <CustomCheckbox />
            <CategoryHeader $category="master">
              <CategoryIcon $category="master">
                <i className="fas fa-trophy"></i>
              </CategoryIcon>
              <CategoryTitle>Master</CategoryTitle>
            </CategoryHeader>
          </CategoryToggle>
          
          <CategoryBody $visible={prizeConfig.master.active}>
            {prizeConfig.master.individualPrizes.length === 0 ? (
              <EmptyPrizeSection>
                <EmptyPrizeIcon>🏆</EmptyPrizeIcon>
                <EmptyPrizeText>Nenhum prêmio adicionado ainda</EmptyPrizeText>
                <PrizeButtonsContainer>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddPhysicalPrize('master')}
                    $variant="physical"
                  >
                    <FaGift /> Adicionar Prêmio Físico
                  </AddPrizeButton>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddMoneyPrize('master')}
                    $variant="money"
                  >
                    <FaMoneyBillWave /> Adicionar Prêmio em Dinheiro
                  </AddPrizeButton>
                </PrizeButtonsContainer>
              </EmptyPrizeSection>
            ) : (
              <>
                <IndividualPrizesList>
                  {prizeConfig.master.individualPrizes.map((individualPrize: IndividualPrize) => (
                    <IndividualPrizeCard key={individualPrize.id} $type={individualPrize.type}>
                      <PrizeCardContent>
                        {individualPrize.type === 'item' ? (
                          <>
                            <PrizeCardImage>
                              {individualPrize.image && (
                                <img 
                                  src={typeof individualPrize.image === 'string' ? individualPrize.image : undefined} 
                                  alt={individualPrize.name || 'Prize image'} 
                                />
                              )}
                            </PrizeCardImage>
                            <PrizeCardInfo>
                              <PrizeCardName>{individualPrize.name}</PrizeCardName>
                              <PrizeCardValue>
                                <FaGift /> Valor: R$ {individualPrize.value.toLocaleString('pt-BR')}
                              </PrizeCardValue>
                              <PrizeCardQuantity>
                                Quantidade: {individualPrize.quantity} unidade{individualPrize.quantity > 1 ? 's' : ''}
                              </PrizeCardQuantity>
                            </PrizeCardInfo>
                          </>
                        ) : (
                          <PrizeCardInfo>
                            <PrizeCardName>
                              <FaMoneyBillWave /> Prêmio em Dinheiro
                            </PrizeCardName>
                            <PrizeCardValue>
                              R$ {individualPrize.value.toLocaleString('pt-BR')} cada
                            </PrizeCardValue>
                            <PrizeCardQuantity>
                              Quantidade: {individualPrize.quantity} prêmio{individualPrize.quantity > 1 ? 's' : ''}
                            </PrizeCardQuantity>
                          </PrizeCardInfo>
                        )}
                      </PrizeCardContent>
                      <PrizeCardActions>
                        {individualPrize.type === 'money' && (
                          <ActionButton
                            type="button"
                            onClick={() => handleEditMoneyPrize('master', individualPrize)}
                            $variant="edit"
                          >
                            <FaEdit />
                          </ActionButton>
                        )}
                        <ActionButton
                          type="button"
                          onClick={() => handleRemoveIndividualPrize('master', individualPrize.id)}
                          $variant="remove"
                        >
                          <FaTimes />
                        </ActionButton>
                      </PrizeCardActions>
                    </IndividualPrizeCard>
                  ))}
                </IndividualPrizesList>
                
                <PrizeButtonsContainer>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddPhysicalPrize('master')}
                    $variant="physical"
                  >
                    <FaPlus /> Prêmio Físico
                  </AddPrizeButton>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddMoneyPrize('master')}
                    $variant="money"
                  >
                    <FaPlus /> Prêmio em Dinheiro
                  </AddPrizeButton>
                </PrizeButtonsContainer>
                
                <CategorySummary>
                  <SummaryText>
                    <strong>Total: {prizeConfig.master.quantity} prêmios</strong> • 
                    <strong>Valor total: R$ {calculateCategoryTotals(prizeConfig.master).totalValue.toLocaleString('pt-BR')}</strong>
                  </SummaryText>
                </CategorySummary>
              </>
            )}
          </CategoryBody>
        </CategoryCard>
        
        {/* Lista de números gerados para Master */}
        {prizeConfig.master.active && generatedPrizes.master.length > 0 && (
          <PrizeListContainer>
            <PrizeCategoryHeader $category="master">
              <i className="fas fa-trophy"></i> Números Master - R$ {prizeConfig.master.value.toLocaleString('pt-BR')}
              <PrizeCounter>({generatedPrizes.master.length} números)</PrizeCounter>
            </PrizeCategoryHeader>
            <PrizeGridWrapper $expanded={visibleMaster >= generatedPrizes.master.length}>
              <PrizeGrid>
                {generatedPrizes.master.slice(0, visibleMaster).map((prize, index) => (
                  <PrizeItem key={`master-${index}`}>
                    <PrizeNumber>{prize.number}</PrizeNumber>
                  </PrizeItem>
                ))}
              </PrizeGrid>
              {generatedPrizes.master.length > 15 && (
                <FadeOverlay $visible={visibleMaster < generatedPrizes.master.length} />
              )}
            </PrizeGridWrapper>
            
            {generatedPrizes.master.length > 15 && (
              <ExpandButton 
                onClick={showMoreMaster}
                type="button"
              >
                {visibleMaster < generatedPrizes.master.length 
                  ? <>Ver todos <span>({generatedPrizes.master.length})</span></> 
                  : <>Mostrar menos <i className="fas fa-chevron-up"></i></>
                }
              </ExpandButton>
            )}
          </PrizeListContainer>
        )}
      </CategorySection>
      
      {/* Seção Premiado */}
      <CategorySection>
        <CategoryCard $active={prizeConfig.premiado.active} $category="premiado" $disabled={disabled}>
          <CategoryToggle>
            <Checkbox
              type="checkbox"
              checked={prizeConfig.premiado.active}
              onChange={() => handleToggleCategory('premiado')}
              disabled={disabled}
            />
            <CustomCheckbox />
            <CategoryHeader $category="premiado">
              <CategoryIcon $category="premiado">
                <i className="fas fa-award"></i>
              </CategoryIcon>
              <CategoryTitle>Premiado</CategoryTitle>
            </CategoryHeader>
          </CategoryToggle>
          
          <CategoryBody $visible={prizeConfig.premiado.active}>
            {prizeConfig.premiado.individualPrizes.length === 0 ? (
              <EmptyPrizeSection>
                <EmptyPrizeIcon>🏅</EmptyPrizeIcon>
                <EmptyPrizeText>Nenhum prêmio adicionado ainda</EmptyPrizeText>
                <PrizeButtonsContainer>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddPhysicalPrize('premiado')}
                    $variant="physical"
                  >
                    <FaGift /> Adicionar Prêmio Físico
                  </AddPrizeButton>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddMoneyPrize('premiado')}
                    $variant="money"
                  >
                    <FaMoneyBillWave /> Adicionar Prêmio em Dinheiro
                  </AddPrizeButton>
                </PrizeButtonsContainer>
              </EmptyPrizeSection>
            ) : (
              <>
                <IndividualPrizesList>
                  {prizeConfig.premiado.individualPrizes.map((individualPrize: IndividualPrize) => (
                    <IndividualPrizeCard key={individualPrize.id} $type={individualPrize.type}>
                      <PrizeCardContent>
                        {individualPrize.type === 'item' ? (
                          <>
                            <PrizeCardImage>
                              {individualPrize.image && (
                                <img 
                                  src={typeof individualPrize.image === 'string' ? individualPrize.image : undefined} 
                                  alt={individualPrize.name || 'Prize image'} 
                                />
                              )}
                            </PrizeCardImage>
                            <PrizeCardInfo>
                              <PrizeCardName>{individualPrize.name}</PrizeCardName>
                              <PrizeCardValue>
                                <FaGift /> Valor: R$ {individualPrize.value.toLocaleString('pt-BR')}
                              </PrizeCardValue>
                              <PrizeCardQuantity>
                                Quantidade: {individualPrize.quantity} unidade{individualPrize.quantity > 1 ? 's' : ''}
                              </PrizeCardQuantity>
                            </PrizeCardInfo>
                          </>
                        ) : (
                          <PrizeCardInfo>
                            <PrizeCardName>
                              <FaMoneyBillWave /> Prêmio em Dinheiro
                            </PrizeCardName>
                            <PrizeCardValue>
                              R$ {individualPrize.value.toLocaleString('pt-BR')} cada
                            </PrizeCardValue>
                            <PrizeCardQuantity>
                              Quantidade: {individualPrize.quantity} prêmio{individualPrize.quantity > 1 ? 's' : ''}
                            </PrizeCardQuantity>
                          </PrizeCardInfo>
                        )}
                      </PrizeCardContent>
                      <PrizeCardActions>
                        {individualPrize.type === 'money' && (
                          <ActionButton
                            type="button"
                            onClick={() => handleEditMoneyPrize('premiado', individualPrize)}
                            $variant="edit"
                          >
                            <FaEdit />
                          </ActionButton>
                        )}
                        <ActionButton
                          type="button"
                          onClick={() => handleRemoveIndividualPrize('premiado', individualPrize.id)}
                          $variant="remove"
                        >
                          <FaTimes />
                        </ActionButton>
                      </PrizeCardActions>
                    </IndividualPrizeCard>
                  ))}
                </IndividualPrizesList>
                
                <PrizeButtonsContainer>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddPhysicalPrize('premiado')}
                    $variant="physical"
                  >
                    <FaPlus /> Prêmio Físico
                  </AddPrizeButton>
                  <AddPrizeButton 
                    type="button"
                    onClick={() => handleAddMoneyPrize('premiado')}
                    $variant="money"
                  >
                    <FaPlus /> Prêmio em Dinheiro
                  </AddPrizeButton>
                </PrizeButtonsContainer>
                
                <CategorySummary>
                  <SummaryText>
                    <strong>Total: {prizeConfig.premiado.quantity} prêmios</strong> • 
                    <strong>Valor total: R$ {calculateCategoryTotals(prizeConfig.premiado).totalValue.toLocaleString('pt-BR')}</strong>
                  </SummaryText>
                </CategorySummary>
              </>
            )}
          </CategoryBody>
        </CategoryCard>
        
        {/* Lista de números gerados para Premiado */}
        {prizeConfig.premiado.active && generatedPrizes.premiado.length > 0 && (
          <PrizeListContainer>
            <PrizeCategoryHeader $category="premiado">
              <i className="fas fa-award"></i> Números Premiados - R$ {prizeConfig.premiado.value.toLocaleString('pt-BR')}
              <PrizeCounter>({generatedPrizes.premiado.length} números)</PrizeCounter>
            </PrizeCategoryHeader>
            <PrizeGridWrapper $expanded={visiblePremiado >= generatedPrizes.premiado.length}>
              <PrizeGrid>
                {generatedPrizes.premiado.slice(0, visiblePremiado).map((prize, index) => (
                  <PrizeItem key={`premiado-${index}`}>
                    <PrizeNumber>{prize.number}</PrizeNumber>
                  </PrizeItem>
                ))}
              </PrizeGrid>
              {generatedPrizes.premiado.length > 15 && (
                <FadeOverlay $visible={visiblePremiado < generatedPrizes.premiado.length} />
              )}
            </PrizeGridWrapper>
            
            {generatedPrizes.premiado.length > 15 && (
              <ExpandButton 
                onClick={showMorePremiado}
                type="button"
              >
                {visiblePremiado < generatedPrizes.premiado.length 
                  ? <>Ver todos <span>({generatedPrizes.premiado.length})</span></> 
                  : <>Mostrar menos <i className="fas fa-chevron-up"></i></>
                }
              </ExpandButton>
            )}
          </PrizeListContainer>
        )}
      </CategorySection>
      
      {/* Modais */}
      <PrizeSelectorModal 
        isOpen={showPrizeSelector}
        onClose={() => setShowPrizeSelector(false)}
        onSelectPrize={handleSelectPhysicalPrize}
        availablePrizes={availablePrizes}
      />
      
      <MoneyPrizeModal
        isOpen={showMoneyPrizeModal}
        onClose={() => setShowMoneyPrizeModal(false)}
        onSave={handleSaveMoneyPrize}
        editingPrize={editingPrize}
      />
    </Container>
  );
};

const Container = styled.div<{ $disabled: boolean }>`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;   
  opacity: ${({ $disabled }) => $disabled ? 0.7 : 1};
  transition: opacity 0.3s ease;
`;

const FormHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormSubtitle = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RequiredWarning = styled.div`
  color: #e74c3c;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const FormInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FormInfoItem = styled.div<{ $warning?: boolean }>`
  font-size: 0.9rem;
  color: ${({ $warning }) => $warning ? '#e74c3c' : '#2ecc71'};
  font-weight: ${({ $warning }) => $warning ? 700 : 400};
  display: flex;
  align-items: center;
  gap: 0.4rem;
`;

const CategorySection = styled.div`
  margin-bottom: 2rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryCard = styled.div<{ $active: boolean; $category: string; $disabled: boolean }>`
  border: 1px solid ${({ $active, $category, theme }) => {
    if ($active) {
      switch($category) {
        case 'diamante': return 'rgba(153, 33, 232, 0.4)';
        case 'master': return 'rgba(244, 107, 69, 0.4)';
        default: return 'rgba(17, 153, 142, 0.4)';
      }
    }
    return theme.colors.gray.light;
  }};
  
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: ${({ $active, $category }) => {
    if ($active) {
      switch($category) {
        case 'diamante': return '0 4px 12px rgba(153, 33, 232, 0.1)';
        case 'master': return '0 4px 12px rgba(244, 107, 69, 0.1)';
        default: return '0 4px 12px rgba(17, 153, 142, 0.1)';
      }
    }
    return 'none';
  }};
  
  opacity: ${({ $disabled }) => $disabled ? 0.6 : 1};
  
  &:hover {
    box-shadow: ${({ $disabled, $category }) => {
      if ($disabled) return 'none';
      
      switch($category) {
        case 'diamante': return '0 6px 16px rgba(153, 33, 232, 0.15)';
        case 'master': return '0 6px 16px rgba(244, 107, 69, 0.15)';
        default: return '0 6px 16px rgba(17, 153, 142, 0.15)';
      }
    }};
  }
`;

const CategoryToggle = styled.label`
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  user-select: none;
  position: relative;
`;

const Checkbox = styled.input`
  margin-right: 1rem;
  width: 1.2rem;
  height: 1.2rem;
  cursor: pointer;
  opacity: 0;
  position: relative;
  z-index: 2;

  & + span {
    position: absolute;
    left: 1rem;
    display: inline-block;
    width: 1.2rem;
    height: 1.2rem;
    background: ${({ theme }) => theme.colors.background || '#333'};
    border: 2px solid ${({ theme }) => theme.colors.gray.light || '#aaa'};
    border-radius: 3px;
    z-index: 1;
  }

  &:checked + span {
    background: ${({ theme }) => theme.colors.primary || '#6a11cb'};
    border-color: ${({ theme }) => theme.colors.primary || '#6a11cb'};
    
    &:after {
      content: '';
      position: absolute;
      left: 0.3rem;
      top: 0.1rem;
      width: 0.4rem;
      height: 0.7rem;
      border: solid white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  &:focus + span {
    box-shadow: 0 0 0 3px rgba(106, 17, 203, 0.3);
  }
`;

const CustomCheckbox = styled.span``;

const CategoryHeader = styled.div<{ $category: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CategoryIcon = styled.div<{ $category: string }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante': return 'linear-gradient(135deg, rgba(153, 33, 232, 0.1), rgba(153, 33, 232, 0.2))';
      case 'master': return 'linear-gradient(135deg, rgba(244, 107, 69, 0.1), rgba(244, 107, 69, 0.2))';
      default: return 'linear-gradient(135deg, rgba(17, 153, 142, 0.1), rgba(17, 153, 142, 0.2))';
    }
  }};
  
  i {
    font-size: 1.2rem;
    color: ${({ $category }) => {
      switch($category) {
        case 'diamante': return '#9921e8';
        case 'master': return '#f46b45';
        default: return '#11998e';
      }
    }};
  }
`;

const CategoryTitle = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const CategoryBody = styled.div<{ $visible: boolean }>`
  padding: ${({ $visible }) => $visible ? '1.5rem 1rem 1rem' : '0 1rem'};
  max-height: ${({ $visible }) => $visible ? 'none' : '0'};
  overflow: ${({ $visible }) => $visible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
`;

const InputGroup = styled.div`
  margin-bottom: 0.75rem;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  width: 100%;
  padding: 0.6rem;
  border: 1px solid ${({ theme }) => theme.colors.gray.light};
  border-radius: 6px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary || '#fff'};
  background-color: ${({ theme }) => theme.colors.background || '#333'};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.2);
  }
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.gray.dark || '#444'};
    color: ${({ theme }) => theme.colors.gray.light || '#aaa'};
    cursor: not-allowed;
  }
`;

// Componentes para a lista de prêmios gerados
const PrizeListContainer = styled.div`
  margin-top: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 1rem;
  background-color: rgba(0, 0, 0, 0.02);
`;

const PrizeCategoryHeader = styled.h5<{ $category: string }>`
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  color: ${({ $category }) => {
    switch($category) {
      case 'diamante': return '#9921e8';
      case 'master': return '#f46b45';
      default: return '#11998e';
    }
  }};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PrizeGridWrapper = styled.div<{ $expanded: boolean }>`
  position: relative;
  max-height: ${({ $expanded }) => $expanded ? '2000px' : '220px'};
  overflow: hidden;
  transition: max-height 0.5s ease;
`;

const PrizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.6rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.5rem;
  }
`;

const PrizeItem = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  padding: 0.5rem;
  background-color: #f9f9f9;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #f0f0f0;
    transform: translateY(-2px);
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
  }
`;

const PrizeNumber = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PrizeCounter = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-left: 0.5rem;
  font-weight: normal;
`;

const WarningAlert = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 0.75rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  i {
    color: #dc3545;
    font-size: 1.2rem;
  }

  div {
    font-size: 0.9rem;
    color: #721c24;
  }
`;

const FadeOverlay = styled.div<{ $visible: boolean }>`
  display: ${({ $visible }) => $visible ? 'block' : 'none'};
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: linear-gradient(
    to bottom, 
    rgba(249, 249, 249, 0) 0%, 
    rgba(249, 249, 249, 0.8) 60%, 
    rgba(249, 249, 249, 1) 100%
  );
  pointer-events: none;
  z-index: 1;
`;

const ExpandButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: none;
  border: 1px dashed rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  span {
    margin-left: 4px;
    opacity: 0.7;
    font-weight: normal;
  }
  
  i {
    margin-left: 6px;
    font-size: 0.75rem;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors?.primary ? theme.colors.primary + '10' : 'rgba(106, 17, 203, 0.1)'};
    border-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
`;

const EmptyPrizeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  border: 2px dashed rgba(106, 17, 203, 0.2);
  border-radius: 12px;
  text-align: center;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.02) 0%, rgba(37, 117, 252, 0.02) 100%);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(106, 17, 203, 0.3);
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.04) 0%, rgba(37, 117, 252, 0.04) 100%);
  }
`;

const EmptyPrizeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1.5rem;
  opacity: 0.7;
`;

const EmptyPrizeText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 2rem;
  font-weight: 500;
`;

const PrizeButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }
`;

const AddPrizeButton = styled.button<{ $variant: 'physical' | 'money' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: ${({ $variant }) => 
    $variant === 'physical' 
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)'
  };
  border: 1px solid ${({ $variant }) => 
    $variant === 'physical' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'
  };
  border-radius: 8px;
  color: ${({ $variant }) => 
    $variant === 'physical' ? '#16a34a' : '#3b82f6'
  };
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  
  &:hover {
    background: ${({ $variant }) => 
      $variant === 'physical' 
        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(21, 128, 61, 0.15) 100%)'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.15) 100%)'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $variant }) => 
      $variant === 'physical' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'
    };
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const IndividualPrizesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const IndividualPrizeCard = styled.div<{ $type: 'money' | 'item' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: ${({ $type }) => 
    $type === 'item' 
      ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.03) 0%, rgba(21, 128, 61, 0.03) 100%)'
      : 'linear-gradient(135deg, rgba(59, 130, 246, 0.03) 0%, rgba(37, 99, 235, 0.03) 100%)'
  };
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background: ${({ $type }) => 
      $type === 'item' 
        ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(21, 128, 61, 0.06) 100%)'
        : 'linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(37, 99, 235, 0.06) 100%)'
    };
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border-color: ${({ $type }) => 
      $type === 'item' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)'
    };
  }
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const PrizeCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 0;
`;

const PrizeCardImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 640px) {
    width: 50px;
    height: 50px;
  }
`;

const PrizeCardInfo = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const PrizeCardName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1f2937'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    font-size: 1.1rem;
    color: #6a11cb;
  }
`;

const PrizeCardValue = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    font-size: 0.9rem;
    color: #10b981;
  }
`;

const PrizeCardQuantity = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#9ca3af'};
  font-weight: 500;
`;

const PrizeCardActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  
  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const ActionButton = styled.button<{ $variant: 'edit' | 'remove' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid ${({ $variant }) => 
    $variant === 'edit' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'
  };
  border-radius: 8px;
  color: ${({ $variant }) => 
    $variant === 'edit' ? '#3b82f6' : '#ef4444'
  };
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${({ $variant }) => 
      $variant === 'edit' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)'
    };
    border-color: ${({ $variant }) => 
      $variant === 'edit' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(239, 68, 68, 0.5)'
    };
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const CategorySummary = styled.div`
  margin-top: 1.5rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%);
  border: 1px solid rgba(106, 17, 203, 0.1);
  border-radius: 10px;
  text-align: center;
`;

const SummaryText = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#374151'};
  font-weight: 600;
  
  strong {
    color: #6a11cb;
  }
`;

// Styled components for modals
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30px;
  animation: slideUp 0.3s ease forwards;
  position: relative;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #6a11cb;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ef4444;
    transform: rotate(90deg);
  }
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 8px;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f5f5f5;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

export default PrizeConfigForm; 