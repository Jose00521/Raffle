'use client';

import React from 'react';
import Lottie from 'lottie-react';
import styled from 'styled-components';

// Import prebuilt animations
import loadingAnimation from './animations/loading-animation.json';

interface LoadingAnimationProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
}

const LoadingContainer = styled.div<{ $overlay?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: ${({ $overlay }) => ($overlay ? '0' : '20px')};
  position: ${({ $overlay }) => ($overlay ? 'absolute' : 'relative')};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: ${({ $overlay }) => ($overlay ? '100%' : 'auto')};
  min-height: ${({ $overlay }) => ($overlay ? 'inherit' : '200px')};
  background-color: ${({ $overlay }) => ($overlay ? 'rgba(255, 255, 255, 0.8)' : 'transparent')};
  z-index: ${({ $overlay }) => ($overlay ? 10 : 1)};
  backdrop-filter: ${({ $overlay }) => ($overlay ? 'blur(2px)' : 'none')};
`;

const AnimationWrapper = styled.div<{ $size: string }>`
  width: ${({ $size }) => {
    switch ($size) {
      case 'small': return '80px';
      case 'large': return '160px';
      default: return '120px';
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case 'small': return '80px';
      case 'large': return '160px';
      default: return '120px';
    }
  }};
`;

const LoadingText = styled.p`
  margin-top: 12px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-weight: 500;
`;

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ 
  size = 'medium', 
  text = 'Carregando...', 
  overlay = false 
}) => {
  return (
    <LoadingContainer $overlay={overlay}>
      <AnimationWrapper $size={size}>
        <Lottie 
          animationData={loadingAnimation} 
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </AnimationWrapper>
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

export default LoadingAnimation; 