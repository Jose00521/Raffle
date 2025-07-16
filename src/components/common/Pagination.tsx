'use client';

import React from 'react';
import styled from 'styled-components';
import { FaAngleLeft, FaAngleRight, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';
import CustomDropdown from './CustomDropdown';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  margin-top: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PaginationInfo = styled.div`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PageButton = styled.button<{ $active?: boolean; $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1px solid ${props => props.$active ? 'transparent' : 'rgba(0, 0, 0, 0.1)'};
  background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.1)' : 'transparent'};
  color: ${props => {
    if (props.$disabled) return 'rgba(0, 0, 0, 0.3)';
    if (props.$active) return props.theme.colors?.primary || '#6a11cb';
    return props.theme.colors?.text?.primary || '#333';
  }};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.$active ? 'rgba(106, 17, 203, 0.15)' : 'rgba(0, 0, 0, 0.03)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageEllipsis = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const RowsPerPageContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const RowsPerPageLabel = styled.span`
  white-space: nowrap;
  font-weight: 500;
`;

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [5, 10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
  className
}) => {
  // Calcular os itens exibidos atualmente
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);
  
  // Converter as opções de pageSize para o formato do CustomDropdown
  const pageSizeDropdownOptions = pageSizeOptions.map(option => ({
    value: option.toString(),
    label: option.toString()
  }));
  
  const handlePageSizeChange = (value: string) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(value));
    }
  };
  
  // Renderizar os botões de paginação com lógica para mostrar elipses quando necessário
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtonsToShow = 5;
    
    // Botão para primeira página
    buttons.push(
      <PageButton 
        key="first" 
        onClick={() => onPageChange(1)}
        $disabled={currentPage === 1}
        disabled={currentPage === 1}
        title="Primeira página"
      >
        <FaAngleDoubleLeft size={14} />
      </PageButton>
    );
    
    // Botão anterior
    buttons.push(
      <PageButton 
        key="prev" 
        onClick={() => onPageChange(currentPage - 1)}
        $disabled={currentPage === 1}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        <FaAngleLeft size={14} />
      </PageButton>
    );
    
    // Determinar quais números de página mostrar
    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);
    
    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }
    
    // Mostrar elipse no início se necessário
    if (startPage > 1) {
      buttons.push(<PageEllipsis key="ellipsis-start">...</PageEllipsis>);
    }
    
    // Botões de número de página
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <PageButton 
          key={i} 
          onClick={() => onPageChange(i)}
          $active={currentPage === i}
        >
          {i}
        </PageButton>
      );
    }
    
    // Mostrar elipse no final se necessário
    if (endPage < totalPages) {
      buttons.push(<PageEllipsis key="ellipsis-end">...</PageEllipsis>);
    }
    
    // Botão próximo
    buttons.push(
      <PageButton 
        key="next" 
        onClick={() => onPageChange(currentPage + 1)}
        $disabled={currentPage === totalPages}
        disabled={currentPage === totalPages}
        title="Próxima página"
      >
        <FaAngleRight size={14} />
      </PageButton>
    );
    
    // Botão para última página
    buttons.push(
      <PageButton 
        key="last" 
        onClick={() => onPageChange(totalPages)}
        $disabled={currentPage === totalPages}
        disabled={currentPage === totalPages}
        title="Última página"
      >
        <FaAngleDoubleRight size={14} />
      </PageButton>
    );
    
    return buttons;
  };

  return (
    <PaginationContainer className={className}>
      <PaginationInfo>
        Mostrando {totalItems > 0 ? `${startItem}-${endItem} de ${totalItems}` : '0'} itens
      </PaginationInfo>
      
      <PaginationControls>
        {renderPaginationButtons()}
      </PaginationControls>
      
      {onPageSizeChange && (
        <RowsPerPageContainer>
          <RowsPerPageLabel>Itens por página:</RowsPerPageLabel>
          <CustomDropdown
            id="pagination-page-size"
            options={pageSizeDropdownOptions}
            value={pageSize.toString()}
            onChange={handlePageSizeChange}
            width="80px"
            direction="up"
          />
        </RowsPerPageContainer>
      )}
    </PaginationContainer>
  );
};

export default Pagination; 