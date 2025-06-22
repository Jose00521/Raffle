'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled, { keyframes } from 'styled-components';
import Layout from '@/components/layout/Layout';
import { ICampaign, INumberPackageCampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IUser } from '@/models/interfaces/IUserInterfaces';
import { toast, ToastContainer } from 'react-toastify';
import SecurityModal from '@/components/auth/SecurityModal';
import Timer from '@/components/ui/Timer';
import { formatCurrency } from '@/utils/formatNumber';
import { useCheckoutFlow } from '@/hooks/useCheckoutFlow';
import CertificationSection, { CertificationSectionCompact } from '@/components/ui/CertificationSection';
import { SocketProvider, useSocket } from '@/context/SocketContext';

// Interfaces
// Interface removida - usando a interface CheckoutData mais abaixo que é compatível com INumberPackageCampaign

// Animações
const slideInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

// Styled Components
const CheckoutContainer = styled.div`
  min-height: 100vh;
  background: 
    linear-gradient(180deg, #ffffff 0%, #fafbfc 25%, #f8fafc 50%, #f1f5f9 75%, #e2e8f0 100%);
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
      radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.03) 0%, transparent 45%),
      radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.02) 0%, transparent 45%);
    pointer-events: none;
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.1) 50%, transparent 100%);
    z-index: 2;
  }
`;

const TopSecurityBar = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px) saturate(120%);
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
  padding: 2rem 0;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(59, 130, 246, 0.4) 50%, transparent 100%);
    border-radius: 1px;
  }
`;

const TopSecurityContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
  }
`;

const TopSecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(34, 197, 94, 0.04);
  backdrop-filter: blur(10px);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(34, 197, 94, 0.1);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    padding: 1px;
    background: linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, transparent 50%, rgba(34, 197, 94, 0.15) 100%);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
  }
  
  i {
    font-size: 1.1rem;
    color: #16a34a;
    filter: drop-shadow(0 1px 2px rgba(34, 197, 94, 0.2));
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 0.625rem 1.25rem;
    gap: 0.5rem;
  }
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 2;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const CheckoutHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${slideInUp} 0.8s ease-out;
  
  @media (max-width: 768px) {
    margin-bottom: 3rem;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 2.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1.25rem;
  letter-spacing: -0.025em;
  line-height: 1.2;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4);
    border-radius: 1px;
    opacity: 0.6;
  }
  
  @media (max-width: 768px) {
    font-size: 2.25rem;
    
    &::after {
      width: 50px;
      bottom: -6px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.875rem;
    
    &::after {
      width: 40px;
      bottom: -6px;
    }
  }
`;

const HeaderSubtitle = styled.p`
  font-size: 1.125rem;
  color: #64748b;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ProgressSteps = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3rem;
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  animation: ${slideInUp} 0.8s ease-out 0.2s both;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
    padding: 1.25rem 1.5rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
  }
`;

const ProgressStep = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  align-items: center;
  color: ${({ $active, $completed }) => 
    $completed ? '#10b981' : $active ? '#3b82f6' : '#64748b'
  };
  font-weight: 600;
  font-size: 0.9rem;
  
  &:not(:last-child)::after {
    content: '';
    width: 60px;
    height: 2px;
    background: ${({ $completed }) => 
      $completed ? '#10b981' : '#e2e8f0'
    };
    margin: 0 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    
    &:not(:last-child)::after {
      width: 40px;
      margin: 0 0.5rem;
    }
  }
`;

const StepIcon = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $active, $completed }) => 
    $completed ? '#10b981' : $active ? '#3b82f6' : '#e2e8f0'
  };
  color: ${({ $active, $completed }) => 
    $completed ? 'white' : $active ? 'white' : '#64748b'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: ${({ $active, $completed }) => 
    $completed ? '0 4px 12px rgba(16, 185, 129, 0.3)' : 
    $active ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 
    'none'
  };
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
    margin-right: 0.5rem;
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: 3rem;
  animation: ${slideInUp} 0.8s ease-out 0.4s both;
  align-items: start;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 500px;
    gap: 2.5rem;
  }
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const PaymentSection = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px) saturate(120%);
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.6);
  animation: ${slideInLeft} 0.8s ease-out;
  position: relative;
  transition: all 0.3s ease;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
    border-radius: 20px 20px 0 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -1px;
    left: -1px;
    right: -1px;
    bottom: -1px;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.1) 0%, 
      transparent 25%, 
      transparent 75%, 
      rgba(139, 92, 246, 0.1) 100%
    );
    border-radius: 20px;
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 
      0 32px 64px rgba(0, 0, 0, 0.12),
      0 12px 24px rgba(0, 0, 0, 0.08),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    
    &::after {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 2.5rem;
    border-radius: 16px;
    
    &::before {
      border-radius: 16px 16px 0 0;
      height: 3px;
    }
    
    &::after {
      border-radius: 16px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 2rem;
    border-radius: 12px;
    
    &::before {
      border-radius: 12px 12px 0 0;
      height: 3px;
    }
    
    &::after {
      border-radius: 12px;
    }
  }
`;

const PaymentTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.025em;
  
  i {
    color: #3b82f6;
    font-size: 1.5rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const PaymentSubtitle = styled.p`
  color: #64748b;
  margin-bottom: 2.5rem;
  font-size: 1rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const SecurityBadges = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.5rem;
    margin-bottom: 1.25rem;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: #e8f5e8;
  color: #2d5830;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid #c3e6c3;
  
  @media (max-width: 768px) {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
  }
`;

const SecurityButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0 1.5rem;
`;

const SecurityButtonContainerMobile = styled.div`
  display: flex;
  justify-content: center;
  margin: 1rem 0 1.5rem;
  
  @media (min-width: 1025px) {
    display: none;
  }
`;

const SecurityButtonContainerDesktop = styled.div`
  display: none;
  justify-content: center;
  margin: 1.5rem 0 0;
  
  @media (min-width: 1025px) {
    display: flex;
  }
`;

const SecurityButton = styled.button`
  background: white;
  color: #22c55e;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 1.25rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: relative;
  
  &:hover {
    background: #f9fafb;
    border-color: #22c55e;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  img {
    width: 16px;
    height: 16px;
    filter: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.65rem 1.125rem;
    font-size: 0.8rem;
    
    img {
      width: 14px;
      height: 14px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.6rem 1rem;
    font-size: 0.75rem;
    
    img {
      width: 12px;
      height: 12px;
    }
  }
`;

const PixContainer = styled.div`
  background: #fafbfc;
  border-radius: 16px;
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
  border: 2px solid #f1f5f9;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #e2e8f0;
    background: #ffffff;
  }
  
  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem 1rem;
  }
`;

const QRSection = styled.div`
  margin-bottom: 2rem;
  align-items: center;
  justify-content: center;
  display: flex;
  flex-direction: column;
`;

const QRCodeWrapper = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 2.5rem;
  display: inline-block;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  box-shadow: 
    0 16px 32px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 16px;
    padding: 1px;
    background: linear-gradient(135deg, 
      rgba(59, 130, 246, 0.15) 0%, 
      transparent 50%, 
      rgba(139, 92, 246, 0.15) 100%
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: xor;
    -webkit-mask-composite: xor;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 24px 48px rgba(0, 0, 0, 0.1),
      0 8px 16px rgba(0, 0, 0, 0.06),
      inset 0 1px 0 rgba(255, 255, 255, 0.9);
    
    &::before {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 2rem;
    border-radius: 14px;
    
    &::before {
      border-radius: 14px;
    }
  }
  
  @media (max-width: 480px) {
    padding: 1.5rem;
    border-radius: 12px;
    
    &::before {
      border-radius: 12px;
    }
  }
`;

const QRPlaceholder = styled.div`
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
  font-weight: 700;
  position: relative;
  box-shadow: 
    0 16px 32px rgba(59, 130, 246, 0.2),
    0 6px 12px rgba(139, 92, 246, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
  
  
  &:hover {
    transform: translateY(-1px) scale(1.02);
    box-shadow: 
      0 20px 40px rgba(59, 130, 246, 0.25),
      0 8px 16px rgba(139, 92, 246, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
  }
  
  @media (max-width: 768px) {
    width: 160px;
    height: 160px;
    font-size: 2.5rem;
    border-radius: 10px;
    
    &::after {
      font-size: 0.8rem;
      bottom: 0.8rem;
      letter-spacing: 1px;
    }
  }
  
  @media (max-width: 480px) {
    width: 140px;
    height: 140px;
    font-size: 2rem;
    border-radius: 8px;
    
    &::after {
      font-size: 0.75rem;
      bottom: 0.6rem;
      letter-spacing: 1px;
    }
  }
`;

const QRLabel = styled.p`
  font-size: 0.95rem;
  color: #475569;
  margin: 0;
  font-weight: 600;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  
  @media (max-width: 768px) {
    font-size: 0.875rem;
  }
`;

const PixCodeSection = styled.div`
  text-align: left;
  margin-top: 2.5rem;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: -1rem;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, #cbd5e1, transparent);
  }
  
  @media (max-width: 768px) {
    margin-top: 2rem;
  }
`;

const PixCodeLabel = styled.p`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const PixCodeContainer = styled.div`
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PixCode = styled.div`
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.8rem;
  color: #374151;
  word-break: break-all;
  line-height: 1.5;
  background: #f9fafb;
  padding: 0.875rem;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  max-height: 100px;
  overflow-y: auto;
  margin-bottom: 1rem;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 2px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 2px;
  }
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
    max-height: 80px;
    padding: 0.75rem;
  }
`;

const CopyButton = styled.button<{ $copied?: boolean }>`
  background: ${({ $copied }) => 
    $copied 
      ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  };
  color: white;
  border: none;
  padding: 1.25rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: ${({ $copied }) => 
    $copied 
      ? '0 8px 25px rgba(16, 185, 129, 0.25), 0 4px 12px rgba(16, 185, 129, 0.15)' 
      : '0 8px 25px rgba(59, 130, 246, 0.25), 0 4px 12px rgba(59, 130, 246, 0.15)'
  };
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${({ $copied }) => 
      $copied 
        ? '0 12px 35px rgba(16, 185, 129, 0.35), 0 6px 18px rgba(16, 185, 129, 0.2)' 
        : '0 12px 35px rgba(59, 130, 246, 0.35), 0 6px 18px rgba(59, 130, 246, 0.2)'
    };
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  .copy-icon, .success-icon {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 1.125rem;
    height: 1.125rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
  
  .copy-icon {
    opacity: ${({ $copied }) => $copied ? '0' : '1'};
    transform: ${({ $copied }) => $copied ? 'scale(0.7) rotate(45deg)' : 'scale(1) rotate(0deg)'};
    ${({ $copied }) => $copied && 'position: absolute; pointer-events: none;'}
  }
  
  .success-icon {
    opacity: ${({ $copied }) => $copied ? '1' : '0'};
    transform: ${({ $copied }) => $copied ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-45deg)'};
    ${({ $copied }) => !$copied && 'position: absolute; pointer-events: none;'}
  }
  
  .button-text {
    font-weight: 600;
    letter-spacing: 0.025em;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    font-size: 0.9rem;
    
    .copy-icon, .success-icon {
      width: 1rem;
      height: 1rem;
    }
  }
`;



const HowToPaySection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    margin-top: 1.5rem;
  }
`;

const HowToPayTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StepsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    border-color: #667eea;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 0.75rem;
    gap: 0.6rem;
  }
`;

const StepIconWrapper = styled.div`
  width: 2rem;
  height: 2rem;
  background: #3b82f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  
  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
  
  @media (max-width: 768px) {
    width: 1.75rem;
    height: 1.75rem;
    
    svg {
      width: 0.75rem;
      height: 0.75rem;
    }
  }
`;

const StepContent = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  text-align: left;
`;

const StepNumber = styled.div`
  background: #ef4444;
  color: white;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
  margin-bottom: 0.25rem;
  
  @media (max-width: 768px) {
    width: 1.125rem;
    height: 1.125rem;
    font-size: 0.6rem;
  }
`;

const StepTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.4;
  margin-bottom: 0.375rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const StepDescription = styled.div`
  font-size: 0.8rem;
  color: #64748b;
  line-height: 1.45;
  
  @media (max-width: 768px) {
    font-size: 0.75rem;
  }
`;

const StepHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.375rem;
`;

const OrderSummary = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 2rem;
  
  @media (max-width: 1024px) {
    position: static;
  }
  
  @media (max-width: 768px) {
    padding: 1.25rem;
    border-radius: 8px;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  i {
    color: #64748b;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

// Seção de informações do usuário
const UserInfoSection = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const UserInfoTitle = styled.h4`
  color: #475569;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const UserInfoGrid = styled.div`
  display: grid;
  gap: 0.5rem;
`;

const UserInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.875rem;
  
  i {
    color: #94a3b8;
    width: 14px;
    text-align: center;
    font-size: 0.75rem;
  }
  
  strong {
    font-weight: 500;
    color: #1e293b;
  }
`;

// Seção de informações da campanha melhorada
const CampaignInfo = styled.div`
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
`;

const CampaignInfoHeader = styled.div`
  display: flex;
  gap: 0.75rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const CampaignImageContainer = styled.div`
  flex-shrink: 0;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  
  @media (max-width: 480px) {
    align-self: flex-start;
  }
`;

const CampaignImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CampaignImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 1.25rem;
`;

const CampaignDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const CampaignTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 0.25rem 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const CampaignMeta = styled.div`
  color: #64748b;
    font-size: 0.8rem;
  line-height: 1.3;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CampaignStats = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
    flex-wrap: wrap;
  }
`;

const CampaignStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
  white-space: nowrap;
  
  i {
    color: #94a3b8;
    font-size: 0.7rem;
  }
  
  strong {
    color: #1e293b;
    font-weight: 500;
  }
`;

const PurchaseDetails = styled.div`
  margin-bottom: 2rem;
`;

const ComboCard = styled.div`
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
  border: 1px solid #bbf7d0;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, #22c55e, transparent);
    opacity: 0.6;
  }
`;

const ComboHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.25rem;
`;

const ComboTitle = styled.h4`
  color: #166534;
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ComboBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ComboBadge = styled.span`
  background: #22c55e;
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(34, 197, 94, 0.25);
`;

const DiscountBadge = styled.span`
  background: #f59e0b;
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.25);
`;

const ComboMainInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const ComboInfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  flex: 1;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
    width: 100%;
  }
`;

const ComboDetailItem = styled.div`
  text-align: center;
`;

const ComboDetailLabel = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.375rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ComboDetailValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const ComboSavings = styled.div`
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
  border: 1px solid #22c55e;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  position: relative;
  box-shadow: 0 4px 12px rgba(34, 197, 94, 0.15);
  
  &::before {
    content: '💰';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    border: 2px solid #22c55e;
    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.2);
  }
`;

const ComboSavingsText = styled.div`
  font-size: 0.875rem;
  color: #166534;
  font-weight: 600;
  margin-bottom: 0.25rem;
  margin-top: 0.5rem;
`;

const ComboSavingsValue = styled.div`
  font-size: 1.125rem;
  font-weight: 700;
  color: #15803d;
`;

const RegularDetails = styled.div`
  /* Estilos para compra regular (não combo) */
`;

const ComboBenefits = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
`;

const BenefitsTitle = styled.h5`
  color: #166534;
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const BenefitsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const BenefitItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: #166534;
  font-weight: 500;
  
  &::before {
    content: '✨';
    font-size: 1rem;
  }
`;

const ComboComparison = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const ComparisonItem = styled.div<{ $strikethrough?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
`;

const ComparisonLabel = styled.div`
  font-size: 0.75rem;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ComparisonValue = styled.div<{ $strikethrough?: boolean }>`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ $strikethrough }) => $strikethrough ? '#ef4444' : '#059669'};
  text-decoration: ${({ $strikethrough }) => $strikethrough ? 'line-through' : 'none'};
  opacity: ${({ $strikethrough }) => $strikethrough ? '0.7' : '1'};
`;

const ComparisonArrow = styled.div`
  color: #059669;
  font-size: 1.5rem;
  font-weight: 700;
  
  @media (max-width: 480px) {
    transform: rotate(90deg);
  }
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f1f5f9;
  
  &:last-child {
    border-bottom: none;
    font-weight: 700;
    font-size: 1.1rem;
    color: #1e293b;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 2px solid #3b82f6;
  }
`;

const DetailLabel = styled.span`
  color: #7f8c8d;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const DetailValue = styled.span`
  color: #2c3e50;
  font-weight: 600;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const TotalValue = styled.span`
  color: #059669;
  font-size: 1.25rem;
  font-weight: 700;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const SupportSection = styled.div`
  background: rgba(248, 250, 252, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 2rem;
  text-align: center !important;
  justify-content: center !important;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
      rgba(16, 185, 129, 0.02) 0%, 
      rgba(59, 130, 246, 0.02) 100%
    );
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 
      0 8px 25px rgba(31, 38, 135, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.4);
  }
`;

const SupportTitle = styled.h5`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
`;

const SupportText = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 1rem;
  line-height: 1.5;
`;

const SupportButton = styled.button`
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  margin: 0 auto;
  box-shadow: 
    0 8px 25px rgba(16, 185, 129, 0.25),
    0 4px 12px rgba(16, 185, 129, 0.15);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, 
      transparent, 
      rgba(255, 255, 255, 0.2), 
      transparent
    );
    transition: left 0.5s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 35px rgba(16, 185, 129, 0.35),
      0 6px 18px rgba(16, 185, 129, 0.2);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  i {
    font-size: 0.875rem;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.8rem;
    
    i {
      font-size: 0.8rem;
    }
  }
`;

const QRToggleButton = styled.button<{ $expanded?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.1);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3b82f6;
  
  &:hover {
    background: rgba(59, 130, 246, 0.08);
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateY(-1px);
  }
  
  .toggle-icon {
    transition: transform 0.3s ease;
    transform: ${({ $expanded }) => 
      $expanded ? 'rotate(180deg)' : 'rotate(0deg)'
    };
  }
  
  @media (max-width: 768px) {
    padding: 0.875rem 1.25rem;
    font-size: 0.85rem;
  }
`;

const QRCollapseContent = styled.div<{ $expanded: boolean }>`
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: ${({ $expanded }) => $expanded ? '800px' : '0'};
  opacity: ${({ $expanded }) => $expanded ? '1' : '0'};
  margin-bottom: ${({ $expanded }) => $expanded ? '1.5rem' : '0'};
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(102, 126, 234, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${fadeIn} 0.3s ease-out;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;


interface CheckoutData {
  campanha: ICampaign;
  campaignSelection: INumberPackageCampaign
  foundUser: Partial<IUser>
}

interface Pix {
  pixCode: string;
  pixQrCode: string;
  expiresAt: string;
}

// Componente interno que usa o contexto do Socket
function CheckoutContent() {
  const params = useParams();
  const campanhaId = params?.id as string;
  const router = useRouter();
  const { isConnected, joinPaymentRoom, paymentNotifications } = useSocket();
  const [userCode, setUserCode] = useState<string | null>(null);
  
  // 🚀 Hook principal que gerencia todo o fluxo
  const {
    checkoutData,
    campanha,
    pix,
    timeLeft,
    isLoading,
    isCreatingPayment,
    paymentAttemptRef,
    formatTimeLeft
  } = useCheckoutFlow(campanhaId);
  
  // 🎨 Estados locais da UI
  const [copied, setCopied] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Efeito para obter o userCode do localStorage
  useEffect(() => {
    try {
      const checkoutDataStr = localStorage.getItem('checkoutData');
      if (checkoutDataStr) {
        const data = JSON.parse(checkoutDataStr);
        if (data.foundUser?.userCode) {
          setUserCode(data.foundUser.userCode);
          console.log('UserCode encontrado no localStorage:', data.foundUser.userCode);
        }
      }
    } catch (error) {
      console.error('Erro ao obter dados do localStorage:', error);
    }
  }, []);
  
  // Efeito para entrar na room específica do usuário para pagamentos
  useEffect(() => {
    if (isConnected && userCode) {
      joinPaymentRoom();
      console.log('Entrando na room de pagamento para o usuário:', userCode);
    }
  }, [isConnected, joinPaymentRoom, userCode]);
  
  // Efeito para ouvir notificações de pagamento aprovado
  useEffect(() => {
    if (paymentNotifications.length > 0) {
      // Pegar a notificação mais recente
      const latestNotification = paymentNotifications[0];
      
      console.log('Notificação de pagamento recebida:', latestNotification);
      
      // Se tiver URL de redirecionamento
      if (latestNotification.redirectUrl) {
        console.log('Redirecionando para página de sucesso:', latestNotification.redirectUrl);
        
        // Salvar detalhes do pedido no localStorage para uso na página de sucesso
        if (latestNotification.orderDetails) {
          localStorage.setItem('orderDetails', JSON.stringify(latestNotification.orderDetails));
        }
        
        // Redirecionar para a página de sucesso
        router.push(`/campanhas/${campanhaId}/checkout/success`);
      }
    }
  }, [paymentNotifications, router]);

  // 📋 Função para copiar código PIX
  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pix?.pixCode || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
      toast.error('Erro ao copiar código');
    }
  };

  // 🔄 Loading state
  if (isLoading || isCreatingPayment) {
    return (
      <LoadingOverlay>
        <LoadingContent>
          <LoadingSpinner />
          <h3>
            {isCreatingPayment ? 'Gerando seu PIX...' : 'Preparando seu pagamento...'}
          </h3>
          <p>
            {isCreatingPayment 
              ? 'Criando código PIX seguro para você' 
              : 'Aguarde enquanto configuramos tudo para você'
            }
          </p>
          {paymentAttemptRef.current > 1 && (
            <p style={{ color: '#f59e0b', marginTop: '0.5rem' }}>
              Tentativa {paymentAttemptRef.current} de 3...
            </p>
          )}
        </LoadingContent>
      </LoadingOverlay>
    );
  }

  return (
    <>
      <CheckoutContainer>
        <TopSecurityBar>
          <TopSecurityContent>
            <TopSecurityBadge>
              <i className="fas fa-shield-alt"></i>
              Pagamento 100% Seguro e Criptografado
            </TopSecurityBadge>
          </TopSecurityContent>
        </TopSecurityBar>
        
        <ContentWrapper>
          <CheckoutHeader>
            <HeaderTitle>Finalizar Pagamento</HeaderTitle>
            <HeaderSubtitle>
              Complete sua participação via PIX de forma segura
            </HeaderSubtitle>
          </CheckoutHeader>

          <ProgressSteps>
            <ProgressStep $completed>
              <StepIcon $completed>✓</StepIcon>
              Seleção
            </ProgressStep>
            <ProgressStep $active>
              <StepIcon $active>2</StepIcon>
              Pagamento
            </ProgressStep>
            <ProgressStep>
              <StepIcon>3</StepIcon>
              Confirmação
            </ProgressStep>
          </ProgressSteps>

          <MainContent>
            <PaymentSection>
              <PaymentTitle>
                <i className="fas fa-qrcode" />
                Pagamento via PIX
              </PaymentTitle>
              <PaymentSubtitle>
                Copie o código PIX abaixo ou mostre o QR Code para escanear
              </PaymentSubtitle>

              <SecurityBadges>
                <SecurityBadge>
                  <i className="fas fa-shield-alt" />
                  SSL Seguro
                </SecurityBadge>
                <SecurityBadge>
                  <i className="fas fa-lock" />
                  256-bit
                </SecurityBadge>
                <SecurityBadge>
                  <i className="fas fa-check-circle" />
                  Verificado
                </SecurityBadge>
              </SecurityBadges>

              <SecurityButtonContainerMobile>
                <SecurityButton onClick={() => setIsSecurityModalOpen(true)}>
                  <img src="/icons/safe.svg" alt="Seguro" />
                  Ambiente seguro
                </SecurityButton>
              </SecurityButtonContainerMobile>

              <Timer 
                seconds={timeLeft}
                title="Tempo restante para pagamento"
                variant="payment"
                onTimeUp={() => {
                  toast.error('Tempo para pagamento expirado');
                  router.push(`/campanhas/${campanhaId}`);
                }}
              />

              <QRToggleButton 
                onClick={() => setShowQRCode(!showQRCode)}
                $expanded={showQRCode}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className="fas fa-qrcode" />
                  <span>
                    {showQRCode ? 'Ocultar QR Code' : 'Mostrar QR Code para escanear'}
                  </span>
                </div>
                <i className="fas fa-chevron-down toggle-icon" />
              </QRToggleButton>

              <QRCollapseContent $expanded={showQRCode}>
                <PixContainer>
                  <QRSection>
                    <QRCodeWrapper>
                      <QRPlaceholder>
                        {pix?.pixQrCode ? (
                          <img 
                            src={pix.pixQrCode} 
                            alt="QR Code PIX" 
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              console.error('Erro ao carregar QR Code:', e);
                              console.log('pixQrCode value:', pix.pixQrCode);
                            }}
                          />
                        ) : (
                          <span>Carregando QR...</span>
                        )}
                      </QRPlaceholder>
                      {checkoutData?.campaignSelection.isCombo ? (
                        <div style={{
                          background: '#22c55e',
                          color: 'white',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          borderRadius: '0 0 12px 12px',
                          marginTop: '-2px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <i className="fas fa-percentage" style={{ fontSize: '10px' }}></i>
                          Ganhar desconto
                        </div>
                      ) : (
                        <div style={{
                          background: '#22c55e',
                          color: 'white',
                          padding: '6px 12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px',
                          borderRadius: '0 0 12px 12px',
                          marginTop: '-2px',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}>
                          <i className="fas fa-heart" style={{ fontSize: '10px' }}></i>
                          Realize seu sonho
                        </div>
                      )}
                    </QRCodeWrapper>
                    <QRLabel>Escaneie com seu banco</QRLabel>
                  </QRSection>
                </PixContainer>
              </QRCollapseContent>
              
              <PixCodeSection>
                <PixCodeLabel>💳 Código PIX - Copia e Cola</PixCodeLabel>
                <PixCodeContainer>
                  <PixCode>{pix?.pixCode}</PixCode>
                  <CopyButton onClick={handleCopyPixCode} $copied={copied}>
                    <i className="fas fa-copy copy-icon" />
                    <i className="fas fa-check success-icon" />
                    <span className="button-text">
                      {copied ? 'Copiado!' : 'Copiar Código PIX'}
                    </span>
                  </CopyButton>
                </PixCodeContainer>
              </PixCodeSection>

              <CertificationSection />
              
              <HowToPaySection>
                <HowToPayTitle>📋 Instruções Detalhadas para Pagamento PIX</HowToPayTitle>
                <StepsList>
                  <StepItem>
                    <StepIconWrapper>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15.5 1h-8c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H8V4h8v14z"/>
                      </svg>
                    </StepIconWrapper>
                    <StepContent>
                      <StepHeader>
                        <StepNumber>1</StepNumber>
                        <StepTitle>Acesse o aplicativo do seu banco</StepTitle>
                      </StepHeader>
                      <StepDescription>
                        Abra o app do seu banco no celular (Nubank, Inter, Itaú, Bradesco, Santander, Caixa, Banco do Brasil, ou qualquer outro banco que oferece PIX). 
                        Certifique-se de que você está logado na sua conta.
                      </StepDescription>
                    </StepContent>
                  </StepItem>
                  
                  <StepItem>
                    <StepIconWrapper>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </StepIconWrapper>
                    <StepContent>
                      <StepHeader>
                        <StepNumber>2</StepNumber>
                        <StepTitle>Localize a opção PIX</StepTitle>
                      </StepHeader>
                      <StepDescription>
                        Procure pela opção "PIX" no menu principal do seu aplicativo. Normalmente fica na tela inicial ou no menu "Transferir". 
                        Toque em "PIX" ou "Pagar com PIX".
                      </StepDescription>
                    </StepContent>
                  </StepItem>
                  
                  <StepItem>
                    <StepIconWrapper>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6.5 9.5v3h-3v-3h3M13 13h-6v6h6v-6zm6.5 0v3h-3v-3h3M19 13h-6v6h6v-6z"/>
                      </svg>
                    </StepIconWrapper>
                    <StepContent>
                      <StepHeader>
                        <StepNumber>3</StepNumber>
                        <StepTitle>Escaneie o QR Code ou cole o código PIX</StepTitle>
                      </StepHeader>
                      <StepDescription>
                        <strong>Opção 1:</strong> Use a câmera do seu celular para escanear o QR Code acima.<br/>
                        <strong>Opção 2:</strong> Copie o código PIX e cole no campo "PIX Copia e Cola" do seu app bancário.<br/>
                        O valor será preenchido automaticamente ({formatCurrency(checkoutData?.campaignSelection.totalPrice || 0)}).
                      </StepDescription>
                    </StepContent>
                  </StepItem>
                  
                  <StepItem>
                    <StepIconWrapper>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                      </svg>
                    </StepIconWrapper>
                    <StepContent>
                      <StepHeader>
                        <StepNumber>4</StepNumber>
                        <StepTitle>Confirme os dados e finalize o pagamento</StepTitle>
                      </StepHeader>
                      <StepDescription>
                        Verifique se o valor está correto ({formatCurrency(checkoutData?.campaignSelection.totalPrice || 0)}), 
                        confirme sua senha/biometria e finalize o pagamento. Você receberá uma confirmação instantânea. 
                        <strong>O pagamento é processado imediatamente!</strong>
                      </StepDescription>
                    </StepContent>
                  </StepItem>
                  
                  <StepItem>
                    <StepIconWrapper>
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </StepIconWrapper>
                    <StepContent>
                      <StepHeader>
                        <StepNumber>5</StepNumber>
                        <StepTitle>Aguarde a confirmação e seus números</StepTitle>
                      </StepHeader>
                      <StepDescription>
                        Após o pagamento, você receberá um e-mail de confirmação com seus números da sorte em até 5 minutos. 
                        Você também pode acompanhar sua participação na área "Meus Números" do site.
                        <strong>Boa sorte! 🍀</strong>
                      </StepDescription>
                    </StepContent>
                  </StepItem>
                </StepsList>
              </HowToPaySection>
            </PaymentSection>

            <OrderSummary>
              <SummaryTitle>
                <i className="fas fa-receipt" />
                Resumo do Pedido
              </SummaryTitle>

              {checkoutData?.foundUser && (
                <UserInfoSection>
                  <UserInfoTitle>
                    Participante
                  </UserInfoTitle>
                  <UserInfoGrid>
                    <UserInfoItem>
                      <i className="fas fa-user" />
                      <strong>{checkoutData.foundUser.name}</strong>
                    </UserInfoItem>
                    <UserInfoItem>
                      <i className="fas fa-envelope" />
                      {checkoutData.foundUser.email}
                    </UserInfoItem>
                    <UserInfoItem>
                      <i className="fas fa-phone" />
                      {checkoutData.foundUser.phone}
                    </UserInfoItem>
                  </UserInfoGrid>
                </UserInfoSection>
              )}

              {campanha && (
                <CampaignInfo>
                  <CampaignInfoHeader>
                    <CampaignImageContainer>
                      {campanha.coverImage ? (
                        <CampaignImage 
                          src={campanha.coverImage} 
                          alt={campanha.title}
                        />
                      ) : (
                        <CampaignImagePlaceholder>
                          <i className="fas fa-image" />
                        </CampaignImagePlaceholder>
                      )}
                    </CampaignImageContainer>
                    
                    <CampaignDetails>
                  <CampaignTitle>{campanha.title}</CampaignTitle>
                  <CampaignMeta>
                        {campanha.description}
                  </CampaignMeta>
                      <CampaignStats>
                        {/* <CampaignStat>
                          <i className="fas fa-ticket-alt" />
                          <strong>R$ {(campanha.individualNumberPrice).toFixed(2)}</strong> /número
                        </CampaignStat>
                        <CampaignStat>
                          <i className="fas fa-users" />
                          <strong>{campanha.stats?.totalParticipants || 0}</strong> participantes
                        </CampaignStat>
                        {campanha.totalNumbers && (
                          <CampaignStat>
                            <i className="fas fa-chart-line" />
                            <strong>{campanha.totalNumbers}</strong> disponíveis
                          </CampaignStat>
                        )} */}
                      </CampaignStats>
                    </CampaignDetails>
                  </CampaignInfoHeader>
                </CampaignInfo>
              )}

              <PurchaseDetails>
                {checkoutData?.campaignSelection.isCombo ? (
                  <>
                    <ComboCard>
                      <ComboHeader>
                        <ComboTitle>
                          🎁 {checkoutData.campaignSelection.name}
                        </ComboTitle>
                        <ComboBadges>
                          <ComboBadge>Combo</ComboBadge>
                        </ComboBadges>
                      </ComboHeader>
                      
                                             <ComboMainInfo>
                         <ComboInfoGrid>
                           <ComboDetailItem>
                             <ComboDetailLabel>Números</ComboDetailLabel>
                             <ComboDetailValue>{checkoutData.campaignSelection.quantity}</ComboDetailValue>
                           </ComboDetailItem>
                           <ComboDetailItem>
                             <ComboDetailLabel>Valor por Número</ComboDetailLabel>
                             <ComboDetailValue>
                               {formatCurrency(checkoutData.campaignSelection.totalPrice! / checkoutData.campaignSelection.quantity)}
                             </ComboDetailValue>
                           </ComboDetailItem>
                         </ComboInfoGrid>
                       </ComboMainInfo>
                      
                                             {(() => {
                         const regularPrice = (checkoutData.campaignSelection.individualNumberPrice || 0) * checkoutData.campaignSelection.quantity;
                         const comboPrice = checkoutData.campaignSelection.totalPrice || 0;
                         const savings = regularPrice - comboPrice;
                         const savingsPercentage = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0;
                         
                         return savings > 0 && (
                           <>
                             <ComboComparison>
                               <ComparisonItem>
                                 <ComparisonLabel>Preço Normal</ComparisonLabel>
                                 <ComparisonValue $strikethrough>
                                   {formatCurrency(regularPrice)}
                                 </ComparisonValue>
                               </ComparisonItem>
                               <ComparisonArrow>→</ComparisonArrow>
                               <ComparisonItem>
                                 <ComparisonLabel>Preço do Combo</ComparisonLabel>
                                 <ComparisonValue>
                                   {formatCurrency(comboPrice)}
                                 </ComparisonValue>
                               </ComparisonItem>
                             </ComboComparison>
                             
                             <ComboSavings>
                               <ComboSavingsText>Você está economizando</ComboSavingsText>
                               <ComboSavingsValue>
                                 {formatCurrency(savings)} ({savingsPercentage}% OFF)
                               </ComboSavingsValue>
                             </ComboSavings>
                           </>
                         );
                       })()}
                       
                       <ComboBenefits>
                         <BenefitsTitle>🎁 Vantagens do Combo</BenefitsTitle>
                         <BenefitsList>
                           <BenefitItem>Preço especial por número</BenefitItem>
                           <BenefitItem>Mais chances de ganhar</BenefitItem>
                           <BenefitItem>Melhor custo-benefício</BenefitItem>
                           {checkoutData.campaignSelection.quantity >= 10 && (
                             <BenefitItem>Desconto exclusivo para combos grandes</BenefitItem>
                           )}
                         </BenefitsList>
                       </ComboBenefits>
                     </ComboCard>
                    
                    <DetailRow>
                      <DetailLabel>🔥 TOTAL A PAGAR</DetailLabel>
                      <TotalValue>
                        {formatCurrency(checkoutData.campaignSelection.totalPrice || 0)}
                      </TotalValue>
                    </DetailRow>
                  </>
                ) : (
                  <RegularDetails>
                    <DetailRow>
                      <DetailLabel>📦 Quantidade de Números</DetailLabel>
                      <DetailValue>{checkoutData?.campaignSelection.quantity || 0}</DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>💰 Valor Unitário</DetailLabel>
                      <DetailValue>
                        {formatCurrency(checkoutData?.campaignSelection.individualNumberPrice || 0)}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>📊 Subtotal</DetailLabel>
                      <DetailValue>
                        {formatCurrency(checkoutData?.campaignSelection.totalPrice || 0)}
                      </DetailValue>
                    </DetailRow>
                    <DetailRow>
                      <DetailLabel>🔥 TOTAL A PAGAR</DetailLabel>
                      <TotalValue>
                        {formatCurrency(checkoutData?.campaignSelection.totalPrice || 0)}
                      </TotalValue>
                    </DetailRow>
                  </RegularDetails>
                )}
              </PurchaseDetails>

              <SupportSection>
                <SupportTitle>💬 Precisa de Ajuda?</SupportTitle>
                <SupportText>
                  Nossa equipe está pronta para ajudar você!
                </SupportText>
                <SupportButton>
                  <i className="fas fa-headset" />
                  Falar com Suporte
                </SupportButton>
              </SupportSection>
              <CertificationSectionCompact />

              <SecurityButtonContainerDesktop>
                <SecurityButton onClick={() => setIsSecurityModalOpen(true)}>
                  <img src="/icons/safe.svg" alt="Seguro" />
                  Ambiente seguro
                </SecurityButton>
              </SecurityButtonContainerDesktop>
            </OrderSummary>
            
          </MainContent>
        </ContentWrapper>
      </CheckoutContainer>
      
      <SecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
      />
      
      {/* Indicador de status da conexão WebSocket (opcional para debug) */}
      <div className="text-xs text-gray-500 mt-4 text-center">
        Status da conexão: {isConnected ? 
          <span className="text-green-500">Conectado</span> : 
          <span className="text-red-500">Desconectado</span>
        }
        {userCode && <span className="ml-2">| Usuário: {userCode}</span>}
      </div>
    </>
  );
}

// Componente principal que envolve o conteúdo com o SocketProvider
export default function CheckoutPage() {
  return (
    <Layout hideHeader={true} hideFooter={true}>
      <SocketProvider>
        <CheckoutContent />
      </SocketProvider>
      
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </Layout>
  );
}