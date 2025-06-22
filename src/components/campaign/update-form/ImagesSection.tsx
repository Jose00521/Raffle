'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { FaExclamationTriangle } from 'react-icons/fa';
import styled from 'styled-components';
import RaffleImageManager from './RaffleImageManager';
import { ImagesSectionProps } from './types';

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
 * Componente para a seção de imagens do formulário
 */
const ImagesSection: React.FC<ImagesSectionProps> = ({ 
  control, 
  errors, 
  setValue, 
  isSubmitting 
}) => {
  return (
    <>
      <Controller
        name="images"
        control={control}
        render={({ field }) => (
          <RaffleImageManager
            value={Array.isArray(field.value) ? field.value : []}
            onChange={(files, coverImage) => {
              field.onChange(files);
              if (coverImage) {
                setValue('coverImage', coverImage);
              }
            }}
          />
        )}
      />
      
      {errors.coverImage && (
        <ErrorText>
          <FaExclamationTriangle /> {errors.coverImage.message}
        </ErrorText>
      )}
      
      {errors.images && (
        <ErrorText>
          <FaExclamationTriangle /> {errors.images.message}
        </ErrorText>
      )}
      <HelpText>
        Adicione até 10 imagens de alta qualidade. A primeira será a imagem principal da sua rifa.
      </HelpText>
    </>
  );
};

export default ImagesSection; 