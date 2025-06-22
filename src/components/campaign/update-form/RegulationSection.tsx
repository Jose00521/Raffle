'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { FaListOl } from 'react-icons/fa';
import styled from 'styled-components';
import WysiwygEditor from '@/components/common/WysiwygEditor';
import { RegulationSectionProps } from './types';

const HelpText = styled.p`
  margin: 10px 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-style: italic;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

/**
 * Componente para a seção de regulamento do formulário
 */
const RegulationSection: React.FC<RegulationSectionProps> = ({ 
  control, 
  isSubmitting 
}) => {
  return (
    <>
      <Controller
        name="regulation"
        control={control}
        render={({ field }) => (
          <WysiwygEditor
            id="regulation"
            label="Regulamento da Rifa"
            icon={<FaListOl />}
            placeholder="Descreva as regras e condições da sua rifa..."
            value={field.value}
            onChange={value => field.onChange(value)}
            disabled={isSubmitting}
            fullWidth
            minHeight="250px"
          />
        )}
      />
      <HelpText>
        Descreva as regras de forma clara e detalhada para evitar mal-entendidos com os participantes.
        Você pode usar as opções de formatação para destacar pontos importantes.
      </HelpText>
    </>
  );
};

export default RegulationSection; 