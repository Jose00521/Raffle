'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import styled, { keyframes, css } from 'styled-components';
import Layout from '../../../../../../components/layout/Layout';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { INumberPackageCampaign } from '@/hooks/useCampaignSelection';
import { IUser } from '@/models/interfaces/IUserInterfaces';
import mongoose from 'mongoose';
import { IPayment } from '@/models/interfaces/IPaymentInterfaces';
import { formatCurrency } from '@/utils/formatters';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import { sendGTMEvent } from '@next/third-parties/google';

// Interfaces
interface CheckoutData {
  campanha: ICampaign;
  campaignSelection: INumberPackageCampaign;
  userFound: Partial<IUser>;
}

interface SuccessPageProps {}

// Animações
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

// Animação de confete mais fluida e otimizada para mobile
const confettiFall = keyframes`
  0% {
    transform: translateY(-10px) rotate(0deg) scale(1);
    opacity: 1;
  }
  25% {
    transform: translateY(calc(25vh)) rotate(90deg) scale(0.9);
    opacity: 0.9;
  }
  50% {
    transform: translateY(calc(50vh)) rotate(180deg) scale(0.8);
    opacity: 0.8;
  }
  75% {
    transform: translateY(calc(75vh)) rotate(270deg) scale(0.7);
    opacity: 0.7;
  }
  100% {
    transform: translateY(100vh) rotate(360deg) scale(0.6);
    opacity: 0;
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const checkmarkDraw = keyframes`
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
`;

const pulseGlow = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px rgba(34, 197, 94, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(34, 197, 94, 0.6);
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

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const sparkle = keyframes`
  0%, 100% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1) rotate(180deg);
  }
`;

const slideUp = keyframes`
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const checkDraw = keyframes`
  0% {
    stroke-dashoffset: 60;
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

const circleScale = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.8;
  }
  100% {
    transform: scale(4);
    opacity: 0;
  }
`;

const fadeInScale = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled Components
const SuccessContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, 
    #f0fdf4 0%, 
    #dcfce7 25%, 
    #bbf7d0 50%, 
    #a7f3d0 75%, 
    #6ee7b7 100%
  );
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 45%),
      radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.1) 0%, transparent 45%),
      radial-gradient(circle at 40% 60%, rgba(5, 150, 105, 0.05) 0%, transparent 45%);
    pointer-events: none;
  }
`;

// Componente de confete melhorado
const ConfettiContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
  overflow: hidden;
`;

const ConfettiPiece = styled.div<{ 
  $delay: number; 
  $color: string; 
  $left: number;
  $size: number;
  $duration: number;
  $rotation: number;
}>`
  position: absolute;
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size * 0.4}px;
  background: ${({ $color }) => $color};
  top: -20px;
  left: ${({ $left }) => $left}%;
  animation: ${confettiFall} ${({ $duration }) => $duration}s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  border-radius: ${({ $size }) => $size > 8 ? '2px' : '50%'};
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
  transform: rotate(${({ $rotation }) => $rotation}deg);
  will-change: transform, opacity;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const SuccessHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  animation: ${fadeInUp} 0.8s ease-out;
`;

const IconContainer = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  position: relative;
  animation: ${scaleIn} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }
`;

const SuccessIcon = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 20px 40px rgba(34, 197, 94, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.3);
  animation: ${pulseGlow} 2s ease-in-out infinite;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    padding: 3px;
    background: linear-gradient(135deg, #22c55e, #16a34a, #059669);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    opacity: 0.6;
  }
  
  svg {
    width: 50px;
    height: 50px;
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: ${checkmarkDraw} 1s ease-out 0.5s forwards;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
  }
`;

const SparkleEffect = styled.div<{ $delay: number; $size: number; $top: string; $left: string }>`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  background: linear-gradient(45deg, #fbbf24, #f59e0b);
  border-radius: 2px;
  animation: ${sparkle} 2s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay}s;
  transform-origin: center;
`;

const SuccessTitle = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #166534;
  margin-bottom: 1rem;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #166534, #15803d, #16a34a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, #22c55e, #16a34a);
    border-radius: 2px;
    animation: ${shimmer} 2s ease-in-out infinite;
    background-size: 200% 100%;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
`;

const SuccessSubtitle = styled.p`
  font-size: 1.25rem;
  color: #166534;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  opacity: 0.9;
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 3rem;
  animation: ${fadeInUp} 0.8s ease-out 0.3s both;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PurchaseDetails = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #22c55e, #16a34a, #059669);
    border-radius: 24px 24px 0 0;
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #166534;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  &::before {
    content: '';
    width: 4px;
    height: 24px;
    background: linear-gradient(135deg, #22c55e, #16a34a);
    border-radius: 2px;
  }
`;

const Timeline = styled.div`
  position: relative;
  margin: 2rem 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 20px;
    top: 0;
    bottom: 0;
    width: 2px;
    background: linear-gradient(180deg, #22c55e, #16a34a);
    border-radius: 1px;
  }
`;

const TimelineItem = styled.div<{ $delay: number }>`
  position: relative;
  padding-left: 60px;
  margin-bottom: 2rem;
  animation: ${fadeInUp} 0.6s ease-out ${({ $delay }) => $delay}s both;
  
  &::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 8px;
    width: 12px;
    height: 12px;
    background: #22c55e;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 2px #22c55e;
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const TimelineContent = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(34, 197, 94, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(34, 197, 94, 0.15);
    border-color: rgba(34, 197, 94, 0.2);
  }
`;

const TimelineTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #166534;
  margin-bottom: 0.5rem;
`;

const TimelineDescription = styled.p`
  font-size: 0.875rem;
  color: #16a34a;
  line-height: 1.5;
  margin: 0;
`;

const TimelineTime = styled.span`
  font-size: 0.75rem;
  color: #059669;
  font-weight: 500;
  opacity: 0.8;
  margin-top: 0.5rem;
  display: block;
`;

const QuickActions = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(180%);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.08),
    0 16px 32px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.6);
  height: fit-content;
  position: sticky;
  top: 2rem;
  
  @media (max-width: 1024px) {
    position: static;
  }
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    border-radius: 20px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  width: 100%;
  padding: 1.25rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  position: relative;
  overflow: hidden;
  
  ${({ $variant }) => $variant === 'primary' ? css`
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: white;
    border: none;
    box-shadow: 0 8px 25px rgba(34, 197, 94, 0.25);
    
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
      transform: translateY(-2px);
      box-shadow: 0 12px 35px rgba(34, 197, 94, 0.35);
      
      &::before {
        left: 100%;
      }
    }
  ` : css`
    background: rgba(255, 255, 255, 0.8);
    color: #166534;
    border: 1px solid rgba(34, 197, 94, 0.2);
    
    &:hover {
      background: rgba(34, 197, 94, 0.05);
      border-color: rgba(34, 197, 94, 0.3);
      transform: translateY(-1px);
    }
  `}
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FloatingStats = styled.div`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.6);
  animation: ${float} 3s ease-in-out infinite;
  z-index: 100;
  
  @media (max-width: 768px) {
    position: static;
    margin-top: 2rem;
    animation: none;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const StatInfo = styled.div`
  flex: 1;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #16a34a;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StatValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #166534;
`;

// Loading Screen Components
const LoadingOverlay = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
  visibility: ${({ $isVisible }) => $isVisible ? 'visible' : 'hidden'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.05) 0%, transparent 45%),
      radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.05) 0%, transparent 45%);
    pointer-events: none;
  }
`;

const LoadingContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeInScale} 0.8s ease-out;
`;

const CheckContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin-bottom: 2rem;
`;

const CheckCircle = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: linear-gradient(135deg, #22C55E, #16A34A);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  animation: ${circleScale} 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 
    0 20px 40px rgba(34, 197, 94, 0.3),
    0 8px 16px rgba(0, 0, 0, 0.2);
  
  &::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22C55E, #16A34A);
    opacity: 0.3;
    animation: ${ripple} 2s ease-out infinite;
  }
  
  &::after {
    content: '';
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #22C55E, #16A34A);
    opacity: 0.2;
    animation: ${ripple} 2s ease-out 0.5s infinite;
  }
`;

const CheckSvg = styled.svg`
  width: 50px;
  height: 50px;
  z-index: 1;
  
  path {
    stroke: white;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    fill: none;
    stroke-dasharray: 60;
    stroke-dashoffset: 60;
    animation: ${checkDraw} 1.2s ease-out 0.6s forwards;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  }
`;

const LoadingText = styled.div`
  text-align: center;
  color: white;
`;

const LoadingTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  opacity: 0;
  animation: ${fadeInUp} 0.6s ease-out 1.2s forwards;
`;

const LoadingSubtitle = styled.p`
  font-size: 1rem;
  opacity: 0.8;
  opacity: 0;
  animation: ${fadeInUp} 0.6s ease-out 1.4s forwards;
`;

const SuccessContentWrapper = styled.div<{ $showContent: boolean }>`
  opacity: ${({ $showContent }) => $showContent ? 1 : 0};
  transform: ${({ $showContent }) => $showContent ? 'translateY(0)' : 'translateY(20px)'};
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transition-delay: ${({ $showContent }) => $showContent ? '0.3s' : '0s'};
`;

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [paymentData, setPaymentData] = useState<IPayment | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const confettiContainerRef = useRef<HTMLDivElement>(null);

  const prizeValue = ()=>{

    const sumPerPosition: number[] = []	;
    checkoutData?.campanha.prizeDistribution?.forEach(prize => {
      const value = prize.prizes?.reduce((acc, curr) => {
        return acc + Number((curr as IPrize).value);
      }, 0);
      sumPerPosition.push(value);
    });
    return sumPerPosition.reduce((acc, curr) => acc + curr, 0);
  };

  useEffect(() => {
    // Sequência de animações aprimorada
    const timer1 = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Reduzido para 2 segundos para melhorar a experiência
    
    const timer2 = setTimeout(() => {
      setShowContent(true);
    }, 2500); // Mostrar conteúdo mais cedo

    const checkoutItem = localStorage.getItem('checkoutData');
    const checkout = JSON.parse(checkoutItem || '{}');
    if (checkoutItem) {
      setCheckoutData(checkout);
    }

    const paymentItem = localStorage.getItem('paymentData');
    const payment = JSON.parse(paymentItem || '{}');
    if (paymentItem) {
      setPaymentData(payment);
    }

    console.log(payment, checkout);

    if (payment && checkout) {
    sendGTMEvent({
      event: 'purchase',
      event_id: payment.paymentCode,
      page: {
        page_path: pathname,
        page_title: document.title,
      },
      category: 'purchase',
      action: 'success',
      label: 'success_page',
      value: payment?.amount || 0,
      currency: 'BRL',
      transaction_id: payment.paymentCode,
      items: [
        {
          item_id: payment.paymentCode,
          item_name: checkout.campanha.title,
          item_category: 'purchase',
          item_price: payment.amount,
          item_quantity: checkout.campaignSelection.quantity,
          },
        ],

          // Dados para Advanced Matching do Facebook
          user_data: {
            em: checkout.foundUser?.fb?.em || '', // Email (hash recomendado)
            ph: checkout.foundUser?.fb?.ph || '', // Telefone (hash recomendado)
            fn: checkout.foundUser?.fb?.fn || '', // Primeiro nome
            ln: checkout.foundUser?.fb?.ln || '', // Sobrenome
            external_id: checkout.foundUser?.fb?.external_id || '', // ID do usuário no seu sistema
            country: checkout.foundUser?.fb?.country || '', // País
            ct: checkout.foundUser?.fb?.ct || '', // Cidade
            st: checkout.foundUser?.fb?.st || '', // Estado
            zp: checkout.foundUser?.fb?.zp || '', // CEP
          }
      },'dataLayer');
    }
    
    // Manter o confete por mais tempo, mas reduzir gradualmente a quantidade
    const timer3 = setTimeout(() => {
      // Não removemos completamente, apenas reduzimos a quantidade
      const confettiElements = confettiContainerRef.current?.querySelectorAll('div');
      if (confettiElements) {
        confettiElements.forEach((el, i) => {
          if (i % 2 === 0) {
            (el as HTMLElement).style.opacity = '0';
            (el as HTMLElement).style.transition = 'opacity 1s ease-out';
          }
        });
      }
    }, 6000);
    
    // Remover completamente após 10 segundos
    const timer4 = setTimeout(() => setShowConfetti(false), 10000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [params?.id]);


  // Cores mais vibrantes para o confete
  const confettiColors = [
    '#22c55e', '#16a34a', '#059669', // Verdes
    '#fbbf24', '#f59e0b', '#d97706', // Amarelos/Laranjas
    '#06b6d4', '#0ea5e9', '#3b82f6', // Azuis
    '#8b5cf6', '#a855f7', '#d946ef'  // Roxos/Rosas
  ];

  return (
    <>
      {/* Loading Screen */}
      <LoadingOverlay $isVisible={isLoading}>
        <LoadingContainer>
          <CheckContainer>
            <CheckCircle>
              <CheckSvg viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </CheckSvg>
            </CheckCircle>
          </CheckContainer>
          <LoadingText>
            <LoadingTitle>Pagamento Confirmado!</LoadingTitle>
            <LoadingSubtitle>Preparando seus números da sorte...</LoadingSubtitle>
          </LoadingText>
        </LoadingContainer>
      </LoadingOverlay>

      {/* Success Content */}
      <Layout hideHeader={true} hideFooter={true}>
        <SuccessContentWrapper $showContent={showContent}>
          <SuccessContainer>
            {showConfetti && showContent && (
              <ConfettiContainer ref={confettiContainerRef}>
                {Array.from({ length: 100 }).map((_, i) => {
                  const size = Math.random() * 10 + 5; // Tamanhos variados
                  const duration = Math.random() * 4 + 3; // Durações variadas
                  const rotation = Math.random() * 360; // Rotação aleatória
                  
                  return (
                    <ConfettiPiece
                      key={i}
                      $delay={i * 0.05} // Delay mais curto para uma animação mais fluida
                      $color={confettiColors[i % confettiColors.length]}
                      $left={Math.random() * 100}
                      $size={size}
                      $duration={duration}
                      $rotation={rotation}
                    />
                  );
                })}
              </ConfettiContainer>
            )}
        
            <ContentWrapper>
              <SuccessHeader>
                <IconContainer>
                  <SuccessIcon>
                    <svg viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    
                    {/* Sparkle effects */}
                    <SparkleEffect $delay={0.5} $size={8} $top="10%" $left="80%" />
                    <SparkleEffect $delay={1} $size={6} $top="20%" $left="20%" />
                    <SparkleEffect $delay={1.5} $size={10} $top="70%" $left="85%" />
                    <SparkleEffect $delay={2} $size={7} $top="80%" $left="15%" />
                  </SuccessIcon>
                </IconContainer>
                
                <SuccessTitle>Pagamento Realizado!</SuccessTitle>
                <SuccessSubtitle>
                  Parabéns! Sua participação foi confirmada com sucesso. 
                  Seus números da sorte já estão reservados!
                </SuccessSubtitle>
              </SuccessHeader>

              <MainContent>
                <PurchaseDetails>
                  <SectionTitle>📋 Detalhes da Compra</SectionTitle>
                  
                  {checkoutData && (
                    <>
                      <Timeline>
                        <TimelineItem $delay={0.1}>
                          <TimelineContent>
                            <TimelineTitle>Campanha Selecionada</TimelineTitle>
                            <TimelineDescription>
                              {checkoutData.campanha.title}
                            </TimelineDescription>
                            <TimelineTime>Hoje, {new Date(paymentData?.createdAt || '').toLocaleTimeString()}</TimelineTime>
                          </TimelineContent>
                        </TimelineItem>
                        
                        <TimelineItem $delay={0.2}>
                          <TimelineContent>
                            <TimelineTitle>Quantidade de Números</TimelineTitle>
                            <TimelineDescription>
                              {checkoutData.campaignSelection.quantity} números da sorte
                              {checkoutData.campaignSelection.isCombo && ` (${checkoutData.campaignSelection.name})`}
                            </TimelineDescription>
                            <TimelineTime>Processado</TimelineTime>
                          </TimelineContent>
                        </TimelineItem>
                        
                        <TimelineItem $delay={0.3}>
                          <TimelineContent>
                            <TimelineTitle>Pagamento Confirmado</TimelineTitle>
                            <TimelineDescription>
                              {formatCurrency(paymentData?.amount || 0)} via PIX
                            </TimelineDescription>
                            <TimelineTime>Confirmado às {new Date(paymentData?.approvedAt || '').toLocaleTimeString()}</TimelineTime>
                          </TimelineContent>
                        </TimelineItem>
                        
                        <TimelineItem $delay={0.4}>
                          <TimelineContent>
                            <TimelineTitle>Números Reservados</TimelineTitle>
                            <TimelineDescription>
                              Seus números foram automaticamente reservados no sistema
                            </TimelineDescription>
                            <TimelineTime>Concluído</TimelineTime>
                          </TimelineContent>
                        </TimelineItem>
                      </Timeline>
                    </>
                  )}
                </PurchaseDetails>
                
                <QuickActions>
                  <SectionTitle>⚡ Ações Rápidas</SectionTitle>
                  
                  {/* <ActionButton $variant="primary">
                    <i className="fas fa-list" />
                    Ver Meus Números
                  </ActionButton> */}
                  
                  <ActionButton $variant="secondary">
                    <i className="fas fa-share" />
                    Compartilhar
                  </ActionButton>
  {/*               
                  <ActionButton $variant="secondary">
                    <i className="fas fa-download" />
                    Baixar Comprovante
                  </ActionButton> */}
                  
                  <ActionButton 
                    $variant="secondary"
                    onClick={() => router.push('/')}
                  >
                    <i className="fas fa-home" />
                    Voltar ao Início
                  </ActionButton>
                </QuickActions>
              </MainContent>
              
              <FloatingStats>
                
                <StatItem>
                  <StatIcon>🏆</StatIcon>
                  <StatInfo>
                    <StatLabel>Prêmio Total</StatLabel>
                    <StatValue>{formatCurrency(prizeValue() || 0)}</StatValue>
                  </StatInfo>
                </StatItem>
                
                <StatItem>
                  <StatIcon>📅</StatIcon>
                  <StatInfo>
                    <StatLabel>Sorteio Em</StatLabel>
                    <StatValue>{checkoutData?.campanha.drawDate ? `${Math.ceil((new Date(checkoutData.campanha.drawDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias` : 'N/A'}</StatValue>
                  </StatInfo>
                </StatItem>
              </FloatingStats>
            </ContentWrapper>
          </SuccessContainer>
        </SuccessContentWrapper>
      </Layout>
    </>
  );
} 