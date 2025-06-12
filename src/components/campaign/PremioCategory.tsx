import React from 'react';
import styled from 'styled-components';
import { formatCurrency } from '@/utils/formatNumber';

// Interfaces
interface PremioInterface {
  number: string;
  value: number;
  winner: string | null;
  category: string;
  chance: string;
  emoji: string;
}

interface FoundTitleInterface {
  number: string;
  name: string;
  value: number;
  date: string;
  category: string;
}

interface PremioCategoryProps {
  category: string;
  title: string;
  icon: string;
  prizeValue: number;
  quantity: number;
  prizes: PremioInterface[];
  visibleItems: number;
  onLoadMore: () => void;
  foundTitles: FoundTitleInterface[];
}

// Styled Components
const ListaPremiosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.3rem;
  }
`;

const PremioCard = styled.div<{ $category: string; $found?: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background: ${({ $found }) => $found ? '#f9f9f9' : 'white'};
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  
  // More subtle shadow for a cleaner look
  box-shadow: ${({ $category, $found }) => {
    const baseStyle = $found ? '0 2px 8px rgba(0, 0, 0, 0.05)' : '';
    
    switch($category) {
      case 'diamante':
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(153, 33, 232, 0.2)`
          : '0 4px 12px rgba(153, 33, 232, 0.08), 0 2px 6px rgba(153, 33, 232, 0.04)';
      case 'master':
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(244, 107, 69, 0.2)`
          : '0 4px 12px rgba(244, 107, 69, 0.08), 0 2px 6px rgba(244, 107, 69, 0.04)';
      default:
        return $found 
          ? `${baseStyle}, inset 0 0 0 1px rgba(17, 153, 142, 0.2)`
          : '0 4px 12px rgba(17, 153, 142, 0.08), 0 2px 6px rgba(17, 153, 142, 0.04)';
    }
  }};
  
  transform: perspective(800px) rotateX(0) rotateY(0);
  transform-style: preserve-3d;
  
  &:hover {
    transform: ${({ $found }) => $found ? 'none' : 'perspective(800px) rotateX(1deg) rotateY(-2deg) translateY(-2px)'};
    box-shadow: ${({ $category, $found }) => {
      if ($found) return; // No hover effect for found titles
      
      switch($category) {
        case 'diamante':
          return '0 10px 20px rgba(153, 33, 232, 0.12), 0 6px 10px rgba(153, 33, 232, 0.08)';
        case 'master':
          return '0 10px 20px rgba(244, 107, 69, 0.12), 0 6px 10px rgba(244, 107, 69, 0.08)';
        default:
          return '0 10px 20px rgba(17, 153, 142, 0.12), 0 6px 10px rgba(17, 153, 142, 0.08)';
      }
    }};
    
    .card-shine {
      opacity: ${({ $found }) => $found ? 0 : 0.6};
    }
    
    .card-prize {
      transform: ${({ $found }) => $found ? 'none' : 'translateZ(12px)'};
    }
  }
`;

const CardTopBar = styled.div<{ $category: string }>`
  height: 3px;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(90deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(90deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(90deg, #11998e, #38ef7d)';
    }
  }};
`;

const CardContent = styled.div`
  padding: 0.6rem;
  display: grid;
  grid-template-areas: 
    "number tag"
    "prize prize"
    "status status";
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.25rem;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 0.3rem;
    gap: 0.15rem;
  }
`;

const CardSparkle = styled.div`
  display: none;
`;

const CardShine = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.3) 0%,
    rgba(255, 255, 255, 0) 60%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
`;

const CardNumber = styled.div`
  grid-area: number;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  transition: transform 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  padding: 0.25rem 0.4rem;
  background: #f7f7ff;
  border-radius: 6px;
  border: 1px dashed rgba(106, 17, 203, 0.2);
`;

const CardEmoji = styled.span`
  font-size: 0.9rem;
  margin-right: 0.3rem;
  flex-shrink: 0;
`;

const CardPrize = styled.div<{ $category: string }>`
  grid-area: prize;
  font-size: 1.2rem;
  font-weight: 800;
  transition: transform 0.3s ease;
  letter-spacing: -0.02em;
  margin: 0.1rem 0;
  
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(135deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(135deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const CardStatus = styled.div`
  grid-area: status;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  font-size: 0.7rem;
  font-weight: 600;
  color: #2ecc71;
  
  i {
    font-size: 0.8rem;
    margin-right: 0.2rem;
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    background: ${({ theme }) => theme.colors.background};
    padding: 0.15rem 0.4rem;
    border-radius: 10px;
    font-size: 0.65rem;
  }
`;

const CardTag = styled.div<{ $category: string }>`
  grid-area: tag;
  position: relative;
  padding: 0.15rem 0.35rem;
  font-size: 0.6rem;
  font-weight: 700;
  color: white;
  z-index: 2;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(135deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(135deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
  }};
`;

const CategoryHeader = styled.div<{ $category: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  
  ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return `
          background: linear-gradient(135deg, rgba(153, 33, 232, 0.05), rgba(95, 114, 189, 0.08));
        `;
      case 'master':
        return `
          background: linear-gradient(135deg, rgba(244, 107, 69, 0.05), rgba(238, 168, 73, 0.08));
        `;
      default:
        return `
          background: linear-gradient(135deg, rgba(17, 153, 142, 0.05), rgba(56, 239, 125, 0.08));
        `;
    }
  }}
  
  border-radius: 10px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
`;

const CategoryIconWrapper = styled.div<{ $category: string }>`
  width: 38px;
  height: 38px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  // Glass effect
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  
  // Inner glow effect
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 19px;
    padding: 1.5px;
    background: ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return 'linear-gradient(135deg, #9921e8, #5f72bd)';
        case 'master':
          return 'linear-gradient(135deg, #f46b45, #eea849)';
        default:
          return 'linear-gradient(135deg, #11998e, #38ef7d)';
      }
    }};
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: destination-out;
    mask-composite: exclude;
  }
  
  i {
    font-size: 1.1rem;
    z-index: 2;
    background: ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return 'linear-gradient(135deg, #9921e8, #5f72bd)';
        case 'master':
          return 'linear-gradient(135deg, #f46b45, #eea849)';
        default:
          return 'linear-gradient(135deg, #11998e, #38ef7d)';
      }
    }};
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
`;

const CategoryInfo = styled.div`
  flex: 1;
`;

const CategoryName = styled.div<{ $category: string }>`
  font-size: 1.1rem;
  font-weight: 800;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'linear-gradient(135deg, #9921e8, #5f72bd)';
      case 'master':
        return 'linear-gradient(135deg, #f46b45, #eea849)';
      default:
        return 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
  }};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.01em;
`;

const CategoryMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.25rem;
`;

const CategoryMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.secondary};
  
  i {
    font-size: 0.75rem;
    opacity: 0.7;
  }
`;

const FoundOverlay = styled.div<{ $category: string }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  
  &::after {
    content: 'ENCONTRADO';
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    /* Remove the diagonal transform: */
    /* transform: rotate(-45deg); */
    padding: 0.4rem 1.2rem;
    background: ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return 'rgba(153, 33, 232, 0.15)';
        case 'master':
          return 'rgba(244, 107, 69, 0.15)';
        default:
          return 'rgba(17, 153, 142, 0.15)';
      }
    }};
    color: ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return '#9921e8';
        case 'master':
          return '#f46b45';
        default:
          return '#11998e';
      }
    }};
    border: 1px dashed ${({ $category }) => {
      switch($category) {
        case 'diamante':
          return 'rgba(153, 33, 232, 0.4)';
        case 'master':
          return 'rgba(244, 107, 69, 0.4)';
        default:
          return 'rgba(17, 153, 142, 0.4)';
      }
    }};
    border-radius: 4px;
    
    @media (max-width: 768px) {
      font-size: 0.65rem;
      padding: 0.3rem 0.8rem;
      border-radius: 3px;
    }
  }
`;

const FoundBadge = styled.div<{ $category: string }>`
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  top: 8px;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 20;
  font-size: 0.75rem;
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease;
  border-left: 3px solid ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return '#9921e8';
      case 'master':
        return '#f46b45';
      default:
        return '#11998e';
    }
  }};
  
  @media (max-width: 768px) {
    bottom: 6px;
    left: 6px;
    right: 6px;
    top: 6px;
    padding: 0.35rem;
    font-size: 0.65rem;
    border-radius: 4px;
    border-left-width: 2px;
  }
  
  strong {
    display: block;
    margin-bottom: 0.2rem;
    color: ${({ theme }) => theme.colors.text.primary};
    
    @media (max-width: 768px) {
      margin-bottom: 0.15rem;
      font-size: 0.8rem;
    }
  }
  
  span {
    color: ${({ theme }) => theme.colors.text.secondary};
    display: flex;
    align-items: center;
    gap: 0.3rem;
    
    @media (max-width: 768px) {
      gap: 0.2rem;
      font-size: 0.9rem;
    }
    
    i {
      font-size: 0.7rem;
      opacity: 0.7;
      
      @media (max-width: 768px) {
        font-size: 0.6rem;
      }
    }
  }
`;

const FoundBadgeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  padding-bottom: 0.4rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    margin-bottom: 0.3rem;
    padding-bottom: 0.3rem;
  }
`;

const FoundLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 800;
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  letter-spacing: 0.05em;
  
  @media (max-width: 768px) {
    font-size: 0.6rem;
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
  }
`;

const FoundValue = styled.div`
  font-size: 0.8rem;
  font-weight: 700;
  color: #2ecc71;
  
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const FoundDetails = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.4rem;
  
  @media (max-width: 768px) {
    margin-top: 0.3rem;
  }
`;

const FoundNumber = styled.span<{ $category: string }>`
  font-weight: 700;
  font-size: 0.75rem;
  color: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return '#9921e8';
      case 'master':
        return '#f46b45';
      default:
        return '#11998e';
    }
  }};
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: ${({ $category }) => {
    switch($category) {
      case 'diamante':
        return 'rgba(153, 33, 232, 0.1)';
      case 'master':
        return 'rgba(244, 107, 69, 0.1)';
      default:
        return 'rgba(17, 153, 142, 0.1)';
    }
  }};
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
    gap: 0.2rem;
    border-radius: 3px;
  }
  
  i {
    font-size: 0.7rem;
    
    @media (max-width: 768px) {
      font-size: 0.6rem;
    }
  }
`;

const VerMaisButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: auto;
  padding: 0.5rem 1rem;
  margin: 0.75rem auto;
  background: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px dashed ${({ theme }) => `${theme.colors.primary}30`};
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}08`};
    border: 1px dashed ${({ theme }) => `${theme.colors.primary}60`};
  }
  
  i {
    margin-left: 0.5rem;
    font-size: 0.8rem;
  }
`;

const MeusNumerosButton = styled(VerMaisButton)`
  border: 1px dashed rgba(52, 152, 219, 0.3);
  color: #3498db;
  
  &:hover {
    background: rgba(52, 152, 219, 0.08);
    border: 1px dashed rgba(52, 152, 219, 0.6);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin: 0.75rem 0;
`;

// Helper functions
const isNumberFound = (number: string, foundTitles: FoundTitleInterface[]): boolean => {
  return foundTitles.some(title => title.number === number);
};

const getWinnerInfo = (number: string, foundTitles: FoundTitleInterface[]): FoundTitleInterface | undefined => {
  return foundTitles.find(title => title.number === number);
};

// Main component
const PremioCategory: React.FC<PremioCategoryProps> = ({ 
  category, 
  title, 
  icon, 
  prizeValue, 
  quantity, 
  prizes, 
  visibleItems, 
  onLoadMore,
  foundTitles 
}) => {
  const filteredPrizes = prizes.filter(prize => prize.category === category);
  
  console.log(`Categoria: ${category}, Total: ${filteredPrizes.length}, Visíveis: ${visibleItems}`);
  
  return (
    <>
      <CategoryHeader $category={category}>
        <CategoryIconWrapper $category={category}>
          <i className={`fas ${icon}`}></i>
        </CategoryIconWrapper>
        <CategoryInfo>
          <CategoryName $category={category}>{title}</CategoryName>
          <CategoryMeta>
            <CategoryMetaItem>
              <i className="fas fa-money-bill-wave"></i> Prêmio: {formatCurrency(prizeValue)}
            </CategoryMetaItem>
            <CategoryMetaItem>
              <i className="fas fa-tag"></i> Quantidade: {quantity}
            </CategoryMetaItem>
          </CategoryMeta>
        </CategoryInfo>
      </CategoryHeader>
      
      <ListaPremiosGrid>
        {filteredPrizes
          .slice(0, visibleItems)
          .map((premio, index) => {
            const found = isNumberFound(premio.number, foundTitles);
            const winnerInfo = found ? getWinnerInfo(premio.number, foundTitles) : undefined;
            
            return (
              <PremioCard key={index} $category={category} $found={found}>
                <CardTopBar $category={category} />
                <CardContent>
                  <CardTag $category={category}>{title}</CardTag>
                  <CardSparkle className="card-sparkle" />
                  <CardShine className="card-shine" />
                  
                  <CardNumber className="card-number">
                    <CardEmoji>{premio.emoji}</CardEmoji>
                    {premio.number}
                  </CardNumber>
                  
                  <CardPrize className="card-prize" $category={category}>
                    {formatCurrency(premio.value)}
                  </CardPrize>
                  
                  <CardStatus>
                    <div>
                      <i className={found ? "fas fa-check" : "fas fa-check-circle"}></i> 
                      {found ? "Encontrado" : "Disponível"}
                    </div>
                    <span>{premio.chance}</span>
                  </CardStatus>
                </CardContent>
                
                {found && <FoundOverlay $category={category} />}
                
                {found && winnerInfo && (
                  <FoundBadge $category={category}>
                    <FoundBadgeHeader>
                      <FoundLabel>ENCONTRADO</FoundLabel>
                      <FoundValue>{formatCurrency(winnerInfo.value)}</FoundValue>
                    </FoundBadgeHeader>
                    <strong>{winnerInfo.name}</strong>
                    <FoundDetails>
                      <span>
                        <i className="fas fa-calendar-alt"></i>
                        {winnerInfo.date}
                      </span>
                      <FoundNumber $category={category}>
                        <i className="fas fa-hashtag"></i>
                        {winnerInfo.number}
                      </FoundNumber>
                    </FoundDetails>
                  </FoundBadge>
                )}
              </PremioCard>
            );
          })}
      </ListaPremiosGrid>
      
      {filteredPrizes.length > visibleItems && (
        <VerMaisButton onClick={onLoadMore}>
          Ver mais <i className="fas fa-chevron-down"></i>
        </VerMaisButton>
      )}
    </>
  );
};

export default PremioCategory; 