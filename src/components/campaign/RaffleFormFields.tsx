'use client';

import React, { useState, useEffect } from 'react';
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
import { MOCK_PRIZES } from '@/app/(private)/dashboard/criador/premios/page';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
// Importar as funções formatPrizeValue e extractNumericValue
// Importar os novos componentes modulares
import PrizeSelectorModal from '../prize/PrizeSelectorModal';
import PrizeCreatorModal from '../prize/PrizeCreatorModal';
import CustomDropdown from '../common/CustomDropdown';
import ComboDiscountSectionComponent from './ComboDiscountSection';
import MultiPrizePosition, { PrizeItemProps } from './MultiPrizePosition';
import prizeAPIClient from '@/API/prizeAPIClient';
import { Currency } from 'lucide-react';
import CurrencyInput from '../common/CurrencyInput';

// Prize category interface
interface PrizeCategory {
  active: boolean;
  quantity: number;
  value: number;
}

// Prize categories configuration interface
interface PrizeCategoriesConfig {
  diamante: PrizeCategory;
  master: PrizeCategory;
  premiado: PrizeCategory;
}

// Interface para InstantPrize
interface InstantPrize {
  id?: string; // ID temporário para UI
  categoryId?: string;
  number: string;
  value: number;
  claimed?: boolean;
}

// Define a simple type for the form data
export type RaffleFormData = {
  // Campos básicos da campanha
  title: string;
  description: string;
  individualNumberPrice: number; // Renomeado de price para individualNumberPrice
  totalNumbers: number;
  drawDate: string;
  status: string; // Enum status (ACTIVE, COMPLETED, PENDING)
  canceled: boolean;
  
  // Configuração de ativação agendada
  isScheduled: boolean;
  scheduledActivationDate?: string;
  
  // Configuração de vencedores
  winnerPositions: number; // Renomeado de winnerCount para winnerPositions
  
  // Distribuição de prêmios para cada posição
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
  
  // Lista de vencedores (inicialmente vazia)
  winners: Array<string>;
  
  // Pacotes de números (combos)
  enablePackages: boolean; // Flag para habilitar pacotes
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
  
  // Configuração de prêmios instantâneos
  instantPrizes: InstantPrize[];
  
  // Configuração de categorias de prêmios (usado para gerar instantPrizes)
  prizeCategories?: PrizeCategoriesConfig;
  
  // Campos para detalhes e regulamento
  regulation: string;
  returnExpected: string;
  
  // Imagens da campanha
  images: File[];
  
  // Campos temporários para UI (não fazem parte do modelo final)
  mainPrize?: string; // Campo temporário para facilitar a UI
  valuePrize?: string; // Campo temporário para facilitar a UI
};

// Simplified schema that matches the type
const raffleFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  individualNumberPrice: z.number().min(0.01, 'O preço deve ser maior que zero'),
  totalNumbers: z.number().min(1, 'O número de bilhetes deve ser maior que zero'),
  drawDate: z.string().min(1, 'A data do sorteio é obrigatória'),
  images: z.array(z.any()).min(1, 'Pelo menos uma imagem é obrigatória'),
  regulation: z.string().min(1, 'A regra é obrigatória'),
  status: z.string().optional().default('ACTIVE'),
  canceled: z.boolean().optional().default(false),
  mainPrize: z.string().optional(),
  valuePrize: z.string().optional(),
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
}) as z.ZodType<RaffleFormData>;

interface RaffleFormFieldsProps {
  onSubmit: (data: RaffleFormData) => void;
  initialData?: Partial<RaffleFormData>;
  isSubmitting?: boolean;
}

// Styled components
const   FormContainer = styled.div`
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

const InstantPrizeHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }
`;

const InstantPrizeTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: ${props => props.theme.colors?.primary || '#6a11cb'};
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(106, 17, 203, 0.1);
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6a11cb;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(106, 17, 203, 0.1);
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(106, 17, 203, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(106, 17, 203, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 8px 14px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const InstantPrizeItem = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  align-items: flex-start;
  background-color: rgba(106, 17, 203, 0.03);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(106, 17, 203, 0.08);
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 30px;
  
  &:hover {
    background-color: rgba(239, 68, 68, 0.2);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    height: 40px;
    margin-top: 14px;
  }
`;

// Prize Selector Modal Components
const PrizeSelectorButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
  border: none;
  border-radius: 10px;
  padding: 12px 16px;
  color: #6a11cb;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(106, 17, 203, 0.1);
  width: 100%;
  text-align: left;
  
  &:hover {
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.15) 0%, rgba(37, 117, 252, 0.15) 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(106, 17, 203, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 0.95rem;
  }
`;

const PrizeButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  padding: 20px;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 800px;
  max-height: 80vh;
  overflow-y: auto;
  padding: 30px;
  animation: slideUp 0.3s ease forwards;
  position: relative;
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    padding: 20px;
    max-height: 90vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #6a11cb;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  font-size: 1.4rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #ef4444;
    transform: rotate(90deg);
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background-color: #f9fafb;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  padding: 0 16px;
  margin-bottom: 24px;
  
  svg {
    color: #6b7280;
  }
  
  input {
    flex: 1;
    padding: 14px 0;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    outline: none;
    color: #111827;
    
    &::placeholder {
      color: #9ca3af;
    }
  }
`;

const PrizeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const PrizeCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(106, 17, 203, 0.15);
    border-color: rgba(106, 17, 203, 0.3);
  }
`;

const PrizeImage = styled.div`
  height: 140px;
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
  }
`;

const PrizeDetails = styled.div`
  padding: 15px;
`;

const PrizeName = styled.h4`
  margin: 0 0 5px;
  font-size: 0.95rem;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
`;

const PrizeValue = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 8px;
  
  svg {
    font-size: 0.85rem;
  }
`;

const SelectedPrizeCard = styled.div`
  display: flex;
  gap: 16px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(106, 17, 203, 0.2);
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const SelectedPrizeImage = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 8px;
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 640px) {
    width: 80px;
    height: 80px;
  }
`;

const SelectedPrizeDetails = styled.div`
  flex: 1;
`;

const SelectedPrizeName = styled.h4`
  margin: 0 0 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
`;

const SelectedPrizeValue = styled.div`
  font-size: 0.9rem;
  color: #6a11cb;
  font-weight: 600;
  margin-bottom: 5px;
`;

const SelectedPrizeDescription = styled.p`
  margin: 0;
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.5;
`;

const RemoveSelectedPrize = styled.button`
  background: none;
  border: none;
  color: #ef4444;
  font-size: 1.2rem;
  cursor: pointer;
  align-self: flex-start;
  padding: 5px;
  transition: all 0.2s ease;
  margin-left: auto;
  
  &:hover {
    transform: scale(1.1);
  }
  
  @media (max-width: 640px) {
    align-self: flex-end;
    margin-top: -25px;
  }
`;

// Componentes para o Modal de Criar Prêmio
const PrizeFormContainer = styled.div`
  margin-top: 20px;
`;

const PrizeFormRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PrizeFormGroup = styled.div`
  flex: 1;
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
`;

const PrizeFormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
`;

const PrizeFormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s ease;
  min-height: 120px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #6a11cb;
    box-shadow: 0 0 0 2px rgba(106, 17, 203, 0.1);
  }
`;

const ImagePreview = styled.div<{ $imageUrl: string }>`
  width: 100%;
  height: 200px;
  background-image: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : 'none'};
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  border: ${props => props.$imageUrl ? 'none' : '2px dashed rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  position: relative;
`;

const ImageUploadLabel = styled.label`
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #6b7280;
  font-size: 0.9rem;
  width: 100%;
  height: 100%;
  
  svg {
    font-size: 2rem;
    color: #6a11cb;
  }
`;

const ImageInput = styled.input`
  display: none;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
    transform: scale(1.1);
  }
  
  svg {
    color: #ef4444;
    font-size: 1rem;
  }
`;

const SaveButton = styled.button`
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
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

// Add these styled components after the existing styled components
const WinnersSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const WinnersHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const WinnersTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WinnerDropdownContainer = styled.div`
  width: 180px;
`;

const PrizePositionCard = styled.div`
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.05) 0%, rgba(37, 117, 252, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  padding: 20px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 15px rgba(106, 17, 203, 0.1);
    transform: translateY(-2px);
  }
`;

const PositionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const PositionBadge = styled.div<{ $position: number }>`
  background: ${props => {
    switch (props.$position) {
      case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)';
      case 3: return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default: return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    }
  }};
  color: white;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const PositionTrophy = styled.span`
  font-size: 1.2rem;
`;

const EmptyPrizeCard = styled.div`
  border: 2px dashed rgba(106, 17, 203, 0.2);
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: rgba(106, 17, 203, 0.02);
  height: 120px;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.05);
    border-color: rgba(106, 17, 203, 0.4);
  }
`;

const EmptyPrizeIcon = styled.div`
  font-size: 2rem;
  color: rgba(106, 17, 203, 0.4);
`;

const EmptyPrizeText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-weight: 500;
  text-align: center;
`;

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

const PrizeListContainer = styled.div`
  margin: 24px 0;
`;

const NewPositionBadge = styled.div<{ $position: number }>`
  position: absolute;
  top: 0;
  left: 0;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  border-radius: 8px 0 8px 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  
  background: ${props => {
    switch (props.$position) {
      case 1: return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
      case 2: return 'linear-gradient(135deg, #C0C0C0 0%, #A9A9A9 100%)';
      case 3: return 'linear-gradient(135deg, #CD7F32 0%, #8B4513 100%)';
      default: return 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)';
    }
  }};
`;

const NewPrizeCard = styled.div<{ $position: number }>`
  position: relative;
  border-radius: 12px;
  background: white;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.1);
    border-color: rgba(106, 17, 203, 0.15);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => {
      switch (props.$position) {
        case 1: return 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)';
        case 2: return 'linear-gradient(90deg, #C0C0C0 0%, #A9A9A9 100%)';
        case 3: return 'linear-gradient(90deg, #CD7F32 0%, #8B4513 100%)';
        default: return 'linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)';
      }
    }};
  }
`;

// Card para o primeiro prêmio quando vazio
const EmptyFirstPrize = styled.div`
  border: 2px dashed rgba(106, 17, 203, 0.15);
  border-radius: 12px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background-color: rgba(106, 17, 203, 0.02);
  margin-bottom: 20px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.04);
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.08);
    border-color: rgba(106, 17, 203, 0.3);
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
  }
`;

// Adicionar os componentes estilizados que estão faltando após os existentes
const NewPrizeContent = styled.div`
  display: flex;
  padding: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NewPrizeImageContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    margin-bottom: 15px;
  }
`;

const NewPrizeImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const NewPrizeInfo = styled.div`
  flex: 1;
`;

const NewPrizeName = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 10px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const NewPrizeValue = styled.div`
  font-size: 1rem;
  font-weight: 700;
  color: #6a11cb;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 1rem;
  }
`;

const NewPrizeActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.02);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
`;

const PrizeActionButton = styled.button<{ $variant?: 'danger' | 'default' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  color: ${props => props.$variant === 'danger' ? '#ef4444' : '#6b7280'};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.$variant === 'danger' ? '#ef4444' : '#111827'};
  }
  
  svg {
    font-size: 0.95rem;
  }
`;

const EmptyFirstPrizeIcon = styled.div`
  font-size: 3.5rem;
  color: rgba(106, 17, 203, 0.3);
  margin-bottom: 10px;
`;

const EmptyFirstPrizeTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0 0 5px;
`;

const EmptyFirstPrizeText = styled.p`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  max-width: 500px;
`;

// Remover as declarações duplicadas dos novos componentes
// Card vazio para os prêmios secundários
const ModernEmptyPrizeCard = styled.div`
  position: relative;
  border-radius: 12px;
  background: white;
  margin-bottom: 20px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.1);
    border-color: rgba(106, 17, 203, 0.15);
  }
`;

const ModernEmptyPrizeContainer = styled.div`
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
`;

const ModernEmptyPrizeIcon = styled.div`
  font-size: 2.5rem;
  color: rgba(106, 17, 203, 0.2);
  margin-bottom: 16px;
`;

const ModernEmptyPrizeText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-weight: 500;
  margin-bottom: 20px;
`;

const PrizeSelectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: linear-gradient(135deg, rgba(106, 17, 203, 0.1) 0%, rgba(37, 117, 252, 0.1) 100%);
  color: #6a11cb;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(106, 17, 203, 0.15) 0%, rgba(37, 117, 252, 0.15) 100%);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.15);
  }
`;

const PrizeCreationButton = styled(PrizeSelectButton)`
  background: linear-gradient(135deg, rgba(41, 142, 16, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%);
  color: #22c55e;
  
  &:hover {
    background: linear-gradient(135deg, rgba(41, 142, 16, 0.15) 0%, rgba(34, 197, 94, 0.15) 100%);
  }
`;

const PrizeButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 580px) {
    flex-direction: column;
    gap: 10px;
    width: 100%;
    max-width: 300px;
  }
`;

// Adicionar os componentes estilizados para o TotalPrizeDisplay após o componente ModernEmptyPrizeCard
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

// This styled component was renamed to avoid conflict with the imported component
const ComboSectionWrapper = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const ComboTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComboDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  max-width: 500px;
`;

const ToggleComboContainer = styled.div`
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

const CombosBuilderContainer = styled.div`
  margin-top: 24px;
`;

const ComboVisualizer = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
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
    padding: 20px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 18px;
    border-radius: 12px;
  }
`;

const ComboVisualizerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ComboPriceInfo = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 10px;
  
  span {
    font-size: 0.9rem;
    font-weight: 500;
    color: #666;
  }
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const ComboInfoText = styled.div`
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

const ComboCardsContainer = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 15px;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const ComboCard = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  cursor: pointer;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(106, 17, 203, 0.15);
    border-color: rgba(106, 17, 203, 0.3);
  }
`;

const ComboQuantity = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;
`;

const ComboDiscount = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const DiscountSlider = styled.input`
  width: 100%;
  height: 10px;
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  border-radius: 5px;
  outline: none;
  transition: all 0.3s ease;
  
  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 5px;
  }
  
  &::-webkit-slider-thumb {
    width: 20px;
    height: 20px;
    background: #6a11cb;
    border-radius: 50%;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -5px;
  }
  
  &::-moz-range-track {
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 5px;
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: #6a11cb;
    border-radius: 50%;
    cursor: pointer;
    -moz-appearance: none;
    margin-top: -5px;
  }
  
  &::-ms-track {
    width: 100%;
    height: 10px;
    background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
    border-radius: 5px;
  }
  
  &::-ms-thumb {
    width: 20px;
    height: 20px;
    background: #6a11cb;
    border-radius: 50%;
    cursor: pointer;
    margin-top: -5px;
  }
`;

const DiscountBadge = styled.div<{ $percentage: number }>`
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 20px;
  margin-left: 10px;
`;

const ComboPriceCalculation = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const ComboFinalPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ComboSavingBadge = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ComboActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
`;

const ComboActionButton = styled.button<{ $variant?: 'danger' | 'default' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.1)' : 'transparent'};
  color: ${props => props.$variant === 'danger' ? '#ef4444' : '#6b7280'};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$variant === 'danger' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.$variant === 'danger' ? '#ef4444' : '#111827'};
  }
  
  svg {
    font-size: 0.95rem;
  }
`;

const QuantityPicker = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100px;
`;

const QuantityButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: #6a11cb;
  }
`;

const ComboPreview = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
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
    padding: 20px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 18px;
    border-radius: 12px;
  }
`;

const ComboPreviewTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComboPreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ComboPreviewItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ComboPreviewBadge = styled.div<{ $percentage: number }>`
  background: linear-gradient(90deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 20px;
  margin-left: 10px;
`;

const ComboPreviewQuantity = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
`;

const ComboPreviewLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
`;

const ComboPreviewPrice = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const ComboPreviewOriginalPrice = styled.div`
  text-decoration: line-through;
`;

const ComboPreviewDiscountedPrice = styled.div`
  font-weight: 700;
`;


const AddComboButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(106, 17, 203, 0.1);
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #6a11cb;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(106, 17, 203, 0.1);
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.15);
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(106, 17, 203, 0.15);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 5px rgba(106, 17, 203, 0.1);
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 8px 14px;
  }
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
  }
`;

const ComboSection = styled.div`
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const ComboSectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const ComboSectionTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ComboSectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  max-width: 500px;
`;

// Componente de alerta informativo
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

// Componente para exibir o cálculo da quantidade de números
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

const RaffleFormFields: React.FC<RaffleFormFieldsProps> = ({
  onSubmit,
  initialData = {},
  isSubmitting = false
}) => {
  // Configurar React Hook Form
  const defaultValues = {
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
    numberPackages: initialData.numberPackages || [
      {
        name: 'Pacote 1',
        description: 'Descrição do pacote 1',
        quantity: 5,
        price: 10,
        discount: 5,
        isActive: true,
        highlight: false,
        order: 1,
        maxPerUser: 2
      }
    ],
    instantPrizes: initialData.instantPrizes || [],
    prizeCategories: initialData.prizeCategories || {
      diamante: { active: false, quantity: 10, value: 2000 },
      master: { active: false, quantity: 20, value: 1000 },
      premiado: { active: false, quantity: 50, value: 500 }
    },
    regulation: initialData.regulation || '',
    returnExpected: initialData.returnExpected || '',
    images: initialData.images || [],
    mainPrize: initialData.mainPrize || '',
    valuePrize: initialData.valuePrize || ''
  } as RaffleFormData;
  
  const { 
    control, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors }, 
    trigger,
    getValues
  } = useForm<RaffleFormData>({
    defaultValues,
    mode: 'all',
    resolver: zodResolver(raffleFormSchema)
  });
  
  // Prize selector state
  const [showPrizeSelector, setShowPrizeSelector] = useState(false);
  const [showNewPrizeModal, setShowNewPrizeModal] = useState(false);
  const [selectedPrize, setSelectedPrize] = useState<IPrize | null>(null);
  const [availablePrizes, setAvailablePrizes] = useState<IPrize[]>([]);
  
  // Adicionar estado para rastrear o valor total dos prêmios
  const [totalPrizeValue, setTotalPrizeValue] = useState<number>(0);
  
  // Observar campos do formulário para lógica dependente
  const totalNumbers = watch('totalNumbers');
  const isScheduled = watch('isScheduled');
  const prizeCategories = watch('prizeCategories');
  const price = watch('individualNumberPrice');
  
  // Observar número de vencedores
  const winnerCount = watch('winnerPositions');
  const prizes = watch('prizeDistribution');

  // Formatar valor do prêmio para exibição
  const extractNumericValue = (valueString: string): number => {
    try {
      // Remove qualquer caractere que não seja dígito, ponto ou vírgula
      const cleanString = valueString.replace(/[^\d,.]/g, '');
      
      // Substitui vírgula por ponto para processamento numérico
      const normalizedString = cleanString.replace(/,/g, '.');
      
      // Converte para número
      const value = parseFloat(normalizedString);
      
      // Retorna 0 se não for um número válido
      return isNaN(value) ? 0 : value;
    } catch (error) {
      console.error("Erro ao extrair valor numérico:", error);
      return 0;
    }
  };

  const formatPrizeValue = (value: string | number): string => {
    if (!value) return 'R$ 0,00';
    
    // Se for um número, converte para string
    const valueString = typeof value === 'number' ? value.toString() : value;
    
    // Verificar se o valor já está formatado como moeda
    if (valueString.includes('R$')) {
      return valueString;
    }
    
    // Tenta converter para número
    const numericValue = extractNumericValue(valueString);
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(numericValue);
  };

  
  
  // Carregar prêmios mock quando o componente montar
  useEffect(() => {
    const fetchPrizes = async () => {
      const prizes = await prizeAPIClient.getAllPrizes();
      setAvailablePrizes(prizes.data);
    };
    fetchPrizes();
  }, []);
  
  // Adicionar o efeito para calcular o valor total dos prêmios
  useEffect(() => {
    if (prizes && prizes.length > 0) {
      const total = prizes.reduce((sum: number, positionObj) => {
        if (!positionObj.prizes || positionObj.prizes.length === 0) return sum;
        
        const positionTotal = positionObj.prizes.reduce((prizeSum, prize) => {
          if (!prize.name || !prize.value) return prizeSum;
          
          // Extrair valor numérico da string formatada em moeda brasileira
          // R$ 2.152.987,68 -> 2152987.68
          let prizeValue = parseFloat(prize.value);
          
          return prizeSum + prizeValue;
        }, 0);
        
        return sum + positionTotal;
      }, 0);
      
      setTotalPrizeValue(total);
    } else {
      setTotalPrizeValue(0);
    }
  }, [prizes]);
  
  // Adicionar handlers para os múltiplos prêmios por posição
  const handleAddPrizeToPosition = (position: number) => {
    // Abrir o seletor de prêmios para adicionar um novo prêmio à posição
    const onSelectForPosition = (prize: IPrize) => {
      console.log('Selecionando prêmio completo:', prize);
      
      const prizeIdentifier = prize.prizeCode;
      console.log('Identificador do prêmio para posição:', {
        name: prize.name,
        id: prize._id,
        prizeCode: prize.prizeCode,
        identificador: prizeIdentifier
      });
      
      const currentPrizes = [...prizes];
      const positionIndex = currentPrizes.findIndex(p => p.position === position);
      
      if (positionIndex >= 0) {
        // Adicionar o prêmio à posição existente
        currentPrizes[positionIndex].prizes.push({
          prizeId: prizeIdentifier,
          name: prize.name,
          value: prize.value,
          image: prize.image
        });
        
        console.log(`Prêmio adicionado à posição ${position}:`, {
          name: prize.name,
          id: prizeIdentifier
        });
      } else {
        // Criar nova posição com o prêmio
        currentPrizes.push({
          position,
          prizes: [{
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          }]
        });
        
        console.log(`Nova posição ${position} criada com prêmio:`, {
          name: prize.name,
          id: prizeIdentifier
        });
      }
      
      setValue('prizeDistribution', currentPrizes);
      setShowPrizeSelector(false);
    };
    
    // Configurar os handlers para o seletor de prêmios
    setCurrentPrizeSelectHandler(() => onSelectForPosition);
    setCurrentCloseHandler(() => {
      return () => {
        setCurrentPrizeSelectHandler(() => handleSelectPrize);
        setCurrentCloseHandler(() => closePrizeSelector);
        closePrizeSelector();
      };
    });
    
    // Abrir o seletor de prêmios
    setShowPrizeSelector(true);
  };
  
  const handleRemovePrizeFromPosition = (position: number, prizeIndex: number) => {
    const currentPrizes = [...prizes];
    const positionIndex = currentPrizes.findIndex(p => p.position === position);
    
    if (positionIndex >= 0) {
      // Remover o prêmio específico da posição
      currentPrizes[positionIndex].prizes.splice(prizeIndex, 1);
      
      // Se não sobrou nenhum prêmio nesta posição e não for a primeira, remover a posição
      if (currentPrizes[positionIndex].prizes.length === 0 && position > 1) {
        currentPrizes.splice(positionIndex, 1);
      } else if (currentPrizes[positionIndex].prizes.length === 0) {
        // Para a posição 1, manter com um prêmio vazio
        currentPrizes[positionIndex].prizes = [{
          name: '',
          value: '',
          image: ''
        }];
      }
      
      setValue('prizeDistribution', currentPrizes);
    }
  };
  
  // Efeito para atualizar campos quando um prêmio é selecionado
  useEffect(() => {
    if (selectedPrize) {
      setValue('mainPrize', selectedPrize.name);
      setValue('valuePrize', selectedPrize.value);
      if (selectedPrize.description) {
        setValue('description', selectedPrize.description);
      }
    }
  }, [selectedPrize, setValue]);
  
  // Efeito para atualizar a lista de prêmios quando o número de vencedores muda
  useEffect(() => {
    const currentPrizes = [...prizes];
    
    // Mapeamento das posições atuais
    const currentPositions = currentPrizes.map(p => p.position);
    
    // Se aumentou o número de vencedores, adicionar novas posições vazias
    for (let i = 1; i <= winnerCount; i++) {
      if (!currentPositions.includes(i)) {
        currentPrizes.push({
          position: i,
          prizes: [{
            name: '',
            value: '',
            image: ''
          }]
        });
      }
    }
    
    // Se diminuiu o número de vencedores, remover as posições excedentes
    const updatedPrizes = currentPrizes.filter(p => p.position <= winnerCount);
    
    // Ordenar por posição
    updatedPrizes.sort((a, b) => a.position - b.position);
    
    setValue('prizeDistribution', updatedPrizes);
  }, [winnerCount, setValue]);
  
  // Efeito para sincronizar o prêmio principal selecionado com o primeiro prêmio
  useEffect(() => {
    if (selectedPrize && prizes?.length > 0) {
      const updatedPrizes = [...prizes];
      const firstPosition = updatedPrizes.find(p => p.position === 1);
      
      if (firstPosition && firstPosition.prizes.length > 0) {
        console.log('Atualizando primeiro prêmio com:', selectedPrize);
        console.log('prizeCode do prêmio selecionado:', selectedPrize.prizeCode);
        
        firstPosition.prizes[0] = {
          prizeId: selectedPrize.prizeCode || '',
          name: selectedPrize.name,
          value: selectedPrize.value,
          image: selectedPrize.image
        };
        
        setValue('prizeDistribution', updatedPrizes);
      }
    }
  }, [selectedPrize, setValue]);
  
  // Efeito para ajustar categorias de prêmios quando totalNumbers muda
  useEffect(() => {
    if (totalNumbers && prizeCategories) {
      // Verificar se alguma categoria excede o total de números
      const totalAssigned = Object.values(prizeCategories).reduce((sum, category) => 
        category.active ? sum + category.quantity : sum, 0
      );
      
      // Se o total atribuído excede o total disponível, ajustar proporcionalmente
      if (totalAssigned > totalNumbers) {
        const ratio = totalNumbers / totalAssigned;
        
        const updatedCategories = { ...prizeCategories };
        let needsUpdate = false;
        
        Object.keys(updatedCategories).forEach(key => {
          const categoryKey = key as keyof PrizeCategoriesConfig;
          if (updatedCategories[categoryKey].active) {
            const newQuantity = Math.floor(updatedCategories[categoryKey].quantity * ratio);
            if (updatedCategories[categoryKey].quantity !== newQuantity) {
              updatedCategories[categoryKey].quantity = Math.max(1, newQuantity);
              needsUpdate = true;
            }
          }
        });
        
        if (needsUpdate) {
          setValue('prizeCategories', updatedCategories);
        }
      }
    }
  }, [totalNumbers, prizeCategories, setValue]);
  
  // Handlers para Prize Selector
  const openPrizeSelector = () => {
    setShowPrizeSelector(true);
  };
  
  let closePrizeSelector = () => {
    setShowPrizeSelector(false);
  };
  
  const openNewPrizeModal = () => {
    setShowNewPrizeModal(true);
  };
  
  const closeNewPrizeModal = () => {
    setShowNewPrizeModal(false);
  };
  
  let handleSelectPrize = (prize: IPrize) => {
    console.log('Prêmio selecionado (principal):', prize);
    console.log('prizeCode do prêmio principal:', prize.prizeCode);
    setSelectedPrize(prize);
    closePrizeSelector();
  };
  
  const handlePrizeCreated = (prize: IPrize) => {
    // Adicionar o novo prêmio à lista
    setAvailablePrizes(prev => [prize, ...prev]);
    // Selecionar o prêmio recém-criado
    setSelectedPrize(prize);
    // Fechar o modal
    closeNewPrizeModal();
  };
  
  const handleClearSelectedPrize = () => {
    setSelectedPrize(null);
    setValue('mainPrize', '');
    setValue('valuePrize', '');
  };
  
  // Handlers para Instant Prizes
  const handleAddInstantPrize = () => {
    const currentPrizes = getValues('instantPrizes');
    const newPrize: InstantPrize = {
      id: `prize-${Date.now()}`,
      number: '',
      value: 0,
      claimed: false
    };
    setValue('instantPrizes', [...currentPrizes, newPrize]);
  };
  
  const handleRemoveInstantPrize = (id: string) => {
    const currentPrizes = getValues('instantPrizes');
    setValue('instantPrizes', currentPrizes.filter(prize => prize.id !== id));
  };
  
  const handleInstantPrizeChange = (id: string, field: 'number' | 'value' | 'categoryId', value: string | number) => {
    const currentPrizes = getValues('instantPrizes');
    const updatedPrizes = currentPrizes.map(prize => {
      if (prize.id === id) {
        return { ...prize, [field]: value };
      }
      return prize;
    });
    
    setValue('instantPrizes', updatedPrizes);
  };
  
  // Add these state variables near the top of the component, with other state declarations
  const [currentPrizeSelectHandler, setCurrentPrizeSelectHandler] = useState<(prize: IPrize) => void>(() => handleSelectPrize);
  const [currentCloseHandler, setCurrentCloseHandler] = useState<() => void>(() => closePrizeSelector);

  // Replace the handleSelectPrizeForPosition function with this version
  const handleSelectPrizeForPosition = (position: number) => {
    console.log('handleSelectPrizeForPosition - availablePrizes:', availablePrizes);
    
    // Create a handler for this specific position
    const onSelectForPosition = (prize: IPrize) => {
      console.log('Prêmio selecionado completo:', prize);
      
      const prizeIdentifier = prize.prizeCode || prize._id?.toString() || '';
      console.log('Identificador do prêmio:', prizeIdentifier);
      
      const updatedPrizes = [...prizes];
      const positionIndex = updatedPrizes.findIndex(p => p.position === position);
      
      if (positionIndex >= 0) {
        // Posição já existe, atualizar o primeiro prêmio
        if (updatedPrizes[positionIndex].prizes.length > 0) {
          updatedPrizes[positionIndex].prizes[0] = {
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          };
          
          console.log('Prêmio selecionado para posição:', {
            position,
            name: prize.name,
            id: prizeIdentifier
          });
        } else {
          // Se não houver prêmios, adicionar um
          updatedPrizes[positionIndex].prizes.push({
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          });
        }
      } else {
        // Criar nova posição com o prêmio
        updatedPrizes.push({
          position,
          prizes: [{
            prizeId: prizeIdentifier,
            name: prize.name,
            value: prize.value,
            image: prize.image
          }]
        });
        
        // Ordenar por posição
        updatedPrizes.sort((a, b) => a.position - b.position);
      }
      
      setValue('prizeDistribution', updatedPrizes);
      
      // If it's the first position, update the main prize too
      if (position === 1) {
        setSelectedPrize(prize);
        setValue('mainPrize', prize.name);
        setValue('valuePrize', prize.value);
      }
      
      setShowPrizeSelector(false);
    };
    
    // Store the original handlers in state
    setCurrentPrizeSelectHandler(() => onSelectForPosition);
    setCurrentCloseHandler(() => {
      return () => {
        // Reset to default handlers when modal closes
        setCurrentPrizeSelectHandler(() => handleSelectPrize);
        setCurrentCloseHandler(() => closePrizeSelector);
        closePrizeSelector();
      };
    });
    
    // Open the modal
    setShowPrizeSelector(true);
  };
  
  // Opções para o dropdown de quantidade de vencedores
  const winnerOptions = [
    { value: '1', label: '1 vencedor' },
    { value: '2', label: '2 vencedores' },
    { value: '3', label: '3 vencedores' },
    { value: '4', label: '4 vencedores' },
    { value: '5', label: '5 vencedores' }
  ];
  
  // Handler para alteração do número de vencedores
  const handleWinnerCountChange = (value: string) => {
    setValue('winnerPositions', parseInt(value));
  };
  
  // Função para preparar dados para API
  const prepareFormDataForApi = (data: RaffleFormData): any => {
    // Formatar dados para a estrutura da API
    const formattedData = {
      // Campos básicos
      title: data.title,
      description: data.description,
      individualNumberPrice: data.individualNumberPrice,
      totalNumbers: data.totalNumbers,
      drawDate: new Date(data.drawDate),
      status: data.status || 'ACTIVE',
      canceled: data.canceled || false,
      
      // Configuração de agendamento
      isScheduled: data.isScheduled,
      scheduledActivationDate: data.isScheduled && data.scheduledActivationDate 
        ? new Date(data.scheduledActivationDate) 
        : null,
      
      // Configuração de vencedores
      winnerPositions: data.winnerPositions,
      winners: data.winners || [],
      
      // Distribuição de prêmios (prizeDistribution)
      prizeDistribution: data.prizeDistribution.map(positionData => {
        console.log('Processando posição:', positionData.position);
        console.log('Prêmios da posição:', positionData.prizes);
        
        return {
          position: positionData.position,
          prizes: positionData.prizes
            .filter(prize => prize.name) // Filtrar apenas prêmios válidos com nome
            .map(prize => {
              // Log detalhado para depuração
              console.log(`Prêmio "${prize.name}" - prizeId:`, prize.prizeId);
              
              // Avisar se o prizeId estiver vazio
              if (!prize.prizeId) {
                console.warn(`⚠️ ATENÇÃO: Prêmio "${prize.name}" não tem prizeId!`);
              }
              
              // Simplesmente usar o prizeId como está, que deve ser o prizeCode
              return prize.prizeId;
            }),
          description: positionData.description || 
            `${positionData.position === 1 ? 'Prêmio principal' : `${positionData.position}º lugar`}: ${
              positionData.prizes.length > 1 
                ? `${positionData.prizes.length} prêmios` 
                : positionData.prizes[0]?.name || 'Não especificado'
            }`
        };
      }),
      
      // Pacotes de números (numberPackages)
      numberPackages: data.enablePackages ? data.numberPackages.map(pkg => ({
        name: pkg.name,
        description: pkg.description || '',
        quantity: pkg.quantity,
        price: pkg.price,
        discount: pkg.discount,
        isActive: pkg.isActive !== undefined ? pkg.isActive : true,
        highlight: pkg.highlight || false,
        order: pkg.order || 1,
        maxPerUser: pkg.maxPerUser
      })) : [],
      
      // Detalhes adicionais
      regulation: data.regulation || '',
      returnExpected: data.returnExpected || '',
      
      // Imagens
      images: data.images,
      
      // Prêmios instantâneos - Utilizamos diretamente os números já gerados
      instantPrizes: [] as Array<{
        categoryId?: string;
        number: string;
        value: number;
        claimed: boolean;
      }>
    };
      
    // Conjunto para controlar números já usados
    const usedNumbers = new Set<string>();
    
    console.log('🏆 Status dos prêmios instantâneos:');
    
    // Usar diretamente os instantPrizes já gerados no formulário
    if (data.instantPrizes && data.instantPrizes.length > 0) {
      console.log('Usando prêmios instantâneos já gerados:', data.instantPrizes.length);
      
      // Adicionar diretamente os prêmios do formulário
      data.instantPrizes.forEach(prize => {
        // Garantir que o número esteja no formato de 6 dígitos
        let formattedNumber = prize.number;
        if (formattedNumber.length < 6) {
          formattedNumber = formattedNumber.padStart(6, '0');
        } else if (formattedNumber.length > 6) {
          formattedNumber = formattedNumber.slice(-6);
        }
        
        // Verificar se este número já foi usado para evitar duplicatas
        if (!usedNumbers.has(formattedNumber)) {
          usedNumbers.add(formattedNumber);
          
          formattedData.instantPrizes.push({
            categoryId: prize.categoryId,
            number: formattedNumber,
            value: prize.value,
            claimed: prize.claimed || false
          });
        } else {
          console.warn(`Número duplicado ignorado: ${formattedNumber}`);
        }
      });
      
      // Log para mostrar quais números estão sendo enviados
      console.log('Exemplos de números que serão enviados:');
      const examples = formattedData.instantPrizes.slice(0, Math.min(5, formattedData.instantPrizes.length));
      examples.forEach((prize, index) => {
        console.log(`- #${index+1}: ${prize.number} (${prize.categoryId || 'sem categoria'}, R$ ${prize.value})`);
      });
    } else {
      console.log('Nenhum prêmio instantâneo definido no formulário');
    }
    
    // Log final de resumo dos prêmios instantâneos
    console.log(`📊 Total de prêmios instantâneos: ${formattedData.instantPrizes.length}`);
    if (formattedData.instantPrizes.length > 0) {
      // Contar por categoria
      const categoryCounts: {[key: string]: number} = {};
      formattedData.instantPrizes.forEach(prize => {
        const category = prize.categoryId || 'sem-categoria';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      console.log('Distribuição por categoria:');
      Object.entries(categoryCounts).forEach(([category, count]) => {
        console.log(`- ${category}: ${count} prêmios`);
      });
    }
    
    return formattedData;
  };
  
  // Filtrar prêmios com base na busca
  
  // Handler para envio do formulário
  const onFormSubmit = (data: RaffleFormData) => {
    console.log('Formulário original:', data);
    
    // Log para debug dos prêmios e seus IDs
    data.prizeDistribution.forEach((pos, posIndex) => {
      console.log(`Posição ${pos.position} (${posIndex}):`);
      pos.prizes.forEach((prize, prizeIndex) => {
        console.log(`  Prêmio ${prizeIndex+1}: ${prize.name}, prizeId: [${prize.prizeId}], Valor: ${prize.value}`);
      });
    });
    
    const apiData = prepareFormDataForApi(data);
    console.log('Dados para API:', apiData);
    
    // Log para debug dos prizeIds enviados para API
    apiData.prizeDistribution.forEach((pos: any, index: number) => {
      console.log(`Posição ${pos.position} (API), prizes:`, JSON.stringify(pos.prizes));
    });
    
    // Verificação final antes de enviar
    console.log('🔍 Verificação final dos prizeIds:');
    apiData.prizeDistribution.forEach((pos: any) => {
      console.log(`Posição ${pos.position}:`, 
        pos.prizes.map((id: string) => `[${id}]`).join(', '));
    });
    
    onSubmit(apiData);
  };
  
  // Add state for cover image index
  const [coverImageIndex, setCoverImageIndex] = useState<number>(0);
  
  // Add handler for cover image change
  const handleCoverImageChange = (index: number) => {
    console.log('Cover image changed to index:', index);
    setCoverImageIndex(index);
    
    // If you need to update some form field based on the cover image
    // you can do it here
  };
  
  return (
    <FormContainer>
      <form onSubmit={handleSubmit(onFormSubmit as any)}>
        {/* Basic Information Section */}
        <FormSection>
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
          
          {/* Nova seção de configuração de prêmios */}
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
                    
                    // Se temos um retorno esperado e preço > 0, calcular total de números
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
                    
                    // Se temos preço por número > 0, calcular total de números
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
              name="totalNumbers"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="totalNumbers"
                  label="Total de Números"
                  icon={<FaHashtag />}
                  placeholder="Ex: 100"
                  type="number"
                  value={field.value || ''}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.onBlur}
                  error={errors.totalNumbers?.message}
                  disabled={isSubmitting}
                  required
                  min={1}
                  step="1"
                  helpText="Calculado automaticamente com base no preço e retorno esperado"
                />
              )}
            />
            
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
            
          {watch('individualNumberPrice') > 0 && watch('returnExpected') && (
            <CalculationDisplay>
              <h5><FaCalculator /> Cálculo do Total de Números</h5>
              <div className="calculation">
                <div className="formula-item">
                  R$ {formatPrizeValue(watch('returnExpected'))}
                </div>
                <div className="operator">÷</div>
                <div className="formula-item">
                  R$ {(watch('individualNumberPrice')).toFixed(2).replace('.', ',')}
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
          
          <ComboDiscountSectionComponent 
            control={control}
            watch={watch}
            initialData={initialData}
            isSubmitting={isSubmitting}
          />
        </FormSection>
        
        {/* Upload Images Section */}
        <FormSection>
          <SectionTitle>
            <FaCloudUploadAlt /> Imagens
          </SectionTitle>
          
          <Controller
            name="images"
            control={control}
            render={({ field }) => (
              <MultipleImageUploader
                maxImages={10}
                onChange={files => field.onChange(files)}
                value={field.value}
                maxSizeInMB={5}
                onCoverImageChange={handleCoverImageChange}
              />
            )}
          />
          
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
        <FormSection>
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
        <FormSection className='agendamento'>
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
                    onChange={e => field.onChange(e.target.checked)}
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
        <FormSection>
          <SectionTitle>
            <FaGift /> Configuração de Prêmios
          </SectionTitle>
          
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
                  // Atualizar instantPrizes no formulário com os prêmios gerados
                  console.log('Prêmios gerados pelo PrizeConfigForm:', prizes.length);
                  setValue('instantPrizes', prizes);
                }}
                disabled={isSubmitting}
              />
            )}
          />
          
          {errors.prizeCategories && (
            <ErrorText>
              <FaExclamationTriangle /> {errors.prizeCategories.message}
            </ErrorText>
          )}
        </FormSection>
      </form>
      
      {/* Usar os modais modulares */}
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

export default RaffleFormFields; 