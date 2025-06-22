'use client';

import React from 'react';
import styled from 'styled-components';
import { FaSave } from 'react-icons/fa';
import { UpdateIndicatorProps } from './types';

const IndicatorContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  
  svg {
    font-size: 1rem;
  }
`;

/**
 * Componente que mostra um indicador flutuante com o número de campos alterados
 */
const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({ changedFields }) => {
  return (
    <IndicatorContainer>
      <FaSave />
      {changedFields}
      {changedFields.length} campo{changedFields.length > 1 ? 's' : ''} alterado{changedFields.length > 1 ? 's' : ''}
    </IndicatorContainer>
  );
};

export default UpdateIndicator; 