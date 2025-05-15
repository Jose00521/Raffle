import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
}

interface PrizeConfigProps {
  totalNumbers: number;
  onPrizeConfigChange: (config: PrizeCategoriesConfig) => void;
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

const PrizeConfigForm: React.FC<PrizeConfigProps> = ({ 
  totalNumbers, 
  onPrizeConfigChange,
  disabled = false
}) => {
  const [prizeConfig, setPrizeConfig] = useState<PrizeCategoriesConfig>({
    diamante: { active: false, quantity: 10, value: 2000 },
    master: { active: false, quantity: 20, value: 1000 },
    premiado: { active: false, quantity: 50, value: 500 }
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
  
  // When totalNumbers changes, ensure quantities don't exceed the total
  useEffect(() => {
    if (!totalNumbers) return;
    
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
  }, [totalNumbers]); // Only depend on totalNumbers, not prizeConfig or onPrizeConfigChange
  
  const handleToggleCategory = (category: keyof PrizeCategoriesConfig) => {
    if (disabled) return;
    
    // Calcular total atual de números em categorias ativas (exceto a que está sendo alterada)
    const otherCategoriesTotal = Object.entries(prizeConfig)
      .filter(([key]) => key !== category && prizeConfig[key as keyof PrizeCategoriesConfig].active)
      .reduce((sum, [_, cat]) => sum + cat.quantity, 0);
      
    // Criar cópia do config
    const updatedConfig = { ...prizeConfig };
    
    // Se estamos ativando a categoria, precisamos verificar se há espaço suficiente
    if (!prizeConfig[category].active) {
      const requestedQuantity = prizeConfig[category].quantity;
      const availableSpace = totalNumbers - otherCategoriesTotal;
      
      // Ajustar a quantidade para não exceder o espaço disponível
      const adjustedQuantity = Math.min(requestedQuantity, availableSpace, 100);
      
      // Se não houver espaço (ou muito pouco), ajustar para pelo menos 1
      updatedConfig[category] = {
        ...updatedConfig[category],
        active: true,
        quantity: Math.max(1, adjustedQuantity)
      };
    } else {
      // Desativando a categoria simplesmente
      updatedConfig[category] = {
        ...updatedConfig[category],
        active: false
      };
    }
    
    setPrizeConfig(updatedConfig);
    onPrizeConfigChange(updatedConfig);
    
    // Gerar ou limpar números apenas para a categoria alterada
    if (updatedConfig[category].active) {
      // Se a categoria está sendo ativada, gerar novos números
      generatePrizesForCategory(category, updatedConfig[category].quantity, updatedConfig[category].value);
    } else {
      // Se a categoria está sendo desativada, limpar seus números e remover do set de usados
      clearCategoryNumbers(category);
    }
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
            <InputGroup>
              <InputLabel>Quantidade</InputLabel>
              <Input 
                type="number" 
                min="1"
                max="100"
                value={prizeConfig.diamante.quantity} 
                onChange={(e) => handleValueChange('diamante', 'quantity', parseInt(e.target.value))}
                disabled={!prizeConfig.diamante.active || disabled}
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel>Valor do prêmio (R$)</InputLabel>
              <Input 
                type="number" 
                min="1"
                value={prizeConfig.diamante.value} 
                onChange={(e) => handleValueChange('diamante', 'value', parseInt(e.target.value))}
                disabled={!prizeConfig.diamante.active || disabled}
              />
            </InputGroup>
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
            <InputGroup>
              <InputLabel>Quantidade</InputLabel>
              <Input 
                type="number" 
                min="1"
                max="100"
                value={prizeConfig.master.quantity} 
                onChange={(e) => handleValueChange('master', 'quantity', parseInt(e.target.value))}
                disabled={!prizeConfig.master.active || disabled}
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel>Valor do prêmio (R$)</InputLabel>
              <Input 
                type="number" 
                min="1"
                value={prizeConfig.master.value} 
                onChange={(e) => handleValueChange('master', 'value', parseInt(e.target.value))}
                disabled={!prizeConfig.master.active || disabled}
              />
            </InputGroup>
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
            <InputGroup>
              <InputLabel>Quantidade</InputLabel>
              <Input 
                type="number" 
                min="1"
                max="100"
                value={prizeConfig.premiado.quantity} 
                onChange={(e) => handleValueChange('premiado', 'quantity', parseInt(e.target.value))}
                disabled={!prizeConfig.premiado.active || disabled}
              />
            </InputGroup>
            
            <InputGroup>
              <InputLabel>Valor do prêmio (R$)</InputLabel>
              <Input 
                type="number" 
                min="1"
                value={prizeConfig.premiado.value} 
                onChange={(e) => handleValueChange('premiado', 'value', parseInt(e.target.value))}
                disabled={!prizeConfig.premiado.active || disabled}
              />
            </InputGroup>
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
  padding: ${({ $visible }) => $visible ? '0 1rem 1rem' : '0 1rem'};
  max-height: ${({ $visible }) => $visible ? '200px' : '0'};
  overflow: hidden;
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
  color: ${({ theme }) => theme.colors.primary || '#6a11cb'};
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
    background-color: rgba(106, 17, 203, 0.05);
    border-color: rgba(106, 17, 203, 0.2);
  }
`;

export default PrizeConfigForm; 