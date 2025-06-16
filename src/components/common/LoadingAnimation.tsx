'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FaGift, FaTicketAlt, FaTrophy } from 'react-icons/fa';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
  theme?: 'campaign' | 'payment' | 'general';
}

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: scale(2.4);
    opacity: 0;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const dotAnimation = keyframes`
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1.2);
    opacity: 1;
  }
`;

// Container principal
const LoadingContainer = styled.div<{ $overlay?: boolean; $theme: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: ${({ $overlay }) => ($overlay ? '100vh' : 'auto')};
  min-height: ${({ $overlay }) => ($overlay ? '100vh' : '400px')};
  padding: ${({ $overlay }) => ($overlay ? '0' : '2rem')};
  position: ${({ $overlay }) => ($overlay ? 'fixed' : 'relative')};
  top: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  left: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  right: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  bottom: ${({ $overlay }) => ($overlay ? '0' : 'auto')};
  z-index: ${({ $overlay }) => ($overlay ? 9999 : 1)};
  
  background: ${({ $theme, $overlay }) => {
    if (!$overlay) return 'transparent';
    
    switch ($theme) {
      case 'campaign':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'payment':
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      default:
        return 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    }
  }};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ $theme }) => {
      switch ($theme) {
        case 'campaign':
          return `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `;
        case 'payment':
          return `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)
          `;
        default:
          return 'none';
      }
    }};
    pointer-events: none;
  }
`;

// Container da animação principal
const AnimationContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeIn} 0.8s ease-out;
`;

// Círculo principal com ícone
const IconContainer = styled.div<{ $size: string; $theme: string }>`
  position: relative;
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '80px';
      case 'large': return '140px';
      default: return '110px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '80px';
      case 'large': return '140px';
      default: return '110px';
    }
  }};
  margin-bottom: 2rem;
  
  background: ${({ $theme }) => {
    switch ($theme) {
      case 'campaign':
        return 'linear-gradient(135deg, #667eea, #764ba2)';
      case 'payment':
        return 'linear-gradient(135deg, #3b82f6, #8b5cf6)';
      default:
        return 'linear-gradient(135deg, #6366f1, #8b5cf6)';
    }
  }};
  
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
  box-shadow: 
    0 20px 40px rgba(99, 102, 241, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    inset: -4px;
    border-radius: 50%;
    background: inherit;
    opacity: 0.3;
    animation: ${ripple} 2s ease-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -8px;
    border-radius: 50%;
    background: inherit;
    opacity: 0.2;
    animation: ${ripple} 2s ease-out 1s infinite;
  }
  
  svg {
    font-size: ${({ $size }) => {
      switch ($size) {
        case 'small': return '2rem';
        case 'large': return '3.5rem';
        default: return '2.8rem';
      }
    }};
    color: white;
    z-index: 1;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

// Indicador de progresso com pontos
const ProgressIndicator = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const ProgressDot = styled.div<{ $delay: number }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.6);
  animation: ${dotAnimation} 1.4s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
`;

// Texto de carregamento
const LoadingContent = styled.div`
  text-align: center;
  color: white;
`;

const LoadingTitle = styled.h2<{ $overlay?: boolean }>`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: ${({ $overlay }) => $overlay ? 'white' : '#1f2937'};
  opacity: 0;
  animation: ${fadeInUp} 0.6s ease-out 0.3s forwards;
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const LoadingSubtitle = styled.p<{ $overlay?: boolean }>`
  font-size: 1rem;
  margin: 0;
  color: ${({ $overlay }) => $overlay ? 'rgba(255, 255, 255, 0.9)' : '#6b7280'};
  opacity: 0;
  animation: ${fadeInUp} 0.6s ease-out 0.5s forwards;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

// Barra de progresso shimmer
const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  margin-top: 1.5rem;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    background-size: 200% 100%;
    animation: ${shimmer} 2s ease-in-out infinite;
  }
`;

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  size = 'medium', 
  text = 'Carregando campanha...', 
  overlay = false,
  theme = 'campaign'
}) => {
  const getIcon = () => {
    switch (theme) {
      case 'campaign':
        return <FaGift />;
      case 'payment':
        return <FaTicketAlt />;
      default:
        return <FaTrophy />;
    }
  };

  const getTitle = () => {
    if (text === 'Carregando campanha...') {
      return 'Preparando sua experiência';
    }
    return text?.split('...')[0] || 'Carregando';
  };

  const getSubtitle = () => {
    switch (theme) {
      case 'campaign':
        return 'Estamos carregando todos os detalhes da campanha para você';
      case 'payment':
        return 'Processando sua solicitação com segurança';
      default:
        return 'Aguarde um momento, por favor';
    }
  };

  return (
    <LoadingContainer $overlay={overlay} $theme={theme}>
      <AnimationContainer>
        <IconContainer $size={size} $theme={theme}>
          {getIcon()}
        </IconContainer>
        
        <ProgressIndicator>
          <ProgressDot $delay={0} />
          <ProgressDot $delay={0.2} />
          <ProgressDot $delay={0.4} />
        </ProgressIndicator>
        
        <LoadingContent>
          <LoadingTitle $overlay={overlay}>{getTitle()}</LoadingTitle>
          <LoadingSubtitle $overlay={overlay}>{getSubtitle()}</LoadingSubtitle>
          {overlay && <ProgressBar />}
        </LoadingContent>
      </AnimationContainer>
    </LoadingContainer>
  );
};

export default LoadingAnimation; 