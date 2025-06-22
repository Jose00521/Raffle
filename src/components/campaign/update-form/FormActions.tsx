'use client';

import React from 'react';
import styled from 'styled-components';
import { FaTimes, FaTrashAlt, FaSave } from 'react-icons/fa';
import { FormActionsProps } from './types';

const ActionsContainer = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  min-width: 120px;
  
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
      case 'danger': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return '#f3f4f6';
    }
  }};
  
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': 
      case 'danger': return 'white';
      default: return '#374151';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $variant }) => {
      switch ($variant) {
        case 'primary': return 'rgba(106, 17, 203, 0.2)';
        case 'danger': return 'rgba(239, 68, 68, 0.2)';
        default: return 'rgba(0, 0, 0, 0.1)';
      }
    }};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

/**
 * Componente que renderiza os botões de ação do formulário
 */
const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  onReset, 
  hasChanges, 
  isSubmitting 
}) => {
  return (
    <ActionsContainer>
      <ActionButton
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        <FaTimes />
        Cancelar
      </ActionButton>
      
      <ActionButton
        type="button"
        onClick={onReset}
        disabled={isSubmitting || !hasChanges}
      >
        <FaTrashAlt />
        Resetar
      </ActionButton>
      
      <ActionButton
        type="submit"
        $variant="primary"
        disabled={isSubmitting || !hasChanges}
      >
        <FaSave />
        {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
      </ActionButton>
    </ActionsContainer>
  );
};

export default FormActions; 