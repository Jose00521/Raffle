'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import styled from 'styled-components';
import PrizeConfigForm from '@/components/raffle/PrizeConfigForm';
import PrizeIntelligentSummaryComponent from '@/components/campaign/PrizeIntelligentSummary';
import { InstantPrizesSectionProps } from './types';

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
    
    ul {
      margin: 8px 0 0 0;
      padding-left: 16px;
      
      li {
        font-size: 0.85rem;
        color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
`;

const DisabledSection = styled.div<{ $disabled: boolean }>`
  position: relative;
  pointer-events: ${({ $disabled }) => $disabled ? 'none' : 'auto'};
  opacity: ${({ $disabled }) => $disabled ? '0.9' : '1'};
  filter: ${({ $disabled }) => $disabled ? 'grayscale(0.3)' : 'none'};
  transition: all 0.3s ease;
  
  ${({ $disabled }) => $disabled && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      z-index: 5;
      border-radius: 16px;
    }
  `}
`;

const UnlockMessage = styled.div`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #22c55e;
    font-size: 1.2rem;
  }
  
  div {
    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #22c55e;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.85rem;
      color: #666;
      margin: 0;
    }
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.85rem;
  margin: 6px 0 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

/**
 * Componente para a seção de prêmios instantâneos do formulário
 */
const InstantPrizesSection: React.FC<InstantPrizesSectionProps> = ({ 
  instantPrizesInitialData,
  control, 
  setValue, 
  watch, 
  totalNumbers, 
  hasBasicRequirements, 
  basicRequirementsMessage, 
  isSubmitting,
  errors,
  disabled
}) => {
  const instantPrizes = watch('instantPrizes') || [];
  const prizeCategories = watch('prizeCategories');
  const price = watch('individualNumberPrice');

  return (
    <>
      <DisabledSection $disabled={!hasBasicRequirements}>
        {!hasBasicRequirements ? (
          <RequirementAlert $type="error">
            <FaExclamationTriangle />
            <div>
              <h5>Prêmios Instantâneos Bloqueados</h5>
              <p>{basicRequirementsMessage}</p>
            </div>
          </RequirementAlert>
        ) : (
          <UnlockMessage>
            <FaInfoCircle />
            <div>
              <h5>Prêmios Instantâneos Liberados!</h5>
              <p>Configure prêmios para distribuir durante a venda dos números.</p>
            </div>
          </UnlockMessage>
        )}
      
        <Controller
          name="prizeCategories"
          control={control}
          render={({ field }) => (
            <PrizeConfigForm
              instantPrizesInitialData={instantPrizesInitialData}
              totalNumbers={totalNumbers}
              onPrizeConfigChange={config => {
                field.onChange(config);
              }}
              onPrizesGenerated={prizes => {
                setValue('instantPrizes', prizes);
              }}
              disabled={isSubmitting || disabled}
            />
          )}
        />
      </DisabledSection>
      
      {/* Seção de Resumo Inteligente dos Prêmios */}
      {instantPrizes.length > 0 && (
        <PrizeIntelligentSummaryComponent 
          instantPrizes={instantPrizes}
          totalNumbers={totalNumbers}
          prizeCategories={prizeCategories}
          individualNumberPrice={price}
        />
      )}
      
      {errors.prizeCategories && (
        <ErrorText>
          <FaExclamationTriangle /> {errors.prizeCategories.message}
        </ErrorText>
      )}
    </>
  );
};

export default InstantPrizesSection; 