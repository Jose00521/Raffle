'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

interface FlashOfferTimerProps {
  initialMinutes: number;
  onExpire: () => void;
}

const FlashOfferTimer: React.FC<FlashOfferTimerProps> = ({ 
  initialMinutes, 
  onExpire 
}) => {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    // Reinicia o timer quando initialMinutes muda
    setSeconds(initialMinutes * 60);
    setExpired(false);
  }, [initialMinutes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prevSeconds => {
        if (prevSeconds <= 1) {
          clearInterval(timer);
          setExpired(true);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  // Efeito separado para lidar com a expiração
  useEffect(() => {
    if (expired) {
      // Chamar onExpire em um useEffect separado para evitar atualização durante renderização
      onExpire();
    }
  }, [expired, onExpire]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <TimerContainer>
      {!expired ? (
        <ActiveTimerContent>
          <FlashOfferLabel>
            <FlashIcon className="fas fa-bolt" />
            Oferta relâmpago
          </FlashOfferLabel>
          
          <TimerDigits>
            {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
          </TimerDigits>
          
          <TimerText>restantes</TimerText>
        </ActiveTimerContent>
      ) : (
        <ExpiredMessage>
          <WarningIcon className="fas fa-exclamation-triangle" />
          Não saia desta página para não perder a promoção
        </ExpiredMessage>
      )}
    </TimerContainer>
  );
};

// Estilos
const TimerContainer = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 0.4rem;
  min-height: 40px;
`;

const ActiveTimerContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(90deg, #FFF5F5 0%, #FFEBEB 100%);
  border: 1px solid rgba(255, 59, 48, 0.15);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.1);
  width: 100%;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0% {
      box-shadow: 0 2px 8px rgba(255, 59, 48, 0.1);
    }
    50% {
      box-shadow: 0 2px 12px rgba(255, 59, 48, 0.2);
    }
    100% {
      box-shadow: 0 2px 8px rgba(255, 59, 48, 0.1);
    }
  }
  
  @media (max-width: 576px) {
    padding: 0.4rem 0.6rem;
  }
`;

const FlashOfferLabel = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.error || '#FF3B30'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    gap: 0.3rem;
  }
`;

const FlashIcon = styled.i`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.error || '#FF3B30'};
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

const TimerDigits = styled.div`
  font-size: 1.3rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.error || '#FF3B30'};
  background-color: white;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(255, 59, 48, 0.2);
  box-shadow: 0 1px 4px rgba(255, 59, 48, 0.15);
  letter-spacing: 1px;
  margin: 0 0.5rem;
  width: 90px;
  text-align: left;
  
  @media (max-width: 576px) {
    font-size: 1.1rem;
    padding: 0.2rem 0.4rem;
    text-align: left;
    margin: 0 0.3rem;
    width: 65px;
  }
`;

const TimerText = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.primary || '#333'};
  font-weight: 500;
  
  @media (max-width: 576px) {
    font-size: 0.7rem;
  }
`;

const ExpiredMessage = styled.div`
  font-weight: 700;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.error || '#FF3B30'};
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(90deg, #FFF5F5 0%, #FFEBEB 100%);
  border: 1px solid rgba(255, 59, 48, 0.15);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(255, 59, 48, 0.1);
  animation: fadeIn 0.5s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @media (max-width: 576px) {
    font-size: 0.75rem;
    gap: 0.3rem;
    padding: 0.4rem 0.6rem;
  }
`;

const WarningIcon = styled.i`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.error || '#FF3B30'};
  
  @media (max-width: 576px) {
    font-size: 0.8rem;
  }
`;

export default FlashOfferTimer; 