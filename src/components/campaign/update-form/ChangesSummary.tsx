'use client';

import React from 'react';
import styled from 'styled-components';
import { FaEdit } from 'react-icons/fa';
import { ChangesSummaryProps } from './types';

const SummaryContainer = styled.div`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #3b82f6;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

const ChangesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChangeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

const FieldName = styled.span`
  font-weight: 600;
  color: #1f2937;
  min-width: 120px;
  
  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const ChangeValues = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 4px;
  }
`;

const OldValue = styled.span`
  color: #ef4444;
  text-decoration: line-through;
`;

const Arrow = styled.span`
  color: #6b7280;
`;

const NewValue = styled.span`
  color: #22c55e;
  font-weight: 600;
`;

/**
 * Componente que mostra um resumo das alterações feitas no formulário
 */
const ChangesSummary: React.FC<ChangesSummaryProps> = ({ fieldChanges }) => {
  // Função para formatar o valor para exibição
  const formatValue = (value: any): string => {
    if (value === undefined || value === null) {
      return 'não definido';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
    }
    
    return String(value).substring(0, 50) + (String(value).length > 50 ? '...' : '');
  };
  
  // Contar quantos campos foram alterados
  const changedFieldsCount = Object.keys(fieldChanges).filter(key => fieldChanges[key].hasChanged).length;

  return (
    <SummaryContainer>
      <h4>
        <FaEdit /> Mudanças Detectadas ({changedFieldsCount})
      </h4>
      
      <ChangesList>
        {Object.keys(fieldChanges).map(fieldPath => {
          if (!fieldChanges[fieldPath].hasChanged) return null;
          
          const change = fieldChanges[fieldPath];
          const fieldName = fieldPath.split('.').pop() || fieldPath;
          
          return (
            <ChangeItem key={fieldPath}>
              <FieldName>{fieldName}</FieldName>
              <ChangeValues>
                <OldValue>{formatValue(change.original)}</OldValue>
                <Arrow>→</Arrow>
                <NewValue>{formatValue(change.current)}</NewValue>
              </ChangeValues>
            </ChangeItem>
          );
        })}
      </ChangesList>
    </SummaryContainer>
  );
};

export default ChangesSummary; 