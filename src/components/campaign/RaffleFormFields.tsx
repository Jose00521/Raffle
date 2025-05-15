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
  FaRegCalendarAlt
} from 'react-icons/fa';
import MultipleImageUploader from '../upload/MultipleImageUploader';
import FormInput from '../common/FormInput';
import FormTextArea from '../common/FormTextArea';
import FormDatePicker from '../common/FormDatePicker';
import AdvancedDateTimePicker from '../common/AdvancedDateTimePicker';
import WysiwygEditor from '../common/WysiwygEditor';
import PrizeConfigForm from '../raffle/PrizeConfigForm';

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

// Interface for form data
export interface RaffleFormData {
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
}

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

const RaffleFormFields: React.FC<RaffleFormFieldsProps> = ({
  onSubmit,
  initialData = {},
  isSubmitting = false
}) => {
  // Form state with default values from initialData
  const [formData, setFormData] = useState<RaffleFormData>({
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
    instantPrizes: initialData.instantPrizes || []
  });
  
  // Form validation
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Selected dates
  const [selectedDrawDate, setSelectedDrawDate] = useState<Date | null>(
    formData.drawDate ? new Date(formData.drawDate) : null
  );
  
  const [selectedScheduledDate, setSelectedScheduledDate] = useState<Date | null>(
    formData.scheduledDate ? new Date(formData.scheduledDate) : null
  );
  
  // Effect para atualizar o formulário quando totalNumbers muda
  useEffect(() => {
    if (formData.totalNumbers && formData.prizeCategories) {
      // Verificar se alguma categoria excede o total de números
      const totalAssigned = Object.values(formData.prizeCategories).reduce((sum, category) => 
        category.active ? sum + category.quantity : sum, 0
      );
      
      // Se o total atribuído excede o total disponível, ajustar proporcionalmente
      if (totalAssigned > formData.totalNumbers) {
        const ratio = formData.totalNumbers / totalAssigned;
        
        const updatedCategories = { ...formData.prizeCategories };
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
          setFormData({
            ...formData,
            prizeCategories: updatedCategories
          });
        }
      }
    }
  }, [formData.totalNumbers]);
  
  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // For number inputs, convert value to number
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };
  
  // Handle toggle change
  const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  // Handle date change for draw date
  const handleDrawDateChange = (date: Date | null) => {
    setSelectedDrawDate(date);
    if (date) {
      setFormData({ ...formData, drawDate: date.toISOString() });
      
      // Clear error
      if (errors.drawDate) {
        setErrors({ ...errors, drawDate: '' });
      }
    } else {
      setFormData({ ...formData, drawDate: '' });
    }
  };
  
  // Handle date change for scheduled date
  const handleScheduledDateChange = (date: Date | null) => {
    setSelectedScheduledDate(date);
    if (date) {
      setFormData({ ...formData, scheduledDate: date.toISOString() });
      
      // Clear error
      if (errors.scheduledDate) {
        setErrors({ ...errors, scheduledDate: '' });
      }
    } else {
      setFormData({ ...formData, scheduledDate: '' });
    }
  };
  
  // Handle image upload
  const handleImagesChange = (files: File[]) => {
    setFormData({ ...formData, images: files });
    
    // Clear error for images
    if (errors.images) {
      setErrors({ ...errors, images: '' });
    }
  };
  
  // Handle Prize Config Change
  const handlePrizeConfigChange = (config: PrizeCategoriesConfig) => {
    setFormData({
      ...formData,
      prizeCategories: config
    });
  };
  
  // Manter handlers originais para compatibilidade
  const handleAddInstantPrize = () => {
    const newPrize = {
      id: `prize-${Date.now()}`,
      number: '',
      value: 0
    };
    
    setFormData({
      ...formData,
      instantPrizes: [...formData.instantPrizes, newPrize]
    });
  };
  
  const handleInstantPrizeChange = (id: string, field: 'number' | 'value', value: string) => {
    const updatedPrizes = formData.instantPrizes.map(prize => {
      if (prize.id === id) {
        if (field === 'value') {
          return { ...prize, [field]: parseFloat(value) || 0 };
        }
        return { ...prize, [field]: value };
      }
      return prize;
    });
    
    setFormData({ ...formData, instantPrizes: updatedPrizes });
  };
  
  const handleRemoveInstantPrize = (id: string) => {
    const updatedPrizes = formData.instantPrizes.filter(prize => prize.id !== id);
    setFormData({ ...formData, instantPrizes: updatedPrizes });
  };
  
  // Form validation function
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'O título é obrigatório';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'A descrição é obrigatória';
    }
    
    if (formData.price <= 0) {
      newErrors.price = 'O preço deve ser maior que zero';
    }
    
    if (formData.totalNumbers <= 0) {
      newErrors.totalNumbers = 'O número de bilhetes deve ser maior que zero';
    }
    
    if (!formData.drawDate) {
      newErrors.drawDate = 'A data do sorteio é obrigatória';
    }
    
    if (formData.images.length === 0) {
      newErrors.images = 'Pelo menos uma imagem é obrigatória';
    }
    
    if (formData.isScheduled && !formData.scheduledDate) {
      newErrors.scheduledDate = 'A data de agendamento é obrigatória quando agendado';
    }
    
    // Validar que pelo menos uma categoria de prêmio está ativa
    const hasActivePrizeCategory = formData.prizeCategories && 
      (formData.prizeCategories.diamante.active || 
       formData.prizeCategories.master.active || 
       formData.prizeCategories.premiado.active);
       
    if (!hasActivePrizeCategory && formData.instantPrizes.length === 0) {
      newErrors.prizeCategories = 'Pelo menos uma categoria de prêmio deve estar ativa';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Form submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Converter dados antes de enviar para a API
      const apiFormData = prepareFormDataForApi(formData);
      onSubmit(apiFormData);
    } else {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.getElementsByName(firstError)[0];
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };
  
  // Prepara os dados do formulário para a API
  const prepareFormDataForApi = (data: RaffleFormData): RaffleFormData => {
    const apiData = { ...data };
    
    // Converter categorias de prêmios para o formato de instantPrizes se necessário
    if (apiData.prizeCategories) {
      const { diamante, master, premiado } = apiData.prizeCategories;
      const newInstantPrizes = [...apiData.instantPrizes];
      
      // Incluir prêmios das categorias ativas
      // Diamante
      if (diamante.active) {
        const startNumber = 1001; // Número inicial para categoria diamante
        for (let i = 0; i < diamante.quantity; i++) {
          newInstantPrizes.push({
            id: `prize-diamante-${i}`,
            number: String(startNumber + i).padStart(6, '0'),
            value: diamante.value
          });
        }
      }
      
      // Master
      if (master.active) {
        const startNumber = 1101; // Número inicial para categoria master
        for (let i = 0; i < master.quantity; i++) {
          newInstantPrizes.push({
            id: `prize-master-${i}`,
            number: String(startNumber + i).padStart(6, '0'),
            value: master.value
          });
        }
      }
      
      // Premiado
      if (premiado.active) {
        const startNumber = 1201; // Número inicial para categoria premiado
        for (let i = 0; i < premiado.quantity; i++) {
          newInstantPrizes.push({
            id: `prize-premiado-${i}`,
            number: String(startNumber + i).padStart(6, '0'),
            value: premiado.value
          });
        }
      }
      
      apiData.instantPrizes = newInstantPrizes;
    }
    
    return apiData;
  };
  
  return (
    <FormContainer>
      <form onSubmit={handleSubmit}>
        {/* Basic Information Section */}
        <FormSection>
          <SectionTitle>
            <FaInfo /> Informações Básicas
          </SectionTitle>
          
          <FormInput
            id="title"
            label="Título da Rifa"
            icon={<FaEdit />}
            placeholder="Ex: iPhone 15 Pro Max - 256GB"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            disabled={isSubmitting}
            required
            fullWidth
          />
          
          <FormTextArea
            id="description"
            label="Descrição"
            icon={<FaEdit />}
            placeholder="Descreva a sua rifa em detalhes"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            disabled={isSubmitting}
            required
            fullWidth
            rows={5}
          />
          <HelpText>Uma boa descrição aumenta as chances de venda dos números.</HelpText>
          
          <SubSectionDivider />
          <FormInput
            id="mainPrize"
            label="Prêmio Principal"
            icon={<FaTrophy />}
            placeholder="Ex: iPhone 15 Pro Max - 256GB"
            value={formData.mainPrize}
            onChange={handleChange}
            disabled={isSubmitting}
            fullWidth
          />
          
          <FormRow>
            <FormInput
              id="valuePrize"
              label="Valor do Prêmio"
              icon={<FaMoneyBill />}
              placeholder="Ex: R$ 10.000,00"
              value={formData.valuePrize}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            
            <FormInput
              id="returnExpected"
              label="Retorno Esperado"
              icon={<FaPercentage />}
              placeholder="Ex: R$ 5.000,00"
              value={formData.returnExpected}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </FormRow>

          <SubSectionDivider />

          <FormInput
              id="totalNumbers"
              label="Total de Números"
              icon={<FaHashtag />}
              placeholder="Ex: 100"
              type="number"
              value={formData.totalNumbers || ''}
              onChange={handleChange}
              error={errors.totalNumbers}
              disabled={isSubmitting}
              required
              min={1}
              step="1"
            />
          
          <FormRow>
            <FormInput
              id="price"
              label="Preço por Número"
              icon={<FaMoneyBillWave />}
              placeholder="Ex: 10.00"
              type="number"
              value={formData.price || ''}
              onChange={handleChange}
              error={errors.price}
              disabled={isSubmitting}
              required
              min={0}
              step="0.01"
            />
            
            
            <FormDatePicker
              id="drawDate"
              label="Data do Sorteio"
              icon={<FaCalendarAlt />}
              placeholder="Selecione a data"
              selected={selectedDrawDate}
              onChange={handleDrawDateChange}
              error={errors.drawDate}
              disabled={isSubmitting}
              required
              minDate={new Date()}
              showYearDropdown
              showMonthDropdown
              dateFormat="dd/MM/yyyy"
              showTimeSelect={false}
              isClearable
            />
          </FormRow>
        </FormSection>
        
        {/* Upload Images Section */}
        <FormSection>
          <SectionTitle>
            <FaCloudUploadAlt /> Imagens
          </SectionTitle>
          
          <MultipleImageUploader
            maxImages={10}
            onChange={handleImagesChange}
            value={formData.images}
            maxSizeInMB={5}
          />
          {errors.images && (
            <ErrorText>
              <FaExclamationTriangle /> {errors.images}
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
          
          <WysiwygEditor
            id="regulation"
            label="Regulamento da Rifa"
            icon={<FaListOl />}
            placeholder="Descreva as regras e condições da sua rifa..."
            value={formData.regulation}
            onChange={handleChange}
            disabled={isSubmitting}
            fullWidth
            minHeight="250px"
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
              <input
                type="checkbox"
                name="isScheduled"
                checked={formData.isScheduled}
                onChange={handleToggleChange}
                disabled={isSubmitting}
              />
              <ToggleSlider />
            </ToggleSwitch>
            <ToggleLabel>
              Agendar publicação da rifa
            </ToggleLabel>
          </ToggleContainer>
          
          {formData.isScheduled && (
            <AdvancedDateTimePicker
              value={selectedScheduledDate}
              onChange={handleScheduledDateChange}
              minDate={new Date()}
              label="Data de Publicação"
              icon={<FaRegCalendarAlt />}
              placeholder="Selecione a data e hora"
              required={formData.isScheduled}
              error={errors.scheduledDate}
              disabled={isSubmitting}
            />
          )}
        </FormSection>
        
        {/* Prize Configuration Section */}
        <FormSection>
          <SectionTitle>
            <FaGift /> Configuração de Prêmios
          </SectionTitle>
          
          <PrizeConfigForm
            totalNumbers={formData.totalNumbers}
            onPrizeConfigChange={handlePrizeConfigChange}
            disabled={isSubmitting}
          />
          {errors.prizeCategories && (
            <ErrorText>
              <FaExclamationTriangle /> {errors.prizeCategories}
            </ErrorText>
          )}
        </FormSection>
      </form>
    </FormContainer>
  );
};

export default RaffleFormFields; 