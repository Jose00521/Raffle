'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styled, { keyframes, css } from 'styled-components';

// Interfaces
interface SuccessData {
  campaignTitle: string;
  quantity: number;
  totalPrice: number;
  isCombo: boolean;
  comboName?: string;
  userName: string;
}

// Animações Ultra Premium
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleInBounce = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

const checkmarkDraw = keyframes`
  0% {
    stroke-dashoffset: 100;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 
      0 0 30px rgba(34, 197, 94, 0.4),
      0 0 60px rgba(34, 197, 94, 0.2),
      0 0 100px rgba(34, 197, 94, 0.1);
  }
  50% {
    box-shadow: 
      0 0 40px rgba(34, 197, 94, 0.6),
      0 0 80px rgba(34, 197, 94, 0.3),
      0 0 120px rgba(34, 197, 94, 0.15);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-8px) rotate(1deg);
  }
  66% {
    transform: translateY(4px) rotate(-1deg);
  }
`;

const shimmerText = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const sparkleRotate = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
`;

const confettiFall = keyframes`
  0% {
    transform: translateY(-100vh) rotateZ(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotateZ(720deg);
    opacity: 0;
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(60px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

// Styled Components Ultra Premium
const SuccessContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #f0fdf4 0%, 
    #dcfce7 15%, 
    #bbf7d0 30%, 
    #a7f3d0 45%, 
    #6ee7b7 60%,
    #34d399 75%,
    #10b981 90%,
    #059669 100%
  );
  position: relative;
  overflow: hidden;
  padding: 2rem 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 15% 15%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(5, 150, 105, 0.08) 0%, transparent 60%),
      linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.03) 50%, transparent 52%);
    pointer-events: none;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 2px 2px, rgba(34, 197, 94, 0.15) 1px, transparent 0);
    background-size: 40px 40px;
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 1;
    opacity: 0.3;
  }
`;

const CursorGlow = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: ${({ $y }) => $y - 10}px;
  left: ${({ $x }) => $x - 10}px;
  width: 20px;
  height: 20px;
  background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.1s ease;
  mix-blend-mode: multiply;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
`;

const ConfettiPiece = styled.div<{ 
  $delay: number; 
  $color: string; 
  $left: number; 
  $size: number;
  $duration: number;
}>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color }) => $color};
  top: -20px;
  left: ${({ $left }) => $left}%;
  animation: ${confettiFall} ${({ $duration }) => $duration}s linear infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  border-radius: ${({ $size }) => $size > 6 ? '2px' : '50%'};
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeInUp} 1s ease-out;
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const IconContainer = styled.div`
  width: 160px;
  height: 160px;
  margin: 0 auto 3rem;
  position: relative;
  animation: ${scaleInBounce} 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  @media (max-width: 768px) {
    width: 140px;
    height: 140px;
    margin-bottom: 2.5rem;
  }
`;

const SuccessIcon = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 30px 60px rgba(34, 197, 94, 0.3),
    0 15px 30px rgba(0, 0, 0, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.4),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1);
  animation: ${pulseGlow} 3s ease-in-out infinite;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    padding: 6px;
    background: linear-gradient(135deg, 
      #22c55e 0%, 
      #16a34a 25%, 
      #059669 50%, 
      #047857 75%, 
      #065f46 100%
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    opacity: 0.6;
    animation: ${shimmerText} 3s ease-in-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    border: 3px solid rgba(34, 197, 94, 0.1);
    animation: ${ripple} 2s ease-out infinite;
  }
  
  svg {
    width: 70px;
    height: 70px;
    stroke: white;
    stroke-width: 4;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ${checkmarkDraw} 1.5s ease-out 0.8s forwards;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }
`;

const SparkleEffect = styled.div<{ 
  $delay: number; 
  $size: number; 
  $top: string; 
  $left: string; 
  $color: string;
}>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: ${({ $color }) => $color};
  border-radius: 2px;
  animation: ${sparkleRotate} 2.5s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  transform-origin: center;
  box-shadow: 0 0 ${({ $size }) => $size * 2}px ${({ $color }) => $color}40;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    background: ${({ $color }) => $color};
    border-radius: 50%;
    opacity: 0.2;
    filter: blur(6px);
    z-index: -1;
  }
`;

const SuccessTitle = styled.h1`
  font-size: 4rem;
  font-weight: 900;
  color: #166534;
  margin-bottom: 1.5rem;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, 
    #166534 0%, 
    #15803d 25%, 
    #16a34a 50%, 
    #22c55e 75%, 
    #34d399 100%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  background-size: 400% 100%;
  animation: ${shimmerText} 4s ease-in-out infinite;
  position: relative;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 5px;
    background: linear-gradient(90deg, 
      #22c55e 0%, 
      #16a34a 25%, 
      #059669 50%, 
      #16a34a 75%, 
      #22c55e 100%
    );
    border-radius: 3px;
    animation: ${shimmerText} 3s ease-in-out infinite;
    background-size: 200% 100%;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }
  
  @media (max-width: 768px) {
    font-size: 3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const SuccessSubtitle = styled.p`
  font-size: 1.5rem;
  color: #166534;
  font-weight: 600;
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.95;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
  
  @media (max-width: 768px) {
    font-size: 1.375rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2.2fr 1fr;
  gap: 4rem;
  animation: ${fadeInUp} 1s ease-out 0.4s both;
  
  @media (max-width: 1200px) {
    gap: 3rem;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
`;

const PurchaseDetails = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(40px) saturate(200%);
  border-radius: 32px;
  padding: 3.5rem;
  box-shadow: 
    0 50px 100px rgba(0, 0, 0, 0.08),
    0 25px 50px rgba(0, 0, 0, 0.05),
    0 12px 24px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.9);
  position: relative;
  overflow: hidden;
  animation: ${slideInLeft} 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 60px 120px rgba(0, 0, 0, 0.12),
      0 30px 60px rgba(0, 0, 0, 0.08),
      0 15px 30px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(90deg, 
      #22c55e 0%, 
      #16a34a 25%, 
      #059669 50%, 
      #047857 75%, 
      #065f46 100%
    );
    border-radius: 32px 32px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -100%;
    left: -100%;
    width: 300%;
    height: 300%;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.03) 0%, transparent 70%);
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
  }
  
  @media (max-width: 768px) {
    padding: 3rem;
    border-radius: 28px;
    
    &::before {
      border-radius: 28px 28px 0 0;
    }
  }
`;

const QuickActions = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(40px) saturate(200%);
  border-radius: 32px;
  padding: 3rem;
  box-shadow: 
    0 50px 100px rgba(0, 0, 0, 0.08),
    0 25px 50px rgba(0, 0, 0, 0.05),
    0 12px 24px rgba(0, 0, 0, 0.03),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.9);
  height: fit-content;
  position: sticky;
  top: 3rem;
  animation: ${slideInRight} 1s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 
      0 60px 120px rgba(0, 0, 0, 0.12),
      0 30px 60px rgba(0, 0, 0, 0.08),
      0 15px 30px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.95);
  }
  
  @media (max-width: 1024px) {
    position: static;
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem;
    border-radius: 28px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #166534;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  
  &::before {
    content: '';
    width: 5px;
    height: 28px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-radius: 3px;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const Timeline = styled.div`
  position: relative;
  margin: 2.5rem 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 24px;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #22c55e, #16a34a, #059669);
    border-radius: 2px;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  }
`;

const TimelineItem = styled.div<{ $delay: number }>`
  position: relative;
  padding-left: 70px;
  margin-bottom: 2.5rem;
  animation: ${fadeInUp} 0.6s ease-out ${({ $delay }) => $delay}s both;
  
  &::before {
    content: '';
    position: absolute;
    left: 16px;
    top: 12px;
    width: 16px;
    height: 16px;
    background: #22c55e;
    border-radius: 50%;
    border: 4px solid white;
    box-shadow: 0 0 0 3px #22c55e, 0 4px 12px rgba(34, 197, 94, 0.3);
    z-index: 2;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineContent = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), transparent, rgba(34, 197, 94, 0.1));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-3px) translateX(5px);
    box-shadow: 0 12px 32px rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.2);
    
    &::before {
      opacity: 1;
    }
  }
`;

const TimelineTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 700;
  color: #166534;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TimelineDescription = styled.p`
  font-size: 0.9375rem;
  color: #16a34a;
  line-height: 1.6;
  margin: 0 0 0.75rem 0;
`;

const TimelineTime = styled.span`
  font-size: 0.8125rem;
  color: #059669;
  font-weight: 600;
  opacity: 0.8;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  display: inline-block;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1.0625rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  position: relative;
  overflow: hidden;
  
  ${({ $variant }) => $variant === 'primary' ? css`
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    box-shadow: 0 12px 32px rgba(34, 197, 94, 0.25);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.6s ease;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 16px 48px rgba(34, 197, 94, 0.35);
      
      &::before {
        left: 100%;
      }
    }
  ` : css`
    background: rgba(255, 255, 255, 0.9);
    color: #166534;
    border: 1px solid rgba(34, 197, 94, 0.2);
    
    &:hover {
      background: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.3);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15);
    }
  `}
  
  &:last-child {
    margin-bottom: 0;
  }
  
  i {
    font-size: 1.125rem;
    opacity: 0.9;
  }
`;

const FloatingStats = styled.div`
  margin-top: 2rem;
  background: rgba(248, 250, 252, 0.9);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.375rem;
  box-shadow: 0 8px 20px rgba(34, 197, 94, 0.25);
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.8125rem;
  color: #16a34a;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #166534;
`;

interface SuccessPageProps {
  data: SuccessData;
}

export const SuccessPageComponent: React.FC<SuccessPageProps> = ({ data }) => {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Remover confetti após 6 segundos
    const timer = setTimeout(() => setShowConfetti(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Tracking do mouse para efeitos interativos
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const confettiColors = ['#22c55e', '#16a34a', '#059669', '#fbbf24', '#f59e0b', '#06b6d4', '#8b5cf6'];

  return (
    <SuccessContainer ref={containerRef}>
      <CursorGlow $x={mousePosition.x} $y={mousePosition.y} />
      
      {showConfetti && (
        <ConfettiContainer>
          {Array.from({ length: 80 }).map((_, i) => (
            <ConfettiPiece
              key={i}
              $delay={i * 0.08}
              $color={confettiColors[i % confettiColors.length]}
              $left={Math.random() * 100}
              $size={Math.random() * 6 + 4}
              $duration={Math.random() * 3 + 3}
            />
          ))}
        </ConfettiContainer>
      )}
      
      <ContentWrapper>
        <SuccessHeader>
          <IconContainer>
            <SuccessIcon>
              <svg viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              
              {/* Sparkle effects premium */}
              <SparkleEffect $delay={0.5} $size={10} $top="8%" $left="82%" $color="#fbbf24" />
              <SparkleEffect $delay={1} $size={8} $top="18%" $left="18%" $color="#f59e0b" />
              <SparkleEffect $delay={1.5} $size={12} $top="72%" $left="87%" $color="#06b6d4" />
              <SparkleEffect $delay={2} $size={9} $top="85%" $left="12%" $color="#8b5cf6" />
              <SparkleEffect $delay={2.5} $size={7} $top="25%" $left="90%" $color="#22c55e" />
              <SparkleEffect $delay={3} $size={11} $top="78%" $left="5%" $color="#f59e0b" />
            </SuccessIcon>
          </IconContainer>
          
          <SuccessTitle>Pagamento Realizado!</SuccessTitle>
          <SuccessSubtitle>
            🎉 Parabéns, {data.userName}! Sua participação foi confirmada com sucesso. 
            Seus números da sorte já estão garantidos e prontos para concorrer! 🍀
          </SuccessSubtitle>
        </SuccessHeader>

                 <MainContent>
           <PurchaseDetails>
             <SectionTitle>📋 Detalhes da Compra</SectionTitle>
             
             <Timeline>
               <TimelineItem $delay={0.1}>
                 <TimelineContent>
                   <TimelineTitle>🎯 Campanha Selecionada</TimelineTitle>
                   <TimelineDescription>
                     {data.campaignTitle}
                   </TimelineDescription>
                   <TimelineTime>Hoje, {new Date().toLocaleTimeString()}</TimelineTime>
                 </TimelineContent>
               </TimelineItem>
               
               <TimelineItem $delay={0.2}>
                 <TimelineContent>
                   <TimelineTitle>🎫 Quantidade de Números</TimelineTitle>
                   <TimelineDescription>
                     {data.quantity} números da sorte
                     {data.isCombo && data.comboName && ` (${data.comboName})`}
                   </TimelineDescription>
                   <TimelineTime>Processado</TimelineTime>
                 </TimelineContent>
               </TimelineItem>
               
               <TimelineItem $delay={0.3}>
                 <TimelineContent>
                   <TimelineTitle>💳 Pagamento Confirmado</TimelineTitle>
                   <TimelineDescription>
                     R$ {data.totalPrice.toFixed(2)} via PIX
                   </TimelineDescription>
                   <TimelineTime>Confirmado às {new Date().toLocaleTimeString()}</TimelineTime>
                 </TimelineContent>
               </TimelineItem>
               
               <TimelineItem $delay={0.4}>
                 <TimelineContent>
                   <TimelineTitle>🔒 Números Reservados</TimelineTitle>
                   <TimelineDescription>
                     Seus números foram automaticamente reservados no sistema
                   </TimelineDescription>
                   <TimelineTime>Concluído</TimelineTime>
                 </TimelineContent>
               </TimelineItem>
               
               <TimelineItem $delay={0.5}>
                 <TimelineContent>
                   <TimelineTitle>📧 E-mail de Confirmação</TimelineTitle>
                   <TimelineDescription>
                     Enviado com seus números da sorte e comprovante de participação
                   </TimelineDescription>
                   <TimelineTime>Enviado agora</TimelineTime>
                 </TimelineContent>
               </TimelineItem>
             </Timeline>
           </PurchaseDetails>
           
           <QuickActions>
             <SectionTitle>⚡ Ações Rápidas</SectionTitle>
             
             <ActionButton $variant="primary">
               <i className="fas fa-list" />
               Ver Meus Números
             </ActionButton>
             
             <ActionButton $variant="secondary">
               <i className="fas fa-share" />
               Compartilhar
             </ActionButton>
             
             <ActionButton $variant="secondary">
               <i className="fas fa-download" />
               Baixar Comprovante
             </ActionButton>
             
             <ActionButton 
               $variant="secondary"
               onClick={() => router.push('/')}
             >
               <i className="fas fa-home" />
               Voltar ao Início
             </ActionButton>
             
             <FloatingStats>
               <StatItem>
                 <StatIcon>🎯</StatIcon>
                 <StatInfo>
                   <StatLabel>Suas Chances</StatLabel>
                   <StatValue>1 em 1.000</StatValue>
                 </StatInfo>
               </StatItem>
               
               <StatItem>
                 <StatIcon>🏆</StatIcon>
                 <StatInfo>
                   <StatLabel>Prêmio Total</StatLabel>
                   <StatValue>R$ 8.000,00</StatValue>
                 </StatInfo>
               </StatItem>
               
               <StatItem>
                 <StatIcon>📅</StatIcon>
                 <StatInfo>
                   <StatLabel>Sorteio Em</StatLabel>
                   <StatValue>15 dias</StatValue>
                 </StatInfo>
               </StatItem>
             </FloatingStats>
           </QuickActions>
         </MainContent>
      </ContentWrapper>
    </SuccessContainer>
  );
};

export default SuccessPageComponent; 