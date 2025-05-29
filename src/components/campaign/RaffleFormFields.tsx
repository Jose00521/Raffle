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
  FaInfoCircle
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
// Importar os novos componentes modulares
import PrizeSelectorModal from '../prize/PrizeSelectorModal';
import PrizeCreatorModal from '../prize/PrizeCreatorModal';
import CustomDropdown from '../common/CustomDropdown';
import ComboDiscountSectionComponent from './ComboDiscountSection';

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

// Define a simple type for the form data
export type RaffleFormData = {
  title: string;
  description: string;
  price: number;
  totalNumbers: number;
  drawDate: string;
  images: File[];
  regulation: string;
  mainPrize: string;
  valuePrize: string;
  returnExpected: string;
  isScheduled: boolean;
  scheduledDate?: string;
  prizeCategories?: PrizeCategoriesConfig;
  instantPrizes: Array<{id: string, number: string, value: number}>;
  winnerCount: number;
  prizes: Array<{position: number, prizeId?: string, name: string, value: string, image?: string}>;
  enableCombos: boolean;
  combos: Array<{ quantity: number, discountPercentage: number }>;
};

// Simplified schema that matches the type
const raffleFormSchema = z.object({
  title: z.string().min(1, 'O título é obrigatório'),
  description: z.string().min(1, 'A descrição é obrigatória'),
  price: z.number().min(0.01, 'O preço deve ser maior que zero'),
  totalNumbers: z.number().min(1, 'O número de bilhetes deve ser maior que zero'),
  drawDate: z.string().min(1, 'A data do sorteio é obrigatória'),
  images: z.array(z.any()).min(1, 'Pelo menos uma imagem é obrigatória'),
  regulation: z.string().optional(),
  mainPrize: z.string().optional(),
  valuePrize: z.string().optional(),
  returnExpected: z.string().optional(),
  isScheduled: z.boolean(),
  scheduledDate: z.string().optional(),
  prizeCategories: z.any().optional(),
  instantPrizes: z.array(z.any()),
  winnerCount: z.number().min(1, 'Pelo menos um vencedor é necessário').max(5, 'Máximo de 5 vencedores permitidos'),
  prizes: z.array(
    z.object({
      position: z.number(),
      prizeId: z.string().optional(),
      name: z.string(),
      value: z.string(),
      image: z.string().optional()
    })
  ).min(1, 'Pelo menos um prêmio é necessário'),
  enableCombos: z.boolean().optional().default(false),
  combos: z.array(
    z.object({
      quantity: z.number().min(2, 'Quantidade mínima de 2 números'),
      discountPercentage: z.number().min(1, 'Desconto mínimo de 1%').max(50, 'Desconto máximo de 50%')
    })
  ).optional().default([])
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

const RaffleFormFields: React.FC<RaffleFormFieldsProps> = ({
  onSubmit,
  initialData = {},
  isSubmitting = false
}) => {
  // Configurar React Hook Form
  const defaultValues = {
    title: initialData.title || '',
    description: initialData.description || '',
    price: initialData.price || 0,
    totalNumbers: initialData.totalNumbers || 100,
    drawDate: initialData.drawDate || '',
    images: initialData.images || [],
    regulation: initialData.regulation || '',
    mainPrize: initialData.mainPrize || '',
    valuePrize: initialData.valuePrize || '',
    returnExpected: initialData.returnExpected || '',
    isScheduled: initialData.isScheduled || false,
    scheduledDate: initialData.scheduledDate || '',
    prizeCategories: initialData.prizeCategories || {
      diamante: { active: false, quantity: 10, value: 2000 },
      master: { active: false, quantity: 20, value: 1000 },
      premiado: { active: false, quantity: 50, value: 500 }
    },
    instantPrizes: initialData.instantPrizes || [],
    winnerCount: initialData.winnerCount || 1,
    prizes: initialData.prizes || [{
      position: 1,
      name: initialData.mainPrize || '',
      value: initialData.valuePrize || '',
      image: ''
    }],
    enableCombos: initialData.enableCombos || false,
    combos: initialData.combos || [
      { quantity: 5, discountPercentage: 5 },
      { quantity: 10, discountPercentage: 10 },
      { quantity: 20, discountPercentage: 15 }
    ]
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
  const price = watch('price');
  
  // Observar número de vencedores
  const winnerCount = watch('winnerCount');
  const prizes = watch('prizes');
  
  // Carregar prêmios mock quando o componente montar
  useEffect(() => {
    console.log('Loading MOCK_PRIZES:', MOCK_PRIZES);
    setAvailablePrizes(MOCK_PRIZES);
  }, []);
  
  // Adicionar o efeito para calcular o valor total dos prêmios
  useEffect(() => {
    if (prizes && prizes.length > 0) {
      const total = prizes.reduce((sum: number, prize) => {
        if (!prize.name || !prize.value) return sum;
        
        console.log('prize.value', prize.value);
        // Verificar se o valor é uma string numérica e convertê-la
        const prizeValue = typeof prize.value === 'string' 
          ? parseFloat(prize.value.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.')) || 0 
          : 0;
        console.log('parsed prizeValue:', prizeValue);
        return sum + prizeValue;
      }, 0);
      setTotalPrizeValue(total);
    } else {
      setTotalPrizeValue(0);
    }
  }, [prizes]);
  
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
  
  // Efeito para atualizar a lista de prêmios quando o número de vencedores muda
  useEffect(() => {
    const currentPrizes = [...prizes];
    
    // Se aumentou o número de vencedores, adicionar novos prêmios vazios
    if (winnerCount > currentPrizes.length) {
      for (let i = currentPrizes.length + 1; i <= winnerCount; i++) {
        currentPrizes.push({
          position: i,
          name: '',
          value: '',
          image: ''
        });
      }
    } 
    // Se diminuiu o número de vencedores, remover os excedentes
    else if (winnerCount < currentPrizes.length) {
      currentPrizes.splice(winnerCount);
    }
    
    setValue('prizes', currentPrizes);
  }, [winnerCount, setValue]);
  
  // Efeito para sincronizar o prêmio principal selecionado com o primeiro prêmio
  useEffect(() => {
    if (selectedPrize && prizes?.length > 0) {
      const updatedPrizes = [...prizes];
      updatedPrizes[0] = {
        ...updatedPrizes[0],
        prizeId: selectedPrize._id?.toString(),
        name: selectedPrize.name,
        value: selectedPrize.value,
        image: selectedPrize.image
      };
      setValue('prizes', updatedPrizes);
    }
  }, [selectedPrize, setValue]);
  
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
    const newId = `prize-${Date.now()}`;
    setValue('instantPrizes', [...currentPrizes, { id: newId, number: '', value: 0 }]);
  };
  
  const handleRemoveInstantPrize = (id: string) => {
    const currentPrizes = getValues('instantPrizes');
    setValue('instantPrizes', currentPrizes.filter(prize => prize.id !== id));
  };
  
  const handleInstantPrizeChange = (id: string, field: 'number' | 'value', value: string) => {
    const currentPrizes = getValues('instantPrizes');
    const updatedPrizes = currentPrizes.map(prize => {
      if (prize.id === id) {
        if (field === 'value') {
          return { ...prize, [field]: parseFloat(value) || 0 };
        }
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
      const updatedPrizes = [...prizes];
      updatedPrizes[position - 1] = {
        position,
        prizeId: prize._id?.toString(),
        name: prize.name,
        value: prize.value,
        image: prize.image
      };
      setValue('prizes', updatedPrizes);
      
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
    setValue('winnerCount', parseInt(value));
  };
  
  // Função para preparar dados para API
  const prepareFormDataForApi = (data: RaffleFormData): any => {
    const apiData = { ...data };
    
    // Formatar dados para a estrutura da API
    const formattedData = {
      title: data.title,
      description: data.description,
      individualNumberPrice: data.price,
      totalNumbers: data.totalNumbers,
      drawDate: new Date(data.drawDate),
      images: data.images,
      regulation: data.regulation || '',
      returnExpected: data.returnExpected || '',
      isScheduled: data.isScheduled,
      scheduledActivationDate: data.isScheduled && data.scheduledDate ? new Date(data.scheduledDate) : null,
      
      // Configurar distribuição de prêmios para múltiplos vencedores
      prizeDistribution: data.prizes.map((prize, index) => ({
        position: index + 1,
        prizes: prize.prizeId ? [prize.prizeId] : [],
        description: `${index === 0 ? 'Prêmio principal' : `${index + 1}º lugar`}: ${prize.name || 'Não especificado'}`
      })),
      
      // Prêmios instantâneos serão enviados separadamente
      instantPrizes: [] as Array<{
        number: string;
        value: number;
        categoryId?: string;
      }>
    };
    
    // Adicionar ID do prêmio principal se estiver disponível
    if (selectedPrize && selectedPrize._id) {
      formattedData.prizeDistribution[0].prizes.push(selectedPrize._id as never);
    }
    
    // Converter categorias de prêmios para o formato de instantPrizes
    if (data.prizeCategories) {
      const { diamante, master, premiado } = data.prizeCategories;
      
      // Diamante
      if (diamante.active) {
        const startNumber = 1001; // Número inicial para categoria diamante
        for (let i = 0; i < diamante.quantity; i++) {
          formattedData.instantPrizes.push({
            number: String(startNumber + i).padStart(6, '0'),
            value: diamante.value,
            categoryId: 'diamante' // Você precisará do ID real da categoria
          });
        }
      }
      
      // Master
      if (master.active) {
        const startNumber = 1101; // Número inicial para categoria master
        for (let i = 0; i < master.quantity; i++) {
          formattedData.instantPrizes.push({
            number: String(startNumber + i).padStart(6, '0'),
            value: master.value,
            categoryId: 'master' // Você precisará do ID real da categoria
          });
        }
      }
      
      // Premiado
      if (premiado.active) {
        const startNumber = 1201; // Número inicial para categoria premiado
        for (let i = 0; i < premiado.quantity; i++) {
          formattedData.instantPrizes.push({
            number: String(startNumber + i).padStart(6, '0'),
            value: premiado.value,
            categoryId: 'premiado' // Você precisará do ID real da categoria
          });
        }
      }
    }
    
    // Adicionar prêmios instantâneos definidos manualmente
    data.instantPrizes.forEach(prize => {
      formattedData.instantPrizes.push({
        number: prize.number,
        value: prize.value
      });
    });
    
    return formattedData;
  };
  
  // Filtrar prêmios com base na busca
  
  // Handler para envio do formulário
  const onFormSubmit = (data: RaffleFormData) => {
    console.log('data', data);
    const apiData = prepareFormDataForApi(data);
    onSubmit(apiData);
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
                name="winnerCount"
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
              R$ {totalPrizeValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span>valor total em prêmios</span>
            </PrizeAmountValue>
            
            <PrizeCountBadge>
              <FaTrophy /> {prizes.filter(p => p.name).length} de {winnerCount} prêmios configurados
            </PrizeCountBadge>
          </TotalPrizeDisplay>

          <PrizeListContainer>
            {prizes.map((prize, index) => (
              prize.name ? (
                <NewPrizeCard key={`prize-position-${index}`} $position={index + 1}>
                  <NewPositionBadge $position={index + 1}>
                    {index === 0 ? '🏆 Grande Prêmio' : index === 1 ? '🥈 2º Lugar' : index === 2 ? '🥉 3º Lugar' : `🎖️ ${index + 1}º Lugar`}
                  </NewPositionBadge>
                  
                  <NewPrizeContent>
                    {prize.image && (
                      <NewPrizeImageContainer>
                        <NewPrizeImage src={prize.image} alt={prize.name} />
                      </NewPrizeImageContainer>
                    )}
                    
                    <NewPrizeInfo>
                      <NewPrizeName>{prize.name}</NewPrizeName>
                      <NewPrizeValue>
                        <FaMoneyBill /> 
                        {prize.value}
                      </NewPrizeValue>
                    </NewPrizeInfo>
                  </NewPrizeContent>
                  
                  <NewPrizeActions>
                    <PrizeActionButton 
                      $variant="danger"
                      onClick={() => {
                        const updatedPrizes = [...prizes];
                        updatedPrizes[index] = {
                          position: index + 1,
                          name: '',
                          value: '',
                          image: ''
                        };
                        setValue('prizes', updatedPrizes);
                        
                        if (index === 0) {
                          handleClearSelectedPrize();
                        }
                      }}
                      title="Remover prêmio"
                    >
                      <FaTrashAlt /> Remover prêmio
                    </PrizeActionButton>
                  </NewPrizeActions>
                </NewPrizeCard>
              ) : index === 0 ? (
                // Interface especial para o primeiro prêmio quando está vazio
                <EmptyFirstPrize 
                  key={`prize-position-${index}`}
                  onClick={() => handleSelectPrizeForPosition(index + 1)}
                >
                  <EmptyFirstPrizeIcon>
                    <FaTrophy />
                  </EmptyFirstPrizeIcon>
                  
                  <div>
                    <EmptyFirstPrizeTitle>Adicione o Prêmio Principal</EmptyFirstPrizeTitle>
                    <EmptyFirstPrizeText>
                      Escolha um prêmio atrativo para sua rifa. Um bom prêmio principal aumenta significativamente o interesse e as vendas.
                    </EmptyFirstPrizeText>
                  </div>
                  
                  <PrizeButtonGroup>
                    <PrizeSelectButton 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPrizeForPosition(index + 1);
                      }}
                    >
                      <FaPlusCircle /> Selecionar prêmio existente
                    </PrizeSelectButton>
                    
                    {/* <PrizeCreationButton 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openNewPrizeModal();
                      }}
                    >
                      <FaPlus /> Criar novo prêmio
                    </PrizeCreationButton> */}
                  </PrizeButtonGroup>
                </EmptyFirstPrize>
              ) : (
                // Interface para os prêmios secundários quando vazios
                <ModernEmptyPrizeCard key={`prize-position-${index}`}>
                  <NewPositionBadge $position={index + 1}>
                    {index === 1 ? '🥈 2º Lugar' : index === 2 ? '🥉 3º Lugar' : `🎖️ ${index + 1}º Lugar`}
                  </NewPositionBadge>
                  
                  <ModernEmptyPrizeContainer>
                    <ModernEmptyPrizeIcon>
                      <FaGift />
                    </ModernEmptyPrizeIcon>
                    <ModernEmptyPrizeText>
                      Adicione um prêmio para o {index + 1}º lugar
                    </ModernEmptyPrizeText>
                    
                    <PrizeSelectButton 
                      onClick={() => handleSelectPrizeForPosition(index + 1)}
                    >
                      <FaPlusCircle /> Selecionar prêmio
                    </PrizeSelectButton>
                  </ModernEmptyPrizeContainer>
                </ModernEmptyPrizeCard>
              )
            ))}
          </PrizeListContainer>

          <FormRow>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <FormInput
                  id="price"
                  label="Preço por Número"
                  icon={<FaMoneyBillWave />}
                  placeholder="Ex: 10.00"
                  type="number"
                  value={field.value || ''}
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                  onBlur={field.onBlur}
                  error={errors.price?.message}
                  disabled={isSubmitting}
                  required
                  min={0}
                  step="0.01"
                />
              )}
            />
            
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
                />
              )}
            />
          </FormRow>
          
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
              name="scheduledDate"
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
                  error={errors.scheduledDate?.message}
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
                onPrizeConfigChange={config => field.onChange(config)}
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