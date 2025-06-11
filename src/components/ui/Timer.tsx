'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface TimerProps {
  seconds: number;
  title?: string;
  onTimeUp?: () => void;
  variant?: 'default' | 'payment' | 'warning';
}

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.2); }
`;

// Styled Components
const TimerContainer = styled.div<{ $variant: 'default' | 'payment' | 'warning'; $isUrgent: boolean }>`
  background: ${({ $isUrgent }) => 
    $isUrgent 
      ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' 
      : 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)'
  };
  
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;
  box-shadow: 0 4px 15px rgba(91, 33, 182, 0.2);

  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(91, 33, 182, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 0.625rem 1rem;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.875rem;
    border-radius: 8px;
  }
`;

const TimerContent = styled.div`
  text-align: center;
`;

const TimerTitle = styled.div<{ $isUrgent: boolean }>`
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    margin-bottom: 0.625rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.7rem;
    margin-bottom: 0.5rem;
  }
`;

const TimerDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
  }
  
  @media (max-width: 480px) {
    gap: 0.625rem;
  }
`;

const TimeUnit = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
`;

const TimeCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  min-width: 50px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.4rem 0.625rem;
    min-width: 45px;
    border-radius: 6px;
  }
  
  @media (max-width: 480px) {
    padding: 0.375rem 0.5rem;
    min-width: 40px;
    border-radius: 6px;
  }
`;

const TimeValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  letter-spacing: -0.05em;
  line-height: 1;
  color: white;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const TimeLabel = styled.div`
  font-size: 0.625rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  text-transform: capitalize;
  letter-spacing: 0.025em;
  
  @media (max-width: 768px) {
    font-size: 0.575rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.55rem;
  }
`;

const Timer: React.FC<TimerProps> = ({ 
  seconds: initialSeconds, 
  title = "Tempo restante para pagamento", 
  onTimeUp,
  variant = 'default'
}) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (seconds > 0) {
      const timer = setTimeout(() => setSeconds(seconds - 1), 1000);
      return () => clearTimeout(timer);
    } else if (onTimeUp) {
      onTimeUp();
    }
  }, [seconds, onTimeUp]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return { hours, minutes, seconds: secs };
  };

  const { hours, minutes, seconds: secs } = formatTime(seconds);
  const isUrgent = seconds <= 300; // Últimos 5 minutos

  return (
    <TimerContainer $variant={variant} $isUrgent={isUrgent}>
      <TimerContent>
        <TimerTitle $isUrgent={isUrgent}>
          {title} ⏳
        </TimerTitle>
        
        <TimerDisplay>
          <TimeUnit>
            <TimeCard>
              <TimeValue>
                {minutes.toString().padStart(2, '0')}
              </TimeValue>
            </TimeCard>
            <TimeLabel>Minutes</TimeLabel>
          </TimeUnit>
          
          <TimeUnit>
            <TimeCard>
              <TimeValue>
                {secs.toString().padStart(2, '0')}
              </TimeValue>
            </TimeCard>
            <TimeLabel>Seconds</TimeLabel>
          </TimeUnit>
        </TimerDisplay>
      </TimerContent>
    </TimerContainer>
  );
};

export default Timer; 