'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FaSearch, 
  FaTrophy, 
  FaMoneyBillWave 
} from 'react-icons/fa';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';

// Tipos
interface PrizeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrize: (prize: IPrize) => void;
  availablePrizes: IPrize[];
}

// Componentes estilizados
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
  max-width: 800px;
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

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f9fafb;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 0 16px;
  margin-bottom: 24px;
  
  svg {
    color: #6b7280;
  }
  
  input {
    flex: 1;
    padding: 14px 0;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    outline: none;
    color: #111827;
    
    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const PrizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PrizeCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(106, 17, 203, 0.15);
    border-color: rgba(106, 17, 203, 0.3);
  }
`;

const PrizeImage = styled.div`
  height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
  }
`;

const PrizeDetails = styled.div`
  padding: 15px;
`;

const PrizeName = styled.h4`
  margin: 0 0 5px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
`;

const PrizeValue = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  
  svg {
    font-size: 0.85rem;
  }
`;

// Componente principal
const PrizeSelectorModal: React.FC<PrizeSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectPrize,
  availablePrizes
}) => {
  console.log('PrizeSelectorModal - availablePrizes:', availablePrizes);
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Filtrar prêmios com base na busca
  const filteredPrizes = searchTerm 
    ? availablePrizes.filter(prize => 
        prize.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prize.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availablePrizes;
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaTrophy /> Selecione um Prêmio Existente
          </ModalTitle>
          <CloseButton onClick={onClose} title="Fechar">
            &times;
          </CloseButton>
        </ModalHeader>
        
        <SearchBox>
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar prêmios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </SearchBox>
        
        {filteredPrizes.length > 0 ? (
          <PrizeGrid>
            {filteredPrizes.map((prize) => (
              <PrizeCard 
                key={prize._id} 
                onClick={() => onSelectPrize(prize)}
              >
                <PrizeImage 
                  style={{ backgroundImage: `url(${prize.image})` }} 
                />
                <PrizeDetails>
                  <PrizeName>{prize.name}</PrizeName>
                  <PrizeValue>
                    <FaMoneyBillWave /> {prize.value}
                  </PrizeValue>
                </PrizeDetails>
              </PrizeCard>
            ))}
          </PrizeGrid>
        ) : (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <p style={{ color: '#6b7280', fontSize: '1rem' }}>
              Nenhum prêmio encontrado com o termo "{searchTerm}".
            </p>
          </div>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default PrizeSelectorModal; 