'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';

interface LoadingDotsProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

const pulse = keyframes`
  0% {
    transform: scale(0.8);
    background-color: #b3d4fc;
    box-shadow: 0 0 0 0 rgba(178, 212, 252, 0.7);
  }

  50% {
    transform: scale(1.2);
    background-color: #6793fb;
    box-shadow: 0 0 0 10px rgba(178, 212, 252, 0);
  }

  100% {
    transform: scale(0.8);
    background-color: #b3d4fc;
    box-shadow: 0 0 0 0 rgba(178, 212, 252, 0.7);
  }
`;

const DotsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const Dot = styled.div<{ $size: string; $customColor?: string }>`
  height: ${(props) => props.$size};
  width: ${(props) => props.$size};
  margin-right: 8px;
  border-radius: 50%;
  background-color: ${(props) => props.$customColor || '#b3d4fc'};
  animation: ${pulse} 1.5s infinite ease-in-out;

  &:last-child {
    margin-right: 0;
  }

  &:nth-child(1) {
    animation-delay: -0.3s;
  }

  &:nth-child(2) {
    animation-delay: -0.1s;
  }

  &:nth-child(3) {
    animation-delay: 0.1s;
  }
`;

/**
 * Componente de animação de carregamento que exibe três pontos pulsantes.
 * 
 * @example
 * // Uso básico
 * <LoadingDots />
 * 
 * @example
 * // Uso em um botão quando está carregando
 * <Button disabled={isLoading}>
 *   {isLoading ? <LoadingDots size="small" color="white" /> : "Entrar"}
 * </Button>
 * 
 * @example
 * // Personalização de tamanho e cor
 * <LoadingDots size="large" color="#FF5733" />
 */
const LoadingDots: React.FC<LoadingDotsProps> = ({ 
  size = 'medium', 
  color,
  className 
}) => {
  // Determinar o tamanho real dos pontos baseado na prop size
  const getDotSize = () => {
    switch (size) {
      case 'small':
        return '8px';
      case 'large':
        return '16px';
      case 'medium':
      default:
        return '12px';
    }
  };

  const dotSize = getDotSize();

  return (
    <DotsContainer className={className}>
      <Dot $size={dotSize} $customColor={color} />
      <Dot $size={dotSize} $customColor={color} />
      <Dot $size={dotSize} $customColor={color} />
    </DotsContainer>
  );
};

export default LoadingDots; 