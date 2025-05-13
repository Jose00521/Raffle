'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Lottie from 'lottie-react';
import transitionAnimation from './animations/transition-animation.json';

interface PageTransitionProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

const TransitionContainer = styled.div`
  position: relative;
  width: 100%;
  min-height: 100%;
`;

const ContentContainer = styled.div<{ $isVisible: boolean }>`
  width: 100%;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transition: opacity 0.3s ease-in-out;
`;

const TransitionAnimationContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease-in-out;
`;

const AnimationWrapper = styled.div`
  width: 200px;
  height: 200px;
`;

const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  isLoading = false
}) => {
  const [showTransition, setShowTransition] = useState(false);
  const [showContent, setShowContent] = useState(!isLoading);

  useEffect(() => {
    if (isLoading) {
      // When loading starts, show transition and hide content
      setShowTransition(true);
      setShowContent(false);
    } else {
      // When loading ends, keep transition visible briefly for smooth animation
      setTimeout(() => {
        setShowTransition(false);
        setShowContent(true);
      }, 300);
    }
  }, [isLoading]);

  return (
    <TransitionContainer>
      <ContentContainer $isVisible={showContent}>
        {children}
      </ContentContainer>
      <TransitionAnimationContainer $isVisible={showTransition}>
        <AnimationWrapper>
          <Lottie 
            animationData={transitionAnimation} 
            loop={true} 
          />
        </AnimationWrapper>
      </TransitionAnimationContainer>
    </TransitionContainer>
  );
};

export default PageTransition; 