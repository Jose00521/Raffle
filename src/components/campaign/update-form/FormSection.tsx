'use client';

import React from 'react';
import styled from 'styled-components';
import { 
  FaInfo, 
  FaCloudUploadAlt, 
  FaListOl, 
  FaCalendarAlt,
  FaGift,
  FaTag
} from 'react-icons/fa';
import { FormSectionProps } from './types';

// Styled components
const SectionContainer = styled.section<{ className?: string }>`
  background-color: white;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors?.gradients?.purple || 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)'};
    opacity: 0.8;
  }
  
  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
  }
  
  &.agendamento {
    overflow: visible !important;

    &:before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: transparent;
      opacity: 0.8;
    }
  }
  
  @media (max-width: 768px) {
    padding: 28px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 32px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 18px;
  position: relative;
  
  svg {
    color: ${props => props.theme.colors?.primary || '#6a11cb'};
    font-size: 1.4rem;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 26px;
    padding-bottom: 16px;
    
    svg {
      font-size: 1.3rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 22px;
    padding-bottom: 14px;
    
    svg {
      font-size: 1.2rem;
    }
  }
`;

const ChangeIndicator = styled.div<{ $hasChanges: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $hasChanges }) => $hasChanges ? '#22c55e' : 'transparent'};
  opacity: ${({ $hasChanges }) => $hasChanges ? '1' : '0'};
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: white;
  }
`;

/**
 * Componente que encapsula uma seção do formulário
 */
const FormSection: React.FC<FormSectionProps> = ({ 
  title, 
  icon, 
  hasChanges = false, 
  children, 
  className 
}) => {
  // Função para renderizar o ícone correto
  const renderIcon = () => {
    switch (icon) {
      case 'info':
        return <FaInfo />;
      case 'upload':
        return <FaCloudUploadAlt />;
      case 'regulation':
        return <FaListOl />;
      case 'calendar':
        return <FaCalendarAlt />;
      case 'gift':
        return <FaGift />;
      case 'tag':
        return <FaTag />;
      default:
        return <FaInfo />;
    }
  };

  return (
    <SectionContainer className={className} style={{ position: 'relative' }}>
      <ChangeIndicator $hasChanges={hasChanges} />
      
      <SectionTitle>
        {renderIcon()} {title}
      </SectionTitle>
      
      {children}
    </SectionContainer>
  );
};

export default FormSection; 