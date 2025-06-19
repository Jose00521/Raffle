'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { 
  FaInfo, 
  FaExclamationTriangle, 
  FaCalendarAlt, 
  FaMoneyBillWave, 
  FaGift, 
  FaListOl, 
  FaCloudUploadAlt, 
  FaTrashAlt,
  FaEdit,
  FaHashtag,
  FaTrophy,
  FaMoneyBill,
  FaPercentage,
  FaRegCalendarAlt,
  FaSearch,
  FaPlusCircle,
  FaPlus,
  FaTimes,
  FaSave,
  FaUpload,
  FaInfoCircle,
  FaCalculator
} from 'react-icons/fa';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import MultipleImageUploader from '../upload/MultipleImageUploader';
import FormInput from '../common/FormInput';
import FormTextArea from '../common/FormTextArea';
import FormDatePicker from '../common/FormDatePicker';
import AdvancedDateTimePicker from '../common/AdvancedDateTimePicker';
import WysiwygEditor from '../common/WysiwygEditor';
import PrizeConfigForm from '../raffle/PrizeConfigForm';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import PrizeSelectorModal from '../prize/PrizeSelectorModal';
import PrizeCreatorModal from '../prize/PrizeCreatorModal';
import CustomDropdown from '../common/CustomDropdown';
import ComboDiscountSectionComponent from './ComboDiscountSection';
import MultiPrizePosition, { PrizeItemProps } from './MultiPrizePosition';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import { Currency } from 'lucide-react';
import CurrencyInput from '../common/CurrencyInput';
import PrizeIntelligentSummaryComponent from './PrizeIntelligentSummary';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { useSession } from 'next-auth/react';
import { formatCurrency } from '@/utils/formatNumber';

// Prize category interface
interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
  individualPrizes?: IndividualPrize[];
}

// Interface para IndividualPrize (híbrida para money e item)
interface IndividualPrize {
  id?: string;
  type: 'money' | 'item';
  quantity: number;
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
  category?: string;
}

// Prize categories configuration interface
interface PrizeCategoriesConfig {
  diamante: PrizeCategory;
  master: PrizeCategory;
  premiado: PrizeCategory;
}

// Interface para InstantPrize
interface InstantPrize {
  id?: string;
  categoryId?: string;
  number: string;
  value: number;
  claimed?: boolean;
  type?: 'money' | 'item';
  prizeId?: string;
  name?: string;
  image?: string;
}

// Form data interface for update - exactly the same as RaffleFormData
export type RaffleFormUpdateData = {
  title: string;
  description: string;
  individualNumberPrice: number;
  totalNumbers: number;
  drawDate: string;
  minNumbersPerUser: number;
  maxNumbersPerUser?: number;
  status: string;
  canceled: boolean;
  isScheduled: boolean;
  scheduledActivationDate?: string;
  winnerPositions: number;
  prizeDistribution: Array<{
    position: number, 
    prizes: Array<{
      prizeId?: string, 
      name: string, 
      value: string, 
      image?: string | File
    }>,
    description?: string
  }>;
  winners: Array<string>;
  enablePackages: boolean;
  numberPackages: Array<{
    name: string,
    description?: string,
    quantity: number,
    price: number,
    discount: number,
    isActive: boolean,
    highlight: boolean,
    order: number,
    maxPerUser?: number
  }>;
  instantPrizes: InstantPrize[];
  prizeCategories?: PrizeCategoriesConfig;
  regulation: string;
  returnExpected: string;
  coverImage?: File | string;
  images: File[];
  mainPrize?: string;
  valuePrize?: string;
};

interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;
  number?: string;
  value: number;
  prizeId?: string;
  name?: string;
  image?: string;
}

interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

// Interface for tracking changes - each field will be compared
interface FieldChanges {
  [key: string]: {
    original: any;
    current: any;
    hasChanged: boolean;
  };
}

// Props interface for update component
interface RaffleFormFieldsUpdateProps {
  initialData: Partial<RaffleFormUpdateData>; // Initial campaign data
  onSubmit: (changes: {
    campaignId: string;
    updatedFields: Partial<ICampaign>;
    instantPrizesChanges?: InstantPrizesPayload;
    fieldsChanged: string[];
  }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  campaignId: string; // Required for updates
}

// Enhanced schema for updates - same validation rules
const raffleUpdateFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  individualNumberPrice: z.number().min(0.01, 'O preço deve ser maior que zero'),
  totalNumbers: z.number().min(1, 'O número de bilhetes deve ser maior que zero'),
  drawDate: z.string().min(1, 'A data do sorteio é obrigatória'),
  coverImage: z.any().optional(), // Optional for updates
  images: z.array(z.any()),
  regulation: z.string().min(1, 'A regra é obrigatória'),
  status: z.string().optional().default('ACTIVE'),
  canceled: z.boolean().optional().default(false),
  minNumbersPerUser: z.number().min(1, 'Pelo menos um número é obrigatório'),
  maxNumbersPerUser: z.number().min(1, 'Pelo menos um número é obrigatório').optional(),
  returnExpected: z.string().optional(),
  isScheduled: z.boolean(),
  scheduledActivationDate: z.string().optional(),
  prizeCategories: z.any().optional(),
  instantPrizes: z.array(z.any()),
  winnerPositions: z.number().min(1, 'Pelo menos um vencedor é necessário').max(5, 'Máximo de 5 vencedores permitidos'),
  prizeDistribution: z.array(
    z.object({
      position: z.number(),
      prizes: z.array(
        z.object({
          prizeId: z.string().optional(),
          name: z.string(),
          value: z.string(),
          image: z.string().optional()
        })
      ).min(1, 'Pelo menos um prêmio é necessário por posição'),
      description: z.string().optional()
    })
  ).min(1, 'Pelo menos um prêmio é necessário'),
  enablePackages: z.boolean().optional().default(false),
  numberPackages: z.array(
    z.object({
      name: z.string(),
      description: z.string().optional(),
      quantity: z.number().min(2, 'Quantidade mínima de 2 números'),
      price: z.number().min(1, 'Preço mínimo de 1 real'),
      discount: z.number().min(1, 'Desconto mínimo de 1%').max(50, 'Desconto máximo de 50%'),
      isActive: z.boolean().optional().default(true),
      highlight: z.boolean().optional().default(false),
      order: z.number().min(1, 'Ordem mínima de 1'),
      maxPerUser: z.number().min(1, 'Máximo de 1 usuário por pacote').optional()
    })
  ).optional().default([]),
  winners: z.array(z.string()).optional().default([])
}).superRefine((data, ctx) => {
  // Same validation rules as original form
  if (data.isScheduled) {
    if (!data.scheduledActivationDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'A data de agendamento é obrigatória quando o agendamento está ativado',
        path: ['scheduledActivationDate']
      });
    } else {
      const scheduledDate = new Date(data.scheduledActivationDate);
      const now = new Date();
      
      if (scheduledDate <= now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'A data de agendamento deve ser no futuro',
          path: ['scheduledActivationDate']
        });
      }
    }
  }
  
  if (data.maxNumbersPerUser && data.minNumbersPerUser && data.maxNumbersPerUser < data.minNumbersPerUser) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Deve ser maior que o mínimo',
      path: ['maxNumbersPerUser']
    });
  }

  if (data.maxNumbersPerUser && data.minNumbersPerUser && data.maxNumbersPerUser < data.minNumbersPerUser) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Deve ser menor que o máximo',
      path: ['minNumbersPerUser']
    });
  }
  
  const principalPrizePosition = data.prizeDistribution.find(p => p.position === 1);
  if (!principalPrizePosition || !principalPrizePosition.prizes || principalPrizePosition.prizes.length === 0 || 
      !principalPrizePosition.prizes.some(prize => prize.name && prize.name.trim() !== '')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'É necessário configurar pelo menos um prêmio principal',
      path: ['prizeDistribution']
    });
  }
}) as z.ZodType<RaffleFormUpdateData>; 

// Styled components - copied exactly from RaffleFormFields.tsx
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
  width: 100%;
  background-color: transparent !important;

  .agendamento {
    overflow: visible !important;

    &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: transparent;
    opacity: 0.8;
  }
  }
  
  @media (max-width: 768px) {
    gap: 36px;
  }
  
  @media (max-width: 480px) {
    gap: 32px;
  }
`;

const FormSection = styled.section`
  background-color: white;
  border-radius: 16px;
  padding: 36px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${({ theme }) => theme.colors?.gradients?.purple || 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)'};
    opacity: 0.8;
  }
  
  &:hover {
    box-shadow: 0 6px 30px rgba(0, 0, 0, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 28px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 24px;
    border-radius: 12px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 32px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 2px solid rgba(0, 0, 0, 0.06);
  padding-bottom: 18px;
  position: relative;
  
  svg {
    color: ${props => props.theme.colors?.primary || '#6a11cb'};
    font-size: 1.4rem;
  }
  
  &:after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 80px;
    height: 2px;
    background: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 26px;
    padding-bottom: 16px;
    
    svg {
      font-size: 1.3rem;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 22px;
    padding-bottom: 14px;
    
    svg {
      font-size: 1.2rem;
    }
  }
`;

const SubSectionDivider = styled.div`
  margin: 32px 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    rgba(106, 17, 203, 0.1) 0%,
    rgba(106, 17, 203, 0.2) 50%,
    rgba(106, 17, 203, 0.1) 100%
  );
`;

const FormRow = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 28px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const HelpText = styled.p`
  margin: 10px 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-style: italic;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.85rem;
  margin: 6px 0 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  padding: 16px 20px;
  border-radius: 10px;
  background-color: rgba(106, 17, 203, 0.02);
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
    padding: 14px 16px;
  }
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + span {
      background-color: #6a11cb;
    }
    
    &:checked + span:before {
      transform: translateX(24px);
    }
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ToggleLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

// Additional styled components for prize section
const PrizeSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.08) 0%, rgba(37, 117, 252, 0.08) 100%);
  border-radius: 12px;
  padding: 16px 20px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const PrizeSectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${props => props.theme.colors?.primary || '#6a11cb'};
    font-size: 1.4rem;
  }
`;

const WinnerInfoText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
    font-size: 1rem;
  }
`;

const WinnerDropdownContainer = styled.div`
  width: 180px;
`;

const TotalPrizeDisplay = styled.div`
  margin: 0 0 20px 0;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid rgba(106, 17, 203, 0.1);
  box-shadow: 0 6px 20px rgba(106, 17, 203, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(106, 17, 203, 0.15);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const PrizeAmountValue = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-size: 0.9rem;
    font-weight: 600;
    color: #666;
  }
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const PrizeCountBadge = styled.div`
  background: rgba(106, 17, 203, 0.1);
  color: #6a11cb;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 1.1rem;
  }
`;

const PrizeListContainer = styled.div`
  margin: 24px 0;
`;

// Components for disabled sections and requirement alerts
const DisabledSection = styled.div<{ $disabled: boolean }>`
  position: relative;
  pointer-events: ${({ $disabled }) => $disabled ? 'none' : 'auto'};
  opacity: ${({ $disabled }) => $disabled ? '0.6' : '1'};
  filter: ${({ $disabled }) => $disabled ? 'grayscale(0.3)' : 'none'};
  transition: all 0.3s ease;
  
  ${({ $disabled }) => $disabled && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.7);
      z-index: 5;
      border-radius: 16px;
    }
  `}
`;

const RequirementAlert = styled.div<{ $type: 'warning' | 'info' | 'error' }>`
  background: ${({ $type }) => {
    switch ($type) {
      case 'warning': return 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)';
      case 'error': return 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)';
      default: return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)';
    }
  }};
  border: 1px solid ${({ $type }) => {
    switch ($type) {
      case 'warning': return 'rgba(245, 158, 11, 0.3)';
      case 'error': return 'rgba(239, 68, 68, 0.3)';
      default: return 'rgba(59, 130, 246, 0.3)';
    }
  }};
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  z-index: 10;
  
  svg {
    color: ${({ $type }) => {
      switch ($type) {
        case 'warning': return '#f59e0b';
        case 'error': return '#ef4444';
        default: return '#3b82f6';
      }
    }};
    font-size: 1.2rem;
    margin-top: 2px;
    flex-shrink: 0;
  }
  
  div {
    flex: 1;
    
    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: ${({ $type }) => {
        switch ($type) {
          case 'warning': return '#f59e0b';
          case 'error': return '#ef4444';
          default: return '#3b82f6';
        }
      }};
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
      margin: 0;
      line-height: 1.5;
    }
    
    ul {
      margin: 8px 0 0 0;
      padding-left: 16px;
      
      li {
        font-size: 0.85rem;
        color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
        margin-bottom: 4px;
        
        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
`;

const UnlockMessage = styled.div`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #22c55e;
    font-size: 1.2rem;
  }
  
  div {
    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #22c55e;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.85rem;
      color: #666;
      margin: 0;
    }
  }
`;

const InfoAlert = styled.div`
  background-color: rgba(37, 117, 252, 0.1);
  border-left: 4px solid #2575fc;
  border-radius: 6px;
  padding: 12px 16px;
  margin: 16px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  
  svg {
    color: #2575fc;
    font-size: 1.2rem;
    margin-top: 2px;
  }
  
  div {
    flex: 1;
    
    h5 {
      font-size: 0.95rem;
      font-weight: 600;
      color: #2575fc;
      margin: 0 0 4px 0;
    }
    
    p {
      font-size: 0.85rem;
      color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
      margin: 0;
      line-height: 1.5;
    }
  }
`;

const CalculationDisplay = styled.div`
  background-color: rgba(106, 17, 203, 0.05);
  border-radius: 8px;
  padding: 12px 16px;
  margin: 8px 0 16px;
  
  h5 {
    font-size: 0.9rem;
    font-weight: 600;
    color: #6a11cb;
    margin: 0 0 8px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      font-size: 1rem;
    }
  }
  
  .calculation {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 8px;
    
    .formula-item {
      background: white;
      border: 1px solid rgba(106, 17, 203, 0.2);
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 600;
      min-width: 80px;
      text-align: center;
    }
    
    .operator {
      font-size: 1.2rem;
      font-weight: 700;
      color: #6a11cb;
    }
    
    .result {
      background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
      color: white;
      border-radius: 6px;
      padding: 8px 12px;
      font-weight: 700;
      min-width: 80px;
      text-align: center;
    }
  }
  
  .explanation {
    font-size: 0.8rem;
    color: #666;
    text-align: center;
    margin-top: 8px;
  }
`;

const ValueRangeDisplay = styled.div`
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.05) 0%, rgba(22, 163, 74, 0.05) 100%);
  border: 1px solid rgba(34, 197, 94, 0.2);
  border-radius: 12px;
  padding: 16px 20px;
  margin: 16px 0;
  
  h5 {
    font-size: 0.95rem;
    font-weight: 600;
    color: #22c55e;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      font-size: 1rem;
    }
  }
  
  .value-range-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 12px;
  }
  
  .value-item {
    background: white;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    
    &.min {
      border-left: 4px solid #22c55e;
      
      .value-label {
        color: #22c55e;
      }
    }
    
    &.max {
      border-left: 4px solid #3b82f6;
      
      .value-label {
        color: #3b82f6;
      }
    }
    
    &.unlimited {
      border-left: 4px solid #f59e0b;
      
      .value-label {
        color: #f59e0b;
      }
      
      .value-amount {
        color: #f59e0b;
      }
    }
  }
  
  .value-label {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }
  
  .value-amount {
    font-size: 1.4rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 4px;
  }
  
  .value-description {
    font-size: 0.8rem;
    color: #6b7280;
    font-weight: 500;
  }
  
  .value-explanation {
    font-size: 0.85rem;
    color: #6b7280;
    text-align: center;
    font-style: italic;
  }
  
  @media (max-width: 640px) {
    .value-range-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .value-item {
      padding: 12px;
    }
    
    .value-amount {
      font-size: 1.2rem;
    }
  }
`;

// Change indicator styled component
const ChangeIndicator = styled.div<{ $hasChanges: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $hasChanges }) => $hasChanges ? '#22c55e' : 'transparent'};
  opacity: ${({ $hasChanges }) => $hasChanges ? '1' : '0'};
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: white;
  }
`;

const UpdateIndicator = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  
  svg {
    font-size: 1rem;
  }
`;

// Button styles for form actions
const FormActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 40px;
  padding: 20px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  min-width: 120px;
  
  background: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
      case 'danger': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return '#f3f4f6';
    }
  }};
  
  color: ${({ $variant }) => {
    switch ($variant) {
      case 'primary': 
      case 'danger': return 'white';
      default: return '#374151';
    }
  }};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${({ $variant }) => {
      switch ($variant) {
        case 'primary': return 'rgba(106, 17, 203, 0.2)';
        case 'danger': return 'rgba(239, 68, 68, 0.2)';
        default: return 'rgba(0, 0, 0, 0.1)';
      }
    }};
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  
  svg {
    font-size: 1.1rem;
  }
`;

// Summary of changes component
const ChangesSummary = styled.div`
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  
  h4 {
    font-size: 1rem;
    font-weight: 600;
    color: #3b82f6;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .changes-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .change-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    border: 1px solid rgba(59, 130, 246, 0.1);
    
    .field-name {
      font-weight: 600;
      color: #1f2937;
      min-width: 120px;
    }
    
    .change-values {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
      
      .old-value {
        color: #ef4444;
        text-decoration: line-through;
      }
      
      .arrow {
        color: #6b7280;
      }
      
      .new-value {
        color: #22c55e;
        font-weight: 600;
      }
    }
  }
`;

// Utility function to detect changes between objects
const detectChanges = (original: any, current: any, path: string = ''): FieldChanges => {
  const changes: FieldChanges = {};
  
  // Handle arrays
  if (Array.isArray(original) && Array.isArray(current)) {
    if (JSON.stringify(original) !== JSON.stringify(current)) {
      changes[path] = {
        original: original,
        current: current,
        hasChanged: true
      };
    }
    return changes;
  }
  
  // Handle objects
  if (typeof original === 'object' && original !== null && typeof current === 'object' && current !== null) {
    const allKeys = new Set([...Object.keys(original), ...Object.keys(current)]);
    
    for (const key of allKeys) {
      const currentPath = path ? `${path}.${key}` : key;
      const originalValue = original[key];
      const currentValue = current[key];
      
      if (typeof originalValue === 'object' && originalValue !== null && 
          typeof currentValue === 'object' && currentValue !== null) {
        Object.assign(changes, detectChanges(originalValue, currentValue, currentPath));
      } else if (originalValue !== currentValue) {
        changes[currentPath] = {
          original: originalValue,
          current: currentValue,
          hasChanged: true
        };
      }
    }
    
    return changes;
  }
  
  // Handle primitive values
  if (original !== current) {
    changes[path] = {
      original: original,
      current: current,
      hasChanged: true
    };
  }
  
  return changes;
};

const RaffleFormFieldsUpdate: React.FC<RaffleFormFieldsUpdateProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  campaignId
}) => {
  console.log('🔄 RaffleFormFieldsUpdate - Dados iniciais recebidos:', initialData);
  
  const session = useSession();
  
  // Preparar dados padrão para o formulário - memoizado com JSON.stringify para comparação profunda
  const defaultValues = useMemo(() => {
    const defaults = {
      title: initialData.title || '',
      description: initialData.description || '',
      individualNumberPrice: initialData.individualNumberPrice || 0,
      totalNumbers: initialData.totalNumbers || 100,
      drawDate: initialData.drawDate || '',
      status: initialData.status || 'ACTIVE',
      canceled: initialData.canceled || false,
      isScheduled: initialData.isScheduled || false,
      scheduledActivationDate: initialData.scheduledActivationDate || '',
      winnerPositions: initialData.winnerPositions || 1,
      prizeDistribution: initialData.prizeDistribution || [
        {
          position: 1,
          prizes: [
            {
              name: initialData.mainPrize || '',
              value: initialData.valuePrize || '',
              image: ''
            }
          ]
        }
      ],
      winners: initialData.winners || [],
      enablePackages: initialData.enablePackages || false,
      numberPackages: initialData.numberPackages || [],
      instantPrizes: initialData.instantPrizes || [],
      prizeCategories: initialData.prizeCategories || {
        diamante: { active: false, quantity: 10, value: 2000 },
        master: { active: false, quantity: 20, value: 1000 },
        premiado: { active: false, quantity: 50, value: 500 }
      },
      regulation: initialData.regulation || '',
      returnExpected: initialData.returnExpected || '',
      minNumbersPerUser: initialData.minNumbersPerUser || 1,
      maxNumbersPerUser: initialData.maxNumbersPerUser || undefined,
      images: initialData.images || [],
      coverImage: initialData.coverImage || (initialData.images && initialData.images.length > 0 ? initialData.images[0] : undefined),
      mainPrize: initialData.mainPrize || '',
      valuePrize: initialData.valuePrize || ''
    } as RaffleFormUpdateData;
    
    console.log('📋 Valores padrão preparados:', defaults);
    return defaults;
  }, [JSON.stringify(initialData)]); // Comparação por string para mudanças profundas

  // Configurar React Hook Form
  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors }, 
    trigger,
    getValues,
    reset
  } = useForm<RaffleFormUpdateData>({
    defaultValues,
    mode: 'all',
    shouldFocusError: true,
    resolver: zodResolver(raffleUpdateFormSchema)
  });

  // Estados para controle de prêmios
  const [showPrizeSelector, setShowPrizeSelector] = useState(false);
  const [showNewPrizeModal, setShowNewPrizeModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<IPrize | null>(null);
  const [availablePrizes, setAvailablePrizes] = useState<IPrize[]>([]);
  const [totalPrizeValue, setTotalPrizeValue] = useState<number>(0);
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  
  // Estados para detecção de mudanças
  const [originalData, setOriginalData] = useState<RaffleFormUpdateData>(defaultValues);
  const [hasChanges, setHasChanges] = useState(false);
  const [changedFields, setChangedFields] = useState<string[]>([]);
  const [fieldChanges, setFieldChanges] = useState<FieldChanges>({});

  // Observar campos do formulário
  const watchedFields = watch();
  const totalNumbers = watch('totalNumbers');
  const isScheduled = watch('isScheduled');
  const prizeCategories = watch('prizeCategories');
  const price = watch('individualNumberPrice');
  const returnExpected = watch('returnExpected');
  const minNumbers = watch('minNumbersPerUser');
  const maxNumbers = watch('maxNumbersPerUser');
  const winnerCount = watch('winnerPositions');
  const prizes = watch('prizeDistribution');
  const instantPrizes = watch('instantPrizes') || [];

  // 🔒 VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS PARA FUNCIONALIDADES AVANÇADAS
  const hasBasicRequirements = useMemo(() => {
    return totalNumbers > 0 && price > 0 && returnExpected && returnExpected.trim() !== '';
  }, [totalNumbers, price, returnExpected]);

  const basicRequirementsMessage = useMemo(() => {
    if (!price || price <= 0) {
      return "Defina o preço por número primeiro";
    }
    if (!returnExpected || returnExpected.trim() === '') {
      return "Defina o retorno esperado primeiro";
    }
    if (!totalNumbers || totalNumbers <= 0) {
      return "Aguarde o cálculo automático do total de números";
    }
    return "";
  }, [totalNumbers, price, returnExpected]);

  // Funções utilitárias memoizadas
  const extractNumericValue = useCallback((valueString: string): number => {
    try {
      const cleanString = valueString.replace(/[^\d,.]/g, '');
      const normalizedString = cleanString.replace(/,/g, '.');
      const value = parseFloat(normalizedString);
      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error("Erro ao extrair valor numérico:", error);
      return 0;
    }
  }, []);

  const formatPrizeValue = useCallback((value: string | number): string => {
    if (!value) return 'R$ 0,00';
    
    const valueString = typeof value === 'number' ? value.toString() : value;
    
    if (valueString.includes('R$')) {
      return valueString;
    }
    
    const numericValue = extractNumericValue(valueString);
    
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numericValue);
  }, [extractNumericValue]);

  // Handlers para Prize Selector - Memoizados para evitar re-criação
  const openPrizeSelector = useCallback(() => {
    setShowPrizeSelector(true);
  }, []);
  
  const closePrizeSelector = useCallback(() => {
    setShowPrizeSelector(false);
  }, []);
  
  const openNewPrizeModal = useCallback(() => {
    setShowNewPrizeModal(true);
  }, []);
  
  const closeNewPrizeModal = useCallback(() => {
    setShowNewPrizeModal(false);
  }, []);
  
  const handleSelectPrize = useCallback((prize: IPrize) => {
    console.log('Prêmio selecionado (principal):', prize);
    setSelectedPrize(prize);
    setShowPrizeSelector(false);
  }, []);

  // Estados para handlers dinâmicos de prêmios - Inicialização simples
  const [currentPrizeSelectHandler, setCurrentPrizeSelectHandler] = useState<(prize: IPrize) => void>(handleSelectPrize);
  const [currentCloseHandler, setCurrentCloseHandler] = useState<() => void>(closePrizeSelector);

  // Carregar prêmios disponíveis
  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const prizes = await creatorPrizeAPIClient.getAllPrizes();
        setAvailablePrizes(prizes.data);
        console.log('🎁 Prêmios carregados:', prizes.data.length);
      } catch (error) {
        console.error('Erro ao carregar prêmios:', error);
      }
    };
    fetchPrizes();
  }, []);

  // Função para calcular o valor total dos prêmios
  const calculateTotalPrizeValue = useCallback((prizesList: any[]) => {
    if (prizesList && prizesList.length > 0) {
      const total = prizesList.reduce((sum: number, positionObj) => {
        if (!positionObj.prizes || positionObj.prizes.length === 0) return sum;
        
        const positionTotal = positionObj.prizes.reduce((prizeSum, prize) => {
          if (!prize.name || !prize.value) return prizeSum;
          let prizeValue = parseFloat(prize.value);
          return prizeSum + (isNaN(prizeValue) ? 0 : prizeValue);
        }, 0);
        
        return sum + positionTotal;
      }, 0);
      
      return total;
    }
    return 0;
  }, []);
  
  // Efeito para calcular o valor total dos prêmios
  useEffect(() => {
    // Usar setTimeout para evitar loops infinitos
    const timer = setTimeout(() => {
      const total = calculateTotalPrizeValue(prizes);
      setTotalPrizeValue(total);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [prizes, calculateTotalPrizeValue]);

  // Usar ref para armazenar os dados originais e evitar loops
  const originalDataRef = useRef(originalData);
  
  // Atualizar a ref quando originalData mudar
  useEffect(() => {
    originalDataRef.current = originalData;
  }, [originalData]);
  
  // Função para detectar mudanças - chamada manualmente
  const detectFormChanges = useCallback(() => {
    if (Object.keys(originalDataRef.current).length === 0) return; // Aguardar inicialização
    
    const currentData = getValues();
    
    // Detectar mudanças usando a função utilitária
    const changes = detectChanges(originalDataRef.current, currentData);
    const changedFieldNames = Object.keys(changes).filter(key => changes[key].hasChanged);
    
    setFieldChanges(changes);
    setChangedFields(changedFieldNames);
    setHasChanges(changedFieldNames.length > 0);
  }, [getValues]);
  
  // Efeito para detectar mudanças apenas quando os campos observados mudarem
  useEffect(() => {
    // Usar setTimeout para evitar loops infinitos
    const timer = setTimeout(() => {
      detectFormChanges();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [watchedFields, detectFormChanges]);

  // Ref para controlar se já inicializamos
  const initializedRef = useRef(false);
  
  // Inicializar dados originais apenas uma vez
  useEffect(() => {
    if (!initializedRef.current && Object.keys(defaultValues).length > 0) {
      console.log('🏁 Inicializando dados originais:', defaultValues);
      setOriginalData(defaultValues);
      reset(defaultValues);
      initializedRef.current = true;
    }
  }, [defaultValues, reset]); // Dependências controladas com a ref
  
  const handlePrizeCreated = (prize: IPrize) => {
    setAvailablePrizes(prev => [prize, ...prev]);
    setSelectedPrize(prize);
    closeNewPrizeModal();
  };
  
  const handleClearSelectedPrize = () => {
    setSelectedPrize(null);
    setValue('mainPrize', '');
    setValue('valuePrize', '');
  };

  // Handlers para prêmios por posição
  const handleAddPrizeToPosition = (position: number) => {
    const onSelectForPosition = (prize: IPrize) => {
      console.log('Selecionando prêmio completo:', prize);
      
      const prizeIdentifier = prize.prizeCode;
      const currentPrizes = [...prizes];
      const positionIndex = currentPrizes.findIndex(p => p.position === position);
      
      if (positionIndex >= 0) {
        currentPrizes[positionIndex].prizes.push({
          prizeId: prizeIdentifier,
          name: prize.name,
          value: prize.value,
          image: prize.image
        });
      } else {
        currentPrizes.push({
          position,
          prizes: [{
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          }]
        });
      }
      
      setValue('prizeDistribution', currentPrizes);
      setShowPrizeSelector(false);
    };
    
    setCurrentPrizeSelectHandler(() => onSelectForPosition);
    setCurrentCloseHandler(() => {
      return () => {
        setCurrentPrizeSelectHandler(() => handleSelectPrize);
        setCurrentCloseHandler(() => closePrizeSelector);
        closePrizeSelector();
      };
    });
    
    setShowPrizeSelector(true);
  };
  
  const handleRemovePrizeFromPosition = (position: number, prizeIndex: number) => {
    const currentPrizes = [...prizes];
    const positionIndex = currentPrizes.findIndex(p => p.position === position);
    
    if (positionIndex >= 0) {
      currentPrizes[positionIndex].prizes.splice(prizeIndex, 1);
      
      if (currentPrizes[positionIndex].prizes.length === 0 && position > 1) {
        currentPrizes.splice(positionIndex, 1);
      } else if (currentPrizes[positionIndex].prizes.length === 0) {
        currentPrizes[positionIndex].prizes = [{
          name: '',
          value: '',
          image: ''
        }];
      }
      
      setValue('prizeDistribution', currentPrizes);
    }
  };

  const handleSelectPrizeForPosition = (position: number) => {
    console.log('handleSelectPrizeForPosition - availablePrizes:', availablePrizes);
    
    const onSelectForPosition = (prize: IPrize) => {
      console.log('Prêmio selecionado completo:', prize);
      
      const prizeIdentifier = prize.prizeCode || prize._id?.toString() || '';
      const updatedPrizes = [...prizes];
      const positionIndex = updatedPrizes.findIndex(p => p.position === position);
      
      if (positionIndex >= 0) {
        if (updatedPrizes[positionIndex].prizes.length > 0) {
          updatedPrizes[positionIndex].prizes[0] = {
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          };
        } else {
          updatedPrizes[positionIndex].prizes.push({
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          });
        }
      } else {
        updatedPrizes.push({
          position,
          prizes: [{
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          }]
        });
        
        updatedPrizes.sort((a, b) => a.position - b.position);
      }
      
      setValue('prizeDistribution', updatedPrizes);
      
      if (position === 1) {
        setSelectedPrize(prize);
        setValue('mainPrize', prize.name);
        setValue('valuePrize', prize.value);
      }
      
      setShowPrizeSelector(false);
    };
    
    setCurrentPrizeSelectHandler(() => onSelectForPosition);
    setCurrentCloseHandler(() => {
      return () => {
        setCurrentPrizeSelectHandler(() => handleSelectPrize);
        setCurrentCloseHandler(() => closePrizeSelector);
        closePrizeSelector();
      };
    });
    
    setShowPrizeSelector(true);
  };

  // Handler para alteração do número de vencedores
  const handleWinnerCountChange = (value: string) => {
    setValue('winnerPositions', parseInt(value));
  };

  // Função para atualizar a lista de prêmios quando o número de vencedores muda
  const updatePrizePositions = useCallback(() => {
    const currentPrizes = getValues('prizeDistribution') || [];
    const currentPositions = currentPrizes.map(p => p.position);
    const currentWinnerCount = getValues('winnerPositions');
    
    // Criar novas posições necessárias
    const updatedPrizes = [...currentPrizes];
    
    for (let i = 1; i <= currentWinnerCount; i++) {
      if (!currentPositions.includes(i)) {
        updatedPrizes.push({
          position: i,
          prizes: [{
            name: '',
            value: '',
            image: ''
          }]
        });
      }
    }
    
    // Filtrar posições que excedem o número de vencedores
    const filteredPrizes = updatedPrizes.filter(p => p.position <= currentWinnerCount);
    filteredPrizes.sort((a, b) => a.position - b.position);
    
    setValue('prizeDistribution', filteredPrizes);
  }, [getValues, setValue]);
  
  // Efeito para atualizar prêmios quando o número de vencedores muda
  useEffect(() => {
    // Usar setTimeout para evitar loops infinitos
    const timer = setTimeout(() => {
      updatePrizePositions();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [winnerCount, updatePrizePositions]);

  // Handler para mudança da imagem de capa
  const handleCoverImageChange = (index: number) => {
    console.log('Cover image changed to index:', index);
    setCoverImageIndex(index);
    
    const currentImages = getValues('images');
    
    if (currentImages && currentImages.length > 0 && index >= 0 && index < currentImages.length) {
      setValue('coverImage', currentImages[index]);
    }
  };

  // Efeito para inicializar coverImage se não estiver definida - executado apenas uma vez
  useEffect(() => {
    const images = getValues('images') || [];
    const coverImage = getValues('coverImage');
    
    if (images.length > 0 && !coverImage) {
      setValue('coverImage', images[0]);
      setCoverImageIndex(0);
    }
  }, []); // Executado apenas uma vez na montagem

  // Preparar dados para envio - função adaptada do original
  const prepareUpdateDataForApi = (data: RaffleFormUpdateData, changes: FieldChanges): any => {
    const updatedFields: any = {};
    const fieldsChanged: string[] = [];
    
    // Processar apenas os campos que mudaram
    Object.keys(changes).forEach(fieldPath => {
      if (changes[fieldPath].hasChanged) {
        const pathParts = fieldPath.split('.');
        const topLevelField = pathParts[0];
        
        // Adicionar o campo de nível superior aos campos alterados
        if (!fieldsChanged.includes(topLevelField)) {
          fieldsChanged.push(topLevelField);
        }
        
        // Mapear para a estrutura da API
        switch (topLevelField) {
          case 'title':
          case 'description':
          case 'regulation':
          case 'returnExpected':
          case 'status':
          case 'canceled':
          case 'isScheduled':
          case 'minNumbersPerUser':
          case 'maxNumbersPerUser':
          case 'winnerPositions':
            updatedFields[topLevelField] = data[topLevelField as keyof RaffleFormUpdateData];
            break;
            
          case 'individualNumberPrice':
            updatedFields.individualNumberPrice = data.individualNumberPrice;
            break;
            
          case 'totalNumbers':
            updatedFields.totalNumbers = data.totalNumbers;
            break;
            
          case 'drawDate':
            updatedFields.drawDate = new Date(data.drawDate);
            break;
            
          case 'scheduledActivationDate':
            updatedFields.scheduledActivationDate = data.isScheduled && data.scheduledActivationDate 
              ? new Date(data.scheduledActivationDate) 
              : null;
            break;
            
          case 'prizeDistribution':
            updatedFields.prizeDistribution = data.prizeDistribution.map(positionData => ({
              position: positionData.position,
              prizes: positionData.prizes
                .filter(prize => prize.name)
                .map(prize => prize.prizeId),
              description: positionData.description || 
                `${positionData.position === 1 ? 'Prêmio principal' : `${positionData.position}º lugar`}: ${
                  positionData.prizes.length > 1 
                    ? `${positionData.prizes.length} prêmios` 
                    : positionData.prizes[0]?.name || 'Não especificado'
                }`
            }));
            break;
            
          case 'enablePackages':
          case 'numberPackages':
            if (!updatedFields.numberPackages) {
              updatedFields.numberPackages = data.enablePackages ? data.numberPackages.map(pkg => {
                const originalPrice = data.individualNumberPrice * pkg.quantity;
                const discountedPrice = originalPrice * (1 - pkg.discount / 100);
                
                return {
                  name: pkg.name,
                  description: pkg.description || `Pacote com ${pkg.quantity} números`,
                  quantity: pkg.quantity,
                  price: Number(discountedPrice.toFixed(2)),
                  discount: pkg.discount,
                  isActive: pkg.isActive !== undefined ? pkg.isActive : true,
                  highlight: pkg.highlight || false,
                  order: pkg.order || 1,
                  maxPerUser: pkg.maxPerUser
                };
              }) : [];
            }
            break;
            
          case 'coverImage':
          case 'images':
            if (!updatedFields.coverImage && data.coverImage) {
              updatedFields.coverImage = data.coverImage;
            }
            if (!updatedFields.images) {
              updatedFields.images = data.images.filter(img => img !== data.coverImage);
            }
            break;
            
          case 'instantPrizes':
          case 'prizeCategories':
            // Lógica para prêmios instantâneos será tratada separadamente
            break;
        }
      }
    });

    // Preparar instant prizes se mudaram
    let instantPrizesChanges = undefined;
    if (fieldsChanged.includes('instantPrizes') || fieldsChanged.includes('prizeCategories')) {
      instantPrizesChanges = {
        prizes: [] as Array<{
          type: 'money' | 'item';
          categoryId: string;
          quantity?: number;
          number?: string;
          value: number;
          prizeId?: string;
          name?: string;
          image?: string;
        }>
      };

      // Processar categorias de prêmios se existir
      if (data.prizeCategories) {
        Object.entries(data.prizeCategories).forEach(([categoryKey, category]) => {
          if (category.active && category.quantity > 0 && category.value > 0) {
            const individualPrizes = category.individualPrizes || [];
            
            if (individualPrizes.length === 0) {
              instantPrizesChanges!.prizes.push({
                type: 'money',
                categoryId: categoryKey,
                quantity: category.quantity,
                value: category.value
              });
            } else {
              individualPrizes.forEach((individualPrize: IndividualPrize) => {
                if (individualPrize.type === 'money') {
                  instantPrizesChanges!.prizes.push({
                    type: 'money',
                    categoryId: categoryKey,
                    quantity: individualPrize.quantity,
                    value: individualPrize.value
                  });
                } else if (individualPrize.type === 'item') {
                  for (let i = 0; i < individualPrize.quantity; i++) {
                    instantPrizesChanges!.prizes.push({
                      type: 'item',
                      categoryId: categoryKey,
                      prizeId: individualPrize.prizeId,
                      value: individualPrize.value
                    });
                  }
                }
              });
            }
          }
        });
      }
    }

    console.log('✅ Dados de atualização preparados:', {
      updatedFields,
      fieldsChanged,
      instantPrizesChanges
    });

    return {
      campaignId,
      updatedFields,
      instantPrizesChanges,
      fieldsChanged
    };
  };

  // Handler para envio do formulário
  const onFormSubmit = (data: RaffleFormUpdateData) => {
    console.log('📝 Enviando atualizações:', {
      data,
      hasChanges,
      changedFields,
      fieldChanges
    });

    if (!hasChanges) {
      console.log('⚠️ Nenhuma mudança detectada, cancelando envio');
      return;
    }

    const updateData = prepareUpdateDataForApi(data, fieldChanges);
    onSubmit(updateData);
  };

  // Resetar para valores originais
  const handleReset = () => {
    console.log('🔄 Resetando formulário para valores originais');
    reset(originalData);
    setFieldChanges({});
    setChangedFields([]);
    setHasChanges(false);
  };

  // Opções para dropdown de vencedores
  const winnerOptions = [
    { value: '1', label: '1 vencedor' },
    { value: '2', label: '2 vencedores' },
    { value: '3', label: '3 vencedores' },
    { value: '4', label: '4 vencedores' },
    { value: '5', label: '5 vencedores' }
  ];

  console.log('🎨 Renderizando RaffleFormFieldsUpdate:', {
    hasChanges,
    changedFieldsCount: changedFields.length,
    changedFields
  });

  return (
    <FormContainer>
      {/* Indicador de mudanças se houver alterações */}
      {hasChanges && (
        <UpdateIndicator>
          <FaSave />
          {changedFields.length} campo{changedFields.length > 1 ? 's' : ''} alterado{changedFields.length > 1 ? 's' : ''}
        </UpdateIndicator>
      )}

      {/* Resumo das mudanças */}
      {hasChanges && (
        <ChangesSummary>
          <h4>
            <FaEdit /> Mudanças Detectadas ({changedFields.length})
          </h4>
          <div className="changes-list">
            {Object.keys(fieldChanges).map(fieldPath => {
              if (!fieldChanges[fieldPath].hasChanged) return null;
              
              const change = fieldChanges[fieldPath];
              const fieldName = fieldPath.split('.').pop() || fieldPath;
              
              return (
                <div key={fieldPath} className="change-item">
                  <span className="field-name">{fieldName}</span>
                  <div className="change-values">
                    <span className="old-value">
                      {typeof change.original === 'object' 
                        ? JSON.stringify(change.original).substring(0, 50) + '...' 
                        : String(change.original).substring(0, 50)}
                    </span>
                    <span className="arrow">→</span>
                    <span className="new-value">
                      {typeof change.current === 'object' 
                        ? JSON.stringify(change.current).substring(0, 50) + '...' 
                        : String(change.current).substring(0, 50)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChangesSummary>
      )}

      <form onSubmit={handleSubmit(onFormSubmit as any)}>
        {/* Basic Information Section */}
        <FormSection style={{ position: 'relative' }}>
          <ChangeIndicator $hasChanges={changedFields.some(field => 
            field === 'title' || field === 'description' || field === 'individualNumberPrice' || 
            field === 'totalNumbers' || field === 'drawDate' || field === 'minNumbersPerUser' || 
            field === 'maxNumbersPerUser' || field === 'returnExpected'
          )} />
          
          <SectionTitle>
            <FaInfo /> Informações Básicas
          </SectionTitle>
          
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <FormInput
                id="title"
                label="Título da Rifa"
                icon={<FaEdit />}
                placeholder="Ex: iPhone 15 Pro Max - 256GB"
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                error={errors.title?.message}
                disabled={isSubmitting}
                fullWidth
              />
            )}
          />
          
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <FormTextArea
                id="description"
                label="Descrição"
                icon={<FaEdit />}
                placeholder="Descreva a sua rifa em detalhes"
                value={field.value}
                onChange={e => field.onChange(e.target.value)}
                onBlur={field.onBlur}
                error={errors.description?.message}
                disabled={isSubmitting}
                fullWidth
                rows={5}
              />
            )}
          />
          <HelpText>Uma boa descrição aumenta as chances de venda dos números.</HelpText>
          
          <SubSectionDivider />
          
          {/* Prize Configuration Section */}
          <PrizeSectionHeader>
            <div>
              <PrizeSectionTitle>
                <FaTrophy /> Configuração de Prêmios
              </PrizeSectionTitle>
              <WinnerInfoText>
                <FaInfoCircle /> 
                {winnerCount === 1 
                  ? 'Rifa com um único grande vencedor' 
                  : `Rifa com ${winnerCount} vencedores premiados`}
              </WinnerInfoText>
            </div>
            
            <WinnerDropdownContainer>
              <Controller
                name="winnerPositions"
                control={control}
                render={({ field }) => (
                  <CustomDropdown
                    id="winnerPositions"
                    options={winnerOptions}
                    value={field.value.toString()}
                    onChange={handleWinnerCountChange}
                    placeholder="Número de vencedores"
                    disabled={isSubmitting}
                  />
                )}
              />
            </WinnerDropdownContainer>
          </PrizeSectionHeader>

          <TotalPrizeDisplay>
            <PrizeAmountValue>
              <FaMoneyBillWave />
              {formatPrizeValue(totalPrizeValue)}
              <span>valor total em prêmios</span>
            </PrizeAmountValue>
            
            <PrizeCountBadge>
              <FaTrophy /> {prizes.flatMap(p => p.prizes).filter(p => p.name).length} prêmios configurados
            </PrizeCountBadge>
          </TotalPrizeDisplay>

          {errors.prizeDistribution && !prizes.some(p => 
            p.position === 1 && 
            p.prizes && 
            p.prizes.length > 0 && 
            p.prizes.some(prize => prize.name && prize.name.trim() !== '')
          ) && (
            <RequirementAlert $type="error" style={{ marginBottom: "20px" }}>
              <FaExclamationTriangle />
              <div>
                <h5>Prêmio Principal Obrigatório</h5>
                <p>{errors.prizeDistribution.message}</p>
              </div>
            </RequirementAlert>
          )}

          <PrizeListContainer>
            {prizes.map((prizePosition, index) => (
              <MultiPrizePosition
                key={`prize-position-${prizePosition.position}`}
                position={prizePosition.position}
                prizes={prizePosition.prizes}
                onAddPrize={handleAddPrizeToPosition}
                onRemovePrize={handleRemovePrizeFromPosition}
                onCreatePrize={openNewPrizeModal}
                maxPrizes={5}
              />
            ))}
          </PrizeListContainer>
            
          <FormRow>
            <Controller
              name="individualNumberPrice"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="individualNumberPrice"
                  label="Preço por Número"
                  icon={<FaMoneyBillWave />}
                  placeholder="Ex: R$10,00"
                  onChange={e => {
                    const price = parseFloat(e.target.value) || 0;
                    field.onChange(price);
                    
                    const returnExpected = getValues('returnExpected');
                    if (returnExpected && price > 0) {
                      const returnValue = extractNumericValue(returnExpected);
                      const totalNumbers = Math.ceil(returnValue / price);
                      setValue('totalNumbers', totalNumbers);
                    }
                  }}
                  error={errors.individualNumberPrice?.message}
                  disabled={isSubmitting}
                  required
                  currency="R$"
                />
              )}
            />

            <Controller
              name="returnExpected"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  id="returnExpected"
                  label="Retorno Esperado"
                  icon={<FaMoneyBill />}
                  placeholder="Ex: R$10.000,00"
                  onChange={e => {
                    field.onChange(e.target.value);
                    
                    const price = getValues('individualNumberPrice') || 0;
                    if (price > 0) {
                      const returnValue = extractNumericValue(e.target.value);
                      const totalNumbers = Math.ceil(returnValue / price);
                      setValue('totalNumbers', totalNumbers);
                    }
                  }}
                  error={errors.returnExpected?.message}
                  disabled={isSubmitting}
                  currency="R$"
                  helpText="O valor total que você deseja arrecadar com esta rifa"
                />
              )}
            />
          </FormRow>
          
          <FormRow>
            <Controller
              name="minNumbersPerUser"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="minNumbersPerUser"
                  label="Mínimo de Números por Usuário"
                  icon={<FaHashtag />}
                  placeholder="Ex: 1"
                  type="number"
                  value={field.value || ''}
                  onChange={e => {
                    const value = parseFloat(e.target.value) || 1;
                    field.onChange(value);
                  }}
                  onBlur={field.onBlur}
                  error={errors.minNumbersPerUser?.message}
                  disabled={isSubmitting}
                  required
                  min={1}
                  step="1"
                  helpText="Quantidade mínima de números que um usuário deve comprar"
                />
              )}
            />

            <Controller
              name="maxNumbersPerUser"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="maxNumbersPerUser"
                  label="Máximo de Números por Usuário"
                  icon={<FaHashtag />}
                  placeholder="Ex: 100 (opcional)"
                  type="number"
                  value={field.value || ''}
                  onChange={e => {
                    const value = parseFloat(e.target.value) || undefined;
                    field.onChange(value);
                  }}
                  onBlur={field.onBlur}
                  error={errors.maxNumbersPerUser?.message}
                  disabled={isSubmitting}
                  min={watch('minNumbersPerUser') || 1}
                  step="1"
                  helpText="Quantidade máxima de números que um usuário pode comprar (opcional)"
                />
              )}
            />
          </FormRow>

          <FormRow>
            <Controller
              name="drawDate"
              control={control}
              render={({ field }) => (
                <FormDatePicker
                  id="drawDate"
                  label="Data do Sorteio"
                  icon={<FaCalendarAlt />}
                  placeholder="Selecione a data"
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                  onBlur={field.onBlur}
                  error={errors.drawDate?.message}
                  disabled={isSubmitting}
                  required
                  minDate={new Date()}
                  showYearDropdown
                  showMonthDropdown
                  dateFormat="dd/MM/yyyy"
                  showTimeSelect={false}
                  isClearable
                />
              )}
            />
          </FormRow>
            
          {hasBasicRequirements && (
            <CalculationDisplay>
              <h5><FaCalculator /> Cálculo do Total de Números</h5>
              <div className="calculation">
                <div className="formula-item">
                  R$ {formatPrizeValue(returnExpected)}
                </div>
                <div className="operator">÷</div>
                <div className="formula-item">
                  R$ {formatCurrency(price)}
                </div>
                <div className="operator">=</div>
                <div className="result">
                  {watch('totalNumbers')} números
                </div>
              </div>
              <div className="explanation">
                Retorno esperado ÷ Preço por número = Total de números a serem vendidos
              </div>
            </CalculationDisplay>
          )}

          {price > 0 && (minNumbers > 0 || maxNumbers) && (
            <ValueRangeDisplay>
              <h5><FaMoneyBillWave /> Valores por Participante</h5>
              <div className="value-range-grid">
                <div className="value-item min">
                  <div className="value-label">Valor Mínimo</div>
                  <div className="value-amount">
                    {formatCurrency((minNumbers || 0) * (price || 0))}
                  </div>
                  <div className="value-description">
                    {minNumbers || 0} número{(minNumbers || 0) > 1 ? 's' : ''}
                  </div>
                </div>
                
                {maxNumbers && (
                  <div className="value-item max">
                    <div className="value-label">Valor Máximo</div>
                    <div className="value-amount">
                      {formatCurrency((maxNumbers || 0) * (price || 0))}
                    </div>
                    <div className="value-description">
                      {maxNumbers || 0} número{(maxNumbers || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                
                {!maxNumbers && (
                  <div className="value-item unlimited">
                    <div className="value-label">Valor Máximo</div>
                    <div className="value-amount">Ilimitado</div>
                    <div className="value-description">Sem limite definido</div>
                  </div>
                )}
              </div>
              <div className="value-explanation">
                Faixa de valores que cada participante pode investir na sua rifa
              </div>
            </ValueRangeDisplay>
          )}
          
          <InfoAlert>
            <FaInfoCircle />
            <div>
              <h5>Importante!</h5>
              <p>Configure o preço por número e o retorno esperado primeiro. O total de números será calculado automaticamente. 
              Estas informações são essenciais antes de configurar os combos com desconto e os prêmios instantâneos.</p>
            </div>
          </InfoAlert>

          {/* Seção de Combos com Desconto */}
          <SubSectionDivider />
          
          <DisabledSection $disabled={!hasBasicRequirements}>
            <ChangeIndicator $hasChanges={changedFields.some(field => 
              field === 'enablePackages' || field === 'numberPackages'
            )} />
            
            {!hasBasicRequirements ? (
              <RequirementAlert $type="warning">
                <FaExclamationTriangle />
                <div>
                  <h5>Combos com Desconto Bloqueados</h5>
                  <p>{basicRequirementsMessage}</p>
                  <ul>
                    <li>Configure o preço por número primeiro</li>
                    <li>Defina o retorno esperado</li>
                    <li>Aguarde o cálculo automático do total de números</li>
                    <li>Depois você poderá criar combos com desconto</li>
                  </ul>
                </div>
              </RequirementAlert>
            ) : (
              <UnlockMessage>
                <FaInfoCircle />
                <div>
                  <h5>Combos Liberados!</h5>
                  <p>Agora você pode configurar pacotes com desconto para seus clientes.</p>
                </div>
              </UnlockMessage>
            )}
          
            <ComboDiscountSectionComponent 
              control={control}
              watch={watch}
              initialData={initialData}
              isSubmitting={isSubmitting || !hasBasicRequirements}
            />
          </DisabledSection>
        </FormSection>
        
        {/* Upload Images Section */}
        <FormSection style={{ position: 'relative' }}>
          <ChangeIndicator $hasChanges={changedFields.some(field => 
            field === 'images' || field === 'coverImage'
          )} />
          
          <SectionTitle>
            <FaCloudUploadAlt /> Imagens
          </SectionTitle>
          
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <MultipleImageUploader
                maxImages={10}
                onChange={(files) => {
                  field.onChange(files);
                  
                  if (files.length > 0 && !getValues('coverImage')) {
                    setValue('coverImage', files[0]);
                    setCoverImageIndex(0);
                  }
                  
                  const coverImage = getValues('coverImage');
                  const coverImageExists = coverImage && files.some(file => 
                    (file instanceof File && coverImage instanceof File && file === coverImage) ||
                    (typeof file === 'string' && typeof coverImage === 'string' && file === coverImage)
                  );
                  
                  if (coverImage && !coverImageExists) {
                    if (files.length > 0) {
                      setValue('coverImage', files[0]);
                      setCoverImageIndex(0);
                    } else {
                      setValue('coverImage', undefined);
                      setCoverImageIndex(-1);
                    }
                  }
                }}
                value={field.value}
                maxSizeInMB={5}
                onCoverImageChange={handleCoverImageChange}
              />
            )}
          />
          
          {errors.coverImage && (
            <ErrorText>
              <FaExclamationTriangle /> {errors.coverImage.message}
            </ErrorText>
          )}
          
          {errors.images && (
            <ErrorText>
              <FaExclamationTriangle /> {errors.images.message}
            </ErrorText>
          )}
          <HelpText>
            Adicione até 10 imagens de alta qualidade. A primeira será a imagem principal da sua rifa.
          </HelpText>
        </FormSection>
        
        {/* Regulation Section */}
        <FormSection style={{ position: 'relative' }}>
          <ChangeIndicator $hasChanges={changedFields.includes('regulation')} />
          
          <SectionTitle>
            <FaListOl /> Regulamento
          </SectionTitle>
          
          <Controller
            name="regulation"
            control={control}
            render={({ field }) => (
              <WysiwygEditor
                id="regulation"
                label="Regulamento da Rifa"
                icon={<FaListOl />}
                placeholder="Descreva as regras e condições da sua rifa..."
                value={field.value}
                onChange={value => field.onChange(value)}
                disabled={isSubmitting}
                fullWidth
                minHeight="250px"
              />
            )}
          />
          <HelpText>
            Descreva as regras de forma clara e detalhada para evitar mal-entendidos com os participantes.
            Você pode usar as opções de formatação para destacar pontos importantes.
          </HelpText>
        </FormSection>
        
        {/* Additional Options */}
        <FormSection className='agendamento' style={{ position: 'relative' }}>
          <ChangeIndicator $hasChanges={changedFields.some(field => 
            field === 'isScheduled' || field === 'scheduledActivationDate'
          )} />
          
          <SectionTitle>
            <FaCalendarAlt /> Agendamento
          </SectionTitle>
          
          <ToggleContainer>
            <ToggleSwitch>
              <Controller
                name="isScheduled"
                control={control}
                render={({ field }) => (
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={e => {
                      const newValue = e.target.checked;
                      field.onChange(newValue);
                      
                      if (!newValue) {
                        setValue('scheduledActivationDate', '');
                      }
                    }}
                    disabled={isSubmitting}
                  />
                )}
              />
              <ToggleSlider />
            </ToggleSwitch>
            <ToggleLabel>
              Agendar publicação da rifa
            </ToggleLabel>
          </ToggleContainer>
          
          {isScheduled && (
            <Controller
              name="scheduledActivationDate"
              control={control}
              render={({ field }) => (
                <AdvancedDateTimePicker
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : '')}
                  minDate={new Date()}
                  label="Data de Publicação"
                  icon={<FaRegCalendarAlt />}
                  placeholder="Selecione a data e hora"
                  required={isScheduled}
                  error={errors.scheduledActivationDate?.message}
                  disabled={isSubmitting}
                />
              )}
            />
          )}
        </FormSection>
        
        {/* Prize Configuration Section */}
        <FormSection style={{ position: 'relative' }}>
          <ChangeIndicator $hasChanges={changedFields.some(field => 
            field === 'instantPrizes' || field === 'prizeCategories'
          )} />
          
          <SectionTitle>
            <FaGift /> Configuração de Prêmios Instantâneos
          </SectionTitle>
          
          <DisabledSection $disabled={!hasBasicRequirements}>
            {!hasBasicRequirements ? (
              <RequirementAlert $type="error">
                <FaExclamationTriangle />
                <div>
                  <h5>Prêmios Instantâneos Bloqueados</h5>
                  <p>{basicRequirementsMessage}</p>
                </div>
              </RequirementAlert>
            ) : (
              <UnlockMessage>
                <FaInfoCircle />
                <div>
                  <h5>Prêmios Instantâneos Liberados!</h5>
                  <p>Configure prêmios para distribuir durante a venda dos números.</p>
                </div>
              </UnlockMessage>
            )}
          
            <Controller
              name="prizeCategories"
              control={control}
              render={({ field }) => (
                <PrizeConfigForm
                  totalNumbers={totalNumbers}
                  onPrizeConfigChange={config => {
                    field.onChange(config);
                  }}
                  onPrizesGenerated={prizes => {
                    console.log('Prêmios gerados pelo PrizeConfigForm:', prizes.length);
                    setValue('instantPrizes', prizes);
                  }}
                  disabled={isSubmitting || !hasBasicRequirements}
                />
              )}
            />
          </DisabledSection>
          
          {/* Seção de Resumo Inteligente dos Prêmios */}
          {instantPrizes.length > 0 && (
            <PrizeIntelligentSummaryComponent 
              instantPrizes={instantPrizes}
              totalNumbers={totalNumbers}
              prizeCategories={prizeCategories}
              individualNumberPrice={price}
            />
          )}
          
          {errors.prizeCategories && (
            <ErrorText>
              <FaExclamationTriangle /> {errors.prizeCategories.message}
            </ErrorText>
          )}
        </FormSection>

        {/* Form Actions */}
        <FormActions>
          <ActionButton
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            <FaTimes />
            Cancelar
          </ActionButton>
          
          <ActionButton
            type="button"
            onClick={handleReset}
            disabled={isSubmitting || !hasChanges}
          >
            <FaTrashAlt />
            Resetar
          </ActionButton>
          
          <ActionButton
            type="submit"
            $variant="primary"
            disabled={isSubmitting || !hasChanges}
          >
            <FaSave />
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </ActionButton>
        </FormActions>
      </form>
      
      {/* Modais para prêmios */}
      <PrizeSelectorModal 
        isOpen={showPrizeSelector}
        onClose={currentCloseHandler}
        onSelectPrize={currentPrizeSelectHandler}
        availablePrizes={availablePrizes}
      />
      
      <PrizeCreatorModal
        isOpen={showNewPrizeModal}
        onClose={closeNewPrizeModal}
        onPrizeCreated={handlePrizeCreated}
      />
    </FormContainer>
  );
};

export default RaffleFormFieldsUpdate; 