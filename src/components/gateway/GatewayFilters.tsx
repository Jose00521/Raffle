'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck } from 'react-icons/fa';
import { mockGatewayData } from '@/mocks/gatewayMocks';
import { PaymentGatewayTemplateStatus } from '@/mocks/gatewayMocks';

interface FiltersState {
  status: PaymentGatewayTemplateStatus[];
  types: string[];
  dateRange: string;
  providers: string[];
}

const Container = styled(motion.div)`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.25rem;
  margin-bottom: 1.25rem;
`;

const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #1a202c;
`;

const FilterSection = styled.div`
  margin-bottom: 1.25rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.75rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.625rem;
`;

const DateRangeGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 0.625rem;
`;

const CheckboxItem = styled.label<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.375rem;
  background-color: ${props => props.$selected ? '#f0f9ff' : '#f9fafb'};
  border: 1px solid ${props => props.$selected ? '#7dd3fc' : '#e5e7eb'};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${props => props.$selected ? '#7dd3fc' : '#d1d5db'};
    background-color: ${props => props.$selected ? '#e0f2fe' : '#f3f4f6'};
  }
  
  input {
    display: none;
  }
`;

const DateRangeButton = styled.button<{ $selected: boolean }>`
  padding: 0.5rem 0.625rem;
  border-radius: 0.375rem;
  background-color: ${props => props.$selected ? '#f0f9ff' : '#f9fafb'};
  border: 1px solid ${props => props.$selected ? '#7dd3fc' : '#e5e7eb'};
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
  text-align: center;
  font-weight: ${props => props.$selected ? '600' : 'normal'};
  color: ${props => props.$selected ? '#0284c7' : '#4b5563'};
  
  &:hover {
    border-color: ${props => props.$selected ? '#7dd3fc' : '#d1d5db'};
    background-color: ${props => props.$selected ? '#e0f2fe' : '#f3f4f6'};
  }
`;

const CheckboxIndicator = styled.div<{ $selected: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background-color: ${props => props.$selected ? '#0284c7' : 'white'};
  border: 1px solid ${props => props.$selected ? '#0284c7' : '#d1d5db'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  transition: all 0.2s;
`;

const ActionsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1.25rem;
  gap: 0.625rem;
`;

const Button = styled(motion.button)<{ $variant?: 'primary' | 'secondary' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.375rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$variant === 'primary' ? `
    background: #0284c7;
    color: white;
    border: none;
    
    &:hover {
      background: #0369a1;
    }
  ` : `
    background: white;
    color: #4b5563;
    border: 1px solid #e5e7eb;
    
    &:hover {
      background: #f9fafb;
      border-color: #d1d5db;
    }
  `}
`;

const GatewayFilters: React.FC = () => {
  const { gatewayTypes } = mockGatewayData;
  
  const [filters, setFilters] = useState<FiltersState>({
    status: [],
    types: [],
    dateRange: '30d',
    providers: []
  });
  
  const handleStatusChange = (status: PaymentGatewayTemplateStatus) => {
    setFilters(prev => {
      if (prev.status.includes(status)) {
        return {
          ...prev,
          status: prev.status.filter(s => s !== status)
        };
      } else {
        return {
          ...prev,
          status: [...prev.status, status]
        };
      }
    });
  };
  
  const handleTypeChange = (type: string) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return {
          ...prev,
          types: prev.types.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          types: [...prev.types, type]
        };
      }
    });
  };
  
  const handleDateRangeChange = (range: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: range
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      status: [],
      types: [],
      dateRange: '30d',
      providers: []
    });
  };
  
  return (
    <Container
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Title>Filtros Avançados</Title>
      
      <FilterSection>
        <SectionTitle>Status</SectionTitle>
        <CheckboxGroup>
          <CheckboxItem $selected={filters.status.includes(PaymentGatewayTemplateStatus.ACTIVE)}>
            <input
              type="checkbox"
              checked={filters.status.includes(PaymentGatewayTemplateStatus.ACTIVE)}
              onChange={() => handleStatusChange(PaymentGatewayTemplateStatus.ACTIVE)}
            />
            <CheckboxIndicator $selected={filters.status.includes(PaymentGatewayTemplateStatus.ACTIVE)}>
              {filters.status.includes(PaymentGatewayTemplateStatus.ACTIVE) && <FaCheck />}
            </CheckboxIndicator>
            Ativos
          </CheckboxItem>
          
          <CheckboxItem $selected={filters.status.includes(PaymentGatewayTemplateStatus.INACTIVE)}>
            <input
              type="checkbox"
              checked={filters.status.includes(PaymentGatewayTemplateStatus.INACTIVE)}
              onChange={() => handleStatusChange(PaymentGatewayTemplateStatus.INACTIVE)}
            />
            <CheckboxIndicator $selected={filters.status.includes(PaymentGatewayTemplateStatus.INACTIVE)}>
              {filters.status.includes(PaymentGatewayTemplateStatus.INACTIVE) && <FaCheck />}
            </CheckboxIndicator>
            Inativos
          </CheckboxItem>
          
          <CheckboxItem $selected={filters.status.includes(PaymentGatewayTemplateStatus.PENDING)}>
            <input
              type="checkbox"
              checked={filters.status.includes(PaymentGatewayTemplateStatus.PENDING)}
              onChange={() => handleStatusChange(PaymentGatewayTemplateStatus.PENDING)}
            />
            <CheckboxIndicator $selected={filters.status.includes(PaymentGatewayTemplateStatus.PENDING)}>
              {filters.status.includes(PaymentGatewayTemplateStatus.PENDING) && <FaCheck />}
            </CheckboxIndicator>
            Pendentes
          </CheckboxItem>
          
          <CheckboxItem $selected={filters.status.includes(PaymentGatewayTemplateStatus.DRAFT)}>
            <input
              type="checkbox"
              checked={filters.status.includes(PaymentGatewayTemplateStatus.DRAFT)}
              onChange={() => handleStatusChange(PaymentGatewayTemplateStatus.DRAFT)}
            />
            <CheckboxIndicator $selected={filters.status.includes(PaymentGatewayTemplateStatus.DRAFT)}>
              {filters.status.includes(PaymentGatewayTemplateStatus.DRAFT) && <FaCheck />}
            </CheckboxIndicator>
            Rascunhos
          </CheckboxItem>
          
          <CheckboxItem $selected={filters.status.includes(PaymentGatewayTemplateStatus.DEPRECATED)}>
            <input
              type="checkbox"
              checked={filters.status.includes(PaymentGatewayTemplateStatus.DEPRECATED)}
              onChange={() => handleStatusChange(PaymentGatewayTemplateStatus.DEPRECATED)}
            />
            <CheckboxIndicator $selected={filters.status.includes(PaymentGatewayTemplateStatus.DEPRECATED)}>
              {filters.status.includes(PaymentGatewayTemplateStatus.DEPRECATED) && <FaCheck />}
            </CheckboxIndicator>
            Descontinuados
          </CheckboxItem>
        </CheckboxGroup>
      </FilterSection>
      
      <FilterSection>
        <SectionTitle>Tipo de Gateway</SectionTitle>
        <CheckboxGroup>
          {gatewayTypes.map((type) => (
            <CheckboxItem 
              key={type.id} 
              $selected={filters.types.includes(type.id)}
            >
              <input
                type="checkbox"
                checked={filters.types.includes(type.id)}
                onChange={() => handleTypeChange(type.id)}
              />
              <CheckboxIndicator $selected={filters.types.includes(type.id)}>
                {filters.types.includes(type.id) && <FaCheck />}
              </CheckboxIndicator>
              {type.name}
            </CheckboxItem>
          ))}
        </CheckboxGroup>
      </FilterSection>
      
      <FilterSection>
        <SectionTitle>Período</SectionTitle>
        <DateRangeGroup>
          <DateRangeButton
            $selected={filters.dateRange === '7d'}
            onClick={() => handleDateRangeChange('7d')}
          >
            Últimos 7 dias
          </DateRangeButton>
          
          <DateRangeButton
            $selected={filters.dateRange === '30d'}
            onClick={() => handleDateRangeChange('30d')}
          >
            Últimos 30 dias
          </DateRangeButton>
          
          <DateRangeButton
            $selected={filters.dateRange === '90d'}
            onClick={() => handleDateRangeChange('90d')}
          >
            Últimos 90 dias
          </DateRangeButton>
          
          <DateRangeButton
            $selected={filters.dateRange === 'all'}
            onClick={() => handleDateRangeChange('all')}
          >
            Todo o período
          </DateRangeButton>
        </DateRangeGroup>
      </FilterSection>
      
      <ActionsContainer>
        <Button
          $variant="secondary"
          onClick={clearFilters}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FaTimes />
          Limpar Filtros
        </Button>
        
        <Button
          $variant="primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => console.log('Aplicar filtros:', filters)}
        >
          <FaCheck />
          Aplicar Filtros
        </Button>
      </ActionsContainer>
    </Container>
  );
};

export default GatewayFilters; 