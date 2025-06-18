import React from 'react';
import styled, { keyframes } from 'styled-components';

const progressAnimation = keyframes`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 20px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin: 0 0 32px;
  text-align: center;
`;

const ProgressBar = styled.div`
  width: 200px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: white;
  border-radius: 2px;
  animation: ${progressAnimation} 2s ease-in-out infinite;
`;

interface LoadingScreenProps {
  title?: string;
  subtitle?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  title = "Carregando campanha",
  subtitle = "Estamos carregando todos os detalhes para você"
}) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      <ProgressBar>
        <Progress />
      </ProgressBar>
    </Container>
  );
};

export default LoadingScreen; 