'use client';

import React from 'react';
import styled from 'styled-components';
import { FaMoneyBill, FaGift, FaTrashAlt, FaPlusCircle, FaInfoCircle, FaTrophy } from 'react-icons/fa';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';

export interface PrizeItemProps {
  prizeId?: string;
  name: string;
  value: string;
  image?: string;
  position?: number;
}

interface MultiPrizePositionProps {
  position: number;
  prizes: PrizeItemProps[];
  onAddPrize: (position: number) => void;
  onRemovePrize: (position: number, prizeIndex: number) => void;
  onCreatePrize?: () => void;
  maxPrizes?: number;
}

// Styled components
const PrizePositionCard = styled.div<{ $position: number }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  margin-bottom: 28px;
  position: relative;
  overflow: hidden;
  ${props => props.$position === 1 ? `
    padding: 0;
  ` : `
    padding: 24px 22px 22px;
  `}
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: ${props => {
      switch (props.$position) {
        case 1: return 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)';
        case 2: return 'linear-gradient(90deg, #C0C0C0 0%, #A9A9A9 100%)';
        case 3: return 'linear-gradient(90deg, #CD7F32 0%, #8B4513 100%)';
        default: return 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)';
      }
    }};
    z-index: 2;
  }
  
  &:hover {
    box-shadow: 0 10px 40px rgba(0, 0, 0, ${props => props.$position === 1 ? '0.15' : '0.1'});
    transform: translateY(-3px);
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const PositionBadge = styled.div<{ $position: number }>`
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  border-radius: 8px 0 8px 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  
  background: ${props => {
    switch (props.$position) {
      case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)';
      case 3: return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default: return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    }
  }};
`;

const PrizesLimitIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6b7280;
  margin: 40px 20px 5px;
  background-color: rgba(106, 17, 203, 0.03);
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px dashed rgba(106, 17, 203, 0.1);
  
  strong {
    color: #6a11cb;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 16px 20px 5px;
  width: calc(100% - 40px);
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const EmptyStateButtons = styled(ButtonsContainer)`
  margin: 16px auto;
  max-width: 600px;
`;

const PrizesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding: 0 20px;
  max-width: 900px;
`;

const PrizeCard = styled.div`
  display: flex;
  gap: 16px;
  background: rgba(106, 17, 203, 0.02);
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  animation: fadeIn 0.3s ease-out forwards;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background: rgba(106, 17, 203, 0.03);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px;
  }
`;

const PrizeImageContainer = styled.div`
  width: 75px;
  height: 75px;
  border-radius: 8px;
  background-color: #f3f4f6;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 2rem;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 768px) {
    width: 65px;
    height: 65px;
  }
`;

const PrizeInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
`;

const PrizeName = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const PrizeValue = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 5px;
  
  svg {
    font-size: 0.9rem;
  }
`;

const PrizeActions = styled.div`
  display: flex;
  align-items: center;
  margin-top: auto;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    margin-top: 10px;
  }
`;

const RemovePrizeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(239, 68, 68, 0.15);
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 0.9rem;
  }
`;

const AddPrizeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
  color: #6a11cb;
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  height: 48px;
  
  &:hover {
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.15) 0%, rgba(37, 117, 252, 0.15) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.15);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
  }
`;

const CreatePrizeButton = styled(AddPrizeButton)`
  background: linear-gradient(135deg, rgba(22, 163, 74, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #16a34a;
  
  &:hover {
    background: linear-gradient(135deg, rgba(22, 163, 74, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%);
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.15);
  }
`;

const CompactLimitIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #6b7280;
  margin: 14px 20px 5px;
  background-color: rgba(106, 17, 203, 0.03);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px dashed rgba(106, 17, 203, 0.1);
  
  strong {
    color: #6a11cb;
  }
`;

const EmptyPrizesList = styled.div`
  background: rgba(106, 17, 203, 0.02);
  border-radius: 12px;
  padding: 28px 20px;
  margin: 20px;
  text-align: center;
  border: 1px dashed rgba(106, 17, 203, 0.15);
  
  svg {
    font-size: 2rem;
    color: rgba(106, 17, 203, 0.3);
    margin-bottom: 10px;
  }
  
  p {
    margin: 0 0 16px;
    color: #6b7280;
    font-size: 0.95rem;
  }
`;

const PrizeCountBadge = styled.div<{ $isFull?: boolean }>`
  background: ${props => props.$isFull 
    ? 'rgba(22, 163, 74, 0.1)' 
    : 'rgba(106, 17, 203, 0.1)'};
  color: ${props => props.$isFull ? '#16a34a' : '#6a11cb'};
  font-weight: 600;
  font-size: 0.85rem;
  padding: 4px 10px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
  }
`;

const MultiPrizePosition: React.FC<MultiPrizePositionProps> = ({
  position,
  prizes,
  onAddPrize,
  onRemovePrize,
  onCreatePrize,
  maxPrizes = 5
}) => {
  // Filtra apenas prêmios válidos (que têm nome)
  const validPrizes = prizes.filter(prize => prize.name);
  const isFull = validPrizes.length >= maxPrizes;
  const hasAnyPrize = validPrizes.length > 0;
  
  // Função para renderizar o conteúdo do badge de posição
  const renderPositionBadgeContent = () => {
    switch (position) {
      case 1:
        return <>🏆 Grande Prêmio</>;
      case 2:
        return <>🥈 2º Lugar</>;
      case 3:
        return <>🥉 3º Lugar</>;
      default:
        return <>🎖️ {position}º Lugar</>;
    }
  };

  return (
    <PrizePositionCard $position={position}>
      <PositionBadge $position={position}>
        {renderPositionBadgeContent()}
      </PositionBadge>
      
      {position === 1 && (
        <PrizesLimitIndicator>
          <FaInfoCircle />
          <span>Você pode adicionar até <strong>{maxPrizes} prêmios</strong> para cada posição, aumentando o valor total da premiação.</span>
        </PrizesLimitIndicator>
      )}
      
      {hasAnyPrize ? (
        <>
          <PrizesList>
            {validPrizes.map((prize, index) => (
              <PrizeCard key={`prize-${position}-${index}`}>
                <PrizeImageContainer>
                  {prize.image ? (
                    <img src={prize.image} alt={prize.name} />
                  ) : (
                    <FaGift />
                  )}
                </PrizeImageContainer>
                
                <PrizeInfo>
                  <PrizeName>{prize.name}</PrizeName>
                  <PrizeValue>
                    <FaMoneyBill /> {prize.value}
                  </PrizeValue>
                </PrizeInfo>
                
                <PrizeActions>
                  <RemovePrizeButton
                    type="button"
                    onClick={() => onRemovePrize(position, prizes.findIndex(p => p === prize))}
                  >
                    <FaTrashAlt /> Remover
                  </RemovePrizeButton>
                </PrizeActions>
              </PrizeCard>
            ))}
          </PrizesList>
          
          <ButtonsContainer>
            <AddPrizeButton
              type="button"
              onClick={() => onAddPrize(position)}
              disabled={isFull}
            >
              <FaPlusCircle /> Adicionar Prêmio Existente
            </AddPrizeButton>
            
            {onCreatePrize && (
              <CreatePrizeButton
                type="button"
                onClick={onCreatePrize}
                disabled={isFull}
              >
                <FaGift /> Criar Novo Prêmio
              </CreatePrizeButton>
            )}
          </ButtonsContainer>
          
          <CompactLimitIndicator>
            <FaInfoCircle />
            <span><strong>{validPrizes.length}</strong> de <strong>{maxPrizes}</strong> prêmios nesta posição</span>
          </CompactLimitIndicator>
        </>
      ) : (
        <>
          <EmptyPrizesList>
            <FaGift />
            <p>Nenhum prêmio configurado para esta posição.</p>
          </EmptyPrizesList>
          
          <EmptyStateButtons>
            <AddPrizeButton
              type="button"
              onClick={() => onAddPrize(position)}
            >
              <FaPlusCircle /> Adicionar Prêmio Existente
            </AddPrizeButton>
            
            {onCreatePrize && (
              <CreatePrizeButton
                type="button"
                onClick={onCreatePrize}
              >
                <FaGift /> Criar Novo Prêmio
              </CreatePrizeButton>
            )}
          </EmptyStateButtons>
        </>
      )}
    </PrizePositionCard>
  );
};

export default MultiPrizePosition; 