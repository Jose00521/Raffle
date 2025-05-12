'use client';

import React, { useState } from 'react';
import styled from 'styled-components';

interface Premio {
  number: string;
  value: number;
  winner: string | null;
}

interface PremiosListProps {
  premios: Premio[];
}

const PremiosContainer = styled.div`
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-top: 2rem;
`;

const PremiosHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PremiosTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const PremiosCounter = styled.span`
  background-color: #FF416C;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
`;

const PremiosGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }
`;

const PremioCard = styled.div`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const PremioNumero = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 0.5rem;
`;

const PremioValor = styled.div`
  font-size: 0.9rem;
  color: #4CAF50;
  font-weight: 600;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 2rem;
`;

const PaginationButton = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.$active ? '#FF416C' : '#f1f1f1'};
  color: ${props => props.$active ? '#fff' : '#666'};
  margin: 0 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.$active ? '#FF416C' : '#e0e0e0'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PremiosList: React.FC<PremiosListProps> = ({ premios }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  
  // Calcula o total de páginas
  const totalPages = Math.ceil(premios.length / itemsPerPage);
  
  // Pega os prêmios da página atual
  const currentPremios = premios.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Controles de paginação
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  // Gera os botões de paginação
  const generatePaginationButtons = () => {
    const buttons = [];
    
    // Adiciona botão "Anterior"
    buttons.push(
      <PaginationButton 
        key="prev" 
        onClick={goToPreviousPage} 
        disabled={currentPage === 1}
      >
        &lt;
      </PaginationButton>
    );
    
    // Estratégia de mostrar páginas:
    // 1. Sempre mostrar primeira e última página
    // 2. Mostrar algumas páginas ao redor da página atual
    // 3. Usar "..." para páginas omitidas
    
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PaginationButton 
          key={i} 
          $active={i === currentPage}
          onClick={() => goToPage(i)}
        >
          {i}
        </PaginationButton>
      );
    }
    
    // Adiciona botão "Próximo"
    buttons.push(
      <PaginationButton 
        key="next" 
        onClick={goToNextPage} 
        disabled={currentPage === totalPages}
      >
        &gt;
      </PaginationButton>
    );
    
    return buttons;
  };
  
  return (
    <PremiosContainer>
      <PremiosHeader>
        <PremiosTitle>Prêmios Instantâneos</PremiosTitle>
        <PremiosCounter>{premios.length} Prêmios</PremiosCounter>
      </PremiosHeader>
      
      <PremiosGrid>
        {currentPremios.map((premio, index) => (
          <PremioCard key={index}>
            <PremioNumero>{premio.number}</PremioNumero>
            <PremioValor>R$ {premio.value}</PremioValor>
          </PremioCard>
        ))}
      </PremiosGrid>
      
      <PaginationContainer>
        {generatePaginationButtons()}
      </PaginationContainer>
    </PremiosContainer>
  );
};

export default PremiosList; 