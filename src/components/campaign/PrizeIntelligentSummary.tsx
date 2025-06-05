import React from 'react';
import styled from 'styled-components';
import { 
  FaTrophy, 
  FaMoneyBillWave, 
  FaPercentage, 
  FaCalculator,
  FaCloudUploadAlt,
  FaSearch,
  FaInfoCircle,
  FaInfo
} from 'react-icons/fa';

// Interfaces
interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
  individualPrizes?: IndividualPrize[];
}

interface IndividualPrize {
  id?: string;
  type: 'money' | 'item';
  quantity: number;
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
  category?: string;
}

interface PrizeCategoriesConfig {
  diamante: PrizeCategory;
  master: PrizeCategory;
  premiado: PrizeCategory;
}

interface InstantPrize {
  id?: string;
  categoryId?: string;
  number: string;
  value: number;
  claimed?: boolean;
  type?: 'money' | 'item';
  prizeId?: string;
  name?: string;
  image?: string;
}

interface PrizeIntelligentSummaryProps {
  instantPrizes: InstantPrize[];
  totalNumbers: number;
  prizeCategories: PrizeCategoriesConfig | undefined;
  individualNumberPrice: number | undefined;
}

// Styled components
const PrizeIntelligentSummary = styled.div`
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.03) 0%, rgba(37, 117, 252, 0.03) 100%);
  border-radius: 16px;
  padding: 24px;
  margin-top: 32px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 4px 20px rgba(106, 17, 203, 0.05);
`;

const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(106, 17, 203, 0.1);
  
  h4 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const SummaryBadge = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.2);
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(106, 17, 203, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(106, 17, 203, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  
  svg {
    color: #6a11cb;
    font-size: 1.3rem;
  }
  
  span {
    font-size: 0.95rem;
    font-weight: 600;
    color: #666;
  }
`;

const CardValue = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: #6a11cb;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const CardPercentage = styled.div`
  font-size: 0.85rem;
  color: #888;
  font-weight: 500;
`;

const CategoryDistribution = styled.div`
  margin-bottom: 32px;
  
  h5 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CategoryCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const CategoryHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const CategoryName = styled.h6`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CategoryBadge = styled.div<{ percentage: number }>`
  background: ${({ percentage }) => 
    percentage > 10 ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)' :
    percentage > 5 ? 'linear-gradient(135deg, #ffa726 0%, #ff9800 100%)' :
    'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)'
  };
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const CategoryStats = styled.div`
  margin-bottom: 16px;
`;

const StatRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
`;

const StatValue = styled.span<{ $highlight?: boolean }>`
  font-size: 0.9rem;
  font-weight: ${({ $highlight }) => $highlight ? '700' : '600'};
  color: ${({ $highlight }) => $highlight ? '#6a11cb' : '#333'};
`;

const CategoryProgress = styled.div`
  margin-top: 16px;
`;

const ProgressBar = styled.div<{ percentage: number }>`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
  
  &::after {
    content: '';
    display: block;
    width: ${({ percentage }) => Math.min(percentage, 100)}%;
    height: 100%;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    transition: width 0.5s ease;
  }
`;

const ProgressLabel = styled.div`
  font-size: 0.8rem;
  color: #888;
  text-align: center;
`;

const PrizeActions = styled.div`
  margin-bottom: 32px;
  
  h5 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const ActionButton = styled.button<{ variant: 'download' | 'search' | 'stats' | 'preview' }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  background: ${({ variant }) => {
    switch (variant) {
      case 'download': return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)';
      case 'search': return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
      case 'stats': return 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)';
      case 'preview': return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)';
      default: return 'rgba(106, 17, 203, 0.1)';
    }
  }};
  border: 1px solid ${({ variant }) => {
    switch (variant) {
      case 'download': return 'rgba(34, 197, 94, 0.2)';
      case 'search': return 'rgba(59, 130, 246, 0.2)';
      case 'stats': return 'rgba(168, 85, 247, 0.2)';
      case 'preview': return 'rgba(245, 158, 11, 0.2)';
      default: return 'rgba(106, 17, 203, 0.2)';
    }
  }};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px ${({ variant }) => {
      switch (variant) {
        case 'download': return 'rgba(34, 197, 94, 0.15)';
        case 'search': return 'rgba(59, 130, 246, 0.15)';
        case 'stats': return 'rgba(168, 85, 247, 0.15)';
        case 'preview': return 'rgba(245, 158, 11, 0.15)';
        default: return 'rgba(106, 17, 203, 0.15)';
      }
    }};
  }
  
  svg {
    font-size: 1.5rem;
    color: ${({ variant }) => {
      switch (variant) {
        case 'download': return '#22c55e';
        case 'search': return '#3b82f6';
        case 'stats': return '#a855f7';
        case 'preview': return '#f59e0b';
        default: return '#6a11cb';
      }
    }};
  }
  
  span {
    font-size: 1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
  
  small {
    font-size: 0.8rem;
    color: #666;
    line-height: 1.3;
  }
`;

const PrizeInsights = styled.div`
  h5 {
    font-size: 1.1rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
    margin: 0 0 20px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const InsightsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InsightItem = styled.div<{ type: 'success' | 'info' | 'premium' }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-radius: 10px;
  background: ${({ type }) => {
    switch (type) {
      case 'success': return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)';
      case 'info': return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
      case 'premium': return 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)';
      default: return 'rgba(106, 17, 203, 0.1)';
    }
  }};
  border: 1px solid ${({ type }) => {
    switch (type) {
      case 'success': return 'rgba(34, 197, 94, 0.2)';
      case 'info': return 'rgba(59, 130, 246, 0.2)';
      case 'premium': return 'rgba(168, 85, 247, 0.2)';
      default: return 'rgba(106, 17, 203, 0.2)';
    }
  }};
  
  svg {
    color: ${({ type }) => {
      switch (type) {
        case 'success': return '#22c55e';
        case 'info': return '#3b82f6';
        case 'premium': return '#a855f7';
        default: return '#6a11cb';
      }
    }};
    font-size: 1.2rem;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  span {
    font-size: 0.9rem;
    line-height: 1.5;
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
`;

// Helper function
const formatPrizeValue = (value: string | number): string => {
  if (!value) return 'R$ 0,00';
  
  const valueString = typeof value === 'number' ? value.toString() : value;
  
  if (valueString.includes('R$')) {
    return valueString;
  }
  
  const extractNumericValue = (valueString: string): number => {
    try {
      const cleanString = valueString.replace(/[^\d,.]/g, '');
      const normalizedString = cleanString.replace(/,/g, '.');
      const value = parseFloat(normalizedString);
      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error("Erro ao extrair valor numérico:", error);
      return 0;
    }
  };
  
  const numericValue = extractNumericValue(valueString);
  
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(numericValue);
};

// Main component
const PrizeIntelligentSummaryComponent: React.FC<PrizeIntelligentSummaryProps> = ({ 
  instantPrizes, 
  totalNumbers, 
  prizeCategories, 
  individualNumberPrice 
}) => {
  const safePrizeCategories = prizeCategories || {};

  return (
    <PrizeIntelligentSummary>
      <SummaryHeader>
        <h4>📊 Resumo dos Prêmios Instantâneos</h4>
        <SummaryBadge>
          {instantPrizes.length} prêmios configurados
        </SummaryBadge>
      </SummaryHeader>
      
      <SummaryGrid>
        <SummaryCard>
          <CardHeader>
            <FaTrophy />
            <span>Total de Prêmios</span>
          </CardHeader>
          <CardValue>{instantPrizes.length}</CardValue>
          <CardPercentage>
            {((instantPrizes.length / totalNumbers) * 100).toFixed(2)}% dos números
          </CardPercentage>
        </SummaryCard>
        
        <SummaryCard>
          <CardHeader>
            <FaMoneyBillWave />
            <span>Valor Total</span>
          </CardHeader>
          <CardValue>
            {formatPrizeValue(
              instantPrizes.reduce((sum, prize) => sum + prize.value, 0)
            )}
          </CardValue>
          <CardPercentage>
            Em prêmios instantâneos
          </CardPercentage>
        </SummaryCard>
        
        <SummaryCard>
          <CardHeader>
            <FaPercentage />
            <span>Chance Média</span>
          </CardHeader>
          <CardValue>
            1 em {Math.round(totalNumbers / instantPrizes.length)}
          </CardValue>
          <CardPercentage>
            números ganha prêmio
          </CardPercentage>
        </SummaryCard>
        
        <SummaryCard>
          <CardHeader>
            <FaCalculator />
            <span>Valor Médio</span>
          </CardHeader>
          <CardValue>
            {formatPrizeValue(
              instantPrizes.reduce((sum, prize) => sum + prize.value, 0) / 
              instantPrizes.length
            )}
          </CardValue>
          <CardPercentage>
            por prêmio
          </CardPercentage>
        </SummaryCard>
      </SummaryGrid>
      
      {/* Distribuição por Categoria */}
      {Object.keys(safePrizeCategories).length > 0 && (
        <CategoryDistribution>
          <h5>🏆 Distribuição por Categoria</h5>
          <CategoryGrid>
            {Object.entries(safePrizeCategories).map(([categoryKey, category]) => {
              const categoryData = category as PrizeCategory;
              
              if (!categoryData?.active) return null;
              
              const totalValue = categoryData.quantity * categoryData.value;
              const percentage = (categoryData.quantity / totalNumbers) * 100;
              
              return (
                <CategoryCard key={categoryKey}>
                  <CategoryHeader>
                    <CategoryName>
                      {categoryKey === 'diamante' && '💎'} 
                      {categoryKey === 'master' && '🥇'} 
                      {categoryKey === 'premiado' && '🎁'} 
                      {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}
                    </CategoryName>
                    <CategoryBadge percentage={percentage}>
                      {percentage.toFixed(1)}%
                    </CategoryBadge>
                  </CategoryHeader>
                  
                  <CategoryStats>
                    <StatRow>
                      <StatLabel>Quantidade:</StatLabel>
                      <StatValue>{categoryData.quantity} prêmios</StatValue>
                    </StatRow>
                    <StatRow>
                      <StatLabel>Valor unitário:</StatLabel>
                      <StatValue>{formatPrizeValue(categoryData.value)}</StatValue>
                    </StatRow>
                    <StatRow>
                      <StatLabel>Valor total:</StatLabel>
                      <StatValue $highlight>{formatPrizeValue(totalValue)}</StatValue>
                    </StatRow>
                    <StatRow>
                      <StatLabel>Chance:</StatLabel>
                      <StatValue>1 em {Math.round(totalNumbers / categoryData.quantity)}</StatValue>
                    </StatRow>
                  </CategoryStats>
                  
                  <CategoryProgress>
                    <ProgressBar percentage={percentage} />
                    <ProgressLabel>{categoryData.quantity} de {totalNumbers} números</ProgressLabel>
                  </CategoryProgress>
                </CategoryCard>
              );
            })}
          </CategoryGrid>
        </CategoryDistribution>
      )}
      
      {/* Ferramentas e Ações */}
      {/* <PrizeActions>
        <h5>🛠 Ferramentas de Análise</h5>
        <ActionsGrid>
          <ActionButton variant="download">
            <FaCloudUploadAlt />
            <span>Exportar Lista Completa</span>
            <small>Download Excel/CSV com todos os números</small>
          </ActionButton>
          
          <ActionButton variant="search">
            <FaSearch />
            <span>Buscar Número Específico</span>
            <small>Verificar se um número tem prêmio</small>
          </ActionButton>
          
          <ActionButton variant="stats">
            <FaCalculator />
            <span>Análise Estatística</span>
            <small>Distribuição e padrões dos prêmios</small>
          </ActionButton>
          
          <ActionButton variant="preview">
            <FaInfoCircle />
            <span>Preview do Participante</span>
            <small>Como os compradores verão os prêmios</small>
          </ActionButton>
        </ActionsGrid>
      </PrizeActions> */}
      
      {/* Insights Inteligentes */}
      {/* <PrizeInsights>
        <h5>💡 Insights da Configuração</h5>
        <InsightsList>
          <InsightItem type="success">
            <FaInfo />
            <span>
              Excelente distribuição! {((instantPrizes.length / totalNumbers) * 100).toFixed(1)}% dos números têm prêmios, 
              garantindo boa motivação para os participantes.
            </span>
          </InsightItem>
        </InsightsList>
      </PrizeInsights> */}
    </PrizeIntelligentSummary>
  );
};

export default PrizeIntelligentSummaryComponent; 