'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaPlus, 
  FaSave, 
  FaTimes,
  FaGift,
  FaMoneyBillWave,
  FaFileAlt,
  FaTags
} from 'react-icons/fa';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import FormInput from '@/components/common/FormInput';
import FormTextArea from '@/components/common/FormTextArea';
import CustomDropdown from '@/components/common/CustomDropdown';
import MultipleImageUploader from '@/components/upload/MultipleImageUploader';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { prizeSchema } from '@/zod/prize.schema';
import type { PrizeForm } from '@/zod/prize.schema';
import { useHookFormMask } from 'use-mask-input';
import mongoose from 'mongoose';

// Tipos
interface PrizeCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrizeCreated: (prize: IPrize) => void;
}

// Componentes estilizados
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

const PrizeFormContainer = styled.div`
  margin-top: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
          color: white;
          border: none;
          box-shadow: 0 4px 6px rgba(106, 17, 203, 0.1);
          
          &:hover {
            box-shadow: 0 6px 10px rgba(106, 17, 203, 0.2);
            transform: translateY(-1px);
          }
          
          &:active {
            transform: translateY(0);
          }
          
          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
        `;
      case 'danger':
        return `
          background-color: #fee2e2;
          color: #ef4444;
          border: 1px solid #fecaca;
          
          &:hover {
            background-color: #fecaca;
          }
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #e5e7eb;
          
          &:hover {
            background-color: #e5e7eb;
          }
        `;
    }
  }}
`;

// Styled component that extends MultipleImageUploader
const BannerImageUploader = styled(MultipleImageUploader)`
  h3 {
    &:first-child {
      &::after {
        display: inline;
      }
      span:first-child {
        display: none;
      }
    }
  }
`;

// Mock category data
const MOCK_CATEGORIES = [
  { value: "electronics", label: "Eletrônicos" },
  { value: "home", label: "Casa e Decoração" },
  { value: "vehicle", label: "Veículos" },
  { value: "travel", label: "Viagens" },
  { value: "services", label: "Serviços" },
  { value: "others", label: "Outros" }
];

// Componente principal
const PrizeCreatorModal: React.FC<PrizeCreatorModalProps> = ({
  isOpen,
  onClose,
  onPrizeCreated
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<PrizeForm>({
    resolver: zodResolver(prizeSchema),
    mode: 'all',
    defaultValues: {
      name: '',
      description: '',
      value: '',
    }
  });

  const registerWithMask = useHookFormMask(register);
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // Reset form quando o modal é fechado
  const handleClose = () => {
    reset();
    setMainImageFile(null);
    setAdditionalImageFiles([]);
    setSelectedCategory('');
    onClose();
  };
  
  const handleBannerImageChange = (files: File[]) => {
    if (files.length > 0) {
      setMainImageFile(files[0]);
    } else {
      setMainImageFile(null);
    }
  };
  
  const handleAdditionalImagesChange = (files: File[]) => {
    setAdditionalImageFiles(files);
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const onSubmitForm = async (data: PrizeForm) => {
    if (!mainImageFile) {
      alert('Por favor, adicione uma imagem para o prêmio.');
      return;
    }
    
    try {
      setIsSaving(true);
      
      // Em um ambiente real, você enviaria isso para uma API
      // Simular dados do prêmio
      const createdPrize: IPrize = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: data.name,
        description: data.description || '',
        value: data.value,
        image: URL.createObjectURL(mainImageFile),
        images: additionalImageFiles.map(file => URL.createObjectURL(file)),
        categoryId: selectedCategory as unknown as mongoose.Types.ObjectId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Notificar componente pai
      onPrizeCreated(createdPrize);
      
      // Fechar modal
      handleClose();
      
    } catch (error) {
      console.error('Erro ao salvar prêmio:', error);
      alert('Não foi possível salvar o prêmio. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>
            <FaPlus /> Adicionar Novo Prêmio
          </ModalTitle>
          <CloseButton onClick={handleClose} title="Fechar">
            &times;
          </CloseButton>
        </ModalHeader>
        
        <PrizeFormContainer>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <FormGroup>
              <MultipleImageUploader
                id="additionalImages"
                maxImages={8}
                onChange={handleAdditionalImagesChange}
                value={additionalImageFiles}
                label="Imagens Adicionais"
                maxSizeInMB={5}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
              />
            </FormGroup>
            
            <FormGroup>
              <FormInput
                id="name"
                label="Nome do Prêmio"
                {...register('name')}
                icon={<FaGift />}
                placeholder="Ex: iPhone 14 Pro Max"
                disabled={isSaving}
                error={errors.name?.message}
                required
                fullWidth
              />
            </FormGroup>
            
            <FormGroup>
              <CustomDropdown
                options={MOCK_CATEGORIES}
                value={selectedCategory}
                onChange={handleCategoryChange}
                placeholder="Selecione uma categoria"
                icon={<FaTags />}
                disabled={isSaving}
              />
            </FormGroup>
            
            <FormGroup>
              <FormTextArea
                id="description"
                label="Descrição"
                icon={<FaFileAlt />}
                {...register('description')}
                placeholder="Descreva o prêmio em detalhes..."
                disabled={isSaving}
                error={errors.description?.message}
                fullWidth
                required
                rows={5}
              />
            </FormGroup>
            
            <FormGroup>
              <FormInput
                id="value"  
                label="Valor"
                icon={<FaMoneyBillWave />}
                {...registerWithMask('value', '0.000.000.000,00')}
                placeholder="Ex: R$ 5.000,00" 
                disabled={isSaving}
                error={errors.value?.message}
                required
                fullWidth
              />
            </FormGroup>
            
            <ButtonGroup>
              <Button 
                type="button" 
                onClick={handleClose}
                disabled={isSaving}
              >
                <FaTimes />
                Cancelar
              </Button>
              
              <Button 
                type="submit" 
                $variant="primary"
                disabled={isSaving}
              >
                <FaSave />
                {isSaving ? 'Salvando...' : 'Salvar Prêmio'}
              </Button>
            </ButtonGroup>
          </form>
        </PrizeFormContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default PrizeCreatorModal; 