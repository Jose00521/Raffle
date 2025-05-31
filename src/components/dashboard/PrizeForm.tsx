import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaTrash, FaSave, FaTimes, FaGift, FaMoneyBillWave, FaFileAlt, FaList, FaTags, FaExclamationCircle } from 'react-icons/fa';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';
import MultipleImageUploader from '@/components/upload/MultipleImageUploader';
import CustomDropdown from '@/components/common/CustomDropdown';
import mongoose from 'mongoose';
import FormInput from '../common/FormInput';
import FormTextArea from '../common/FormTextArea';
import { zodResolver } from '@hookform/resolvers/zod';
import { prizeSchema } from '@/zod/prize.schema';
import { useForm } from 'react-hook-form';
import type { PrizeForm } from '@/zod/prize.schema';
import { useHookFormMask } from 'use-mask-input';
import { fadeIn } from '@/styles/registration.styles';
import CurrencyInput from '../common/CurrencyInput';

interface PrizeFormProps {
  initialData?: Partial<IPrize>;
  onSubmit: (data: Partial<{
    name: string;
    description: string;
    value: string;
    image: File;
    images: File[];
    categoryId: mongoose.Types.ObjectId;
  }>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const FormWrapper = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0 0 24px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const FormLabel = styled.label`
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 4px;
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

const ImageUploadContainer = styled.div`
  margin-bottom: 24px;
`;

const UploadArea = styled.div<{ $isDragActive?: boolean }>`
  border: 2px dashed ${({ $isDragActive, theme }) => 
    $isDragActive 
      ? theme.colors?.primary || '#6a11cb' 
      : 'rgba(0, 0, 0, 0.15)'
  };
  border-radius: 8px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.2s ease;
  background-color: ${({ $isDragActive }) => 
    $isDragActive ? 'rgba(106, 17, 203, 0.05)' : 'transparent'
  };
  cursor: pointer;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
    background-color: rgba(106, 17, 203, 0.03);
  }
`;

const UploadIcon = styled.div`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  margin-bottom: 12px;
`;

const UploadText = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 8px;
`;

const UploadHint = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#999'};
`;

const ImagePreviewContainer = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const ImagePreview = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.7);
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${fadeIn} 0.2s ease;
  position: relative;
  background-color: rgba(239, 68, 68, 0.1);
  padding: 10px 12px;
  border-radius: 6px;
  border-left: 3px solid #ef4444;
  
  @media (max-height: 800px) {
    margin-top: 10px;
    font-size: 0.85rem;
    padding: 8px 10px;
  }
  
  @media (max-height: 700px) {
    margin-top: 8px;
    font-size: 0.8rem;
    padding: 6px 8px;
  }
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 16px;
  min-height: 16px;
  color: #ef4444;
`;

// Styled component that extends MultipleImageUploader
const ProductImagesUploader = styled(MultipleImageUploader)`
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

// Styled component for the banner image uploader
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

// Prevent form submission when interacting with image uploaders
const PreventSubmitWrapper = ({ children }: { children: React.ReactNode }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Apenas previne submits com Enter, mas permite outros eventos
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
    }
  };
  
  return (
    <div onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};

// Mock category data
const MOCK_CATEGORIES = [
  { value: "electronics", label: "Eletrônicos" },
  { value: "home", label: "Casa e Decoração" },
  { value: "vehicle", label: "Veículos" },
  { value: "travel", label: "Viagens" },
  { value: "services", label: "Serviços" },
  { value: "others", label: "Outros" }
];

const PrizeForm: React.FC<PrizeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  // Helper function to convert MongoDB ObjectId to string if needed
  const getCategoryIdAsString = (category?: mongoose.Types.ObjectId | string): string => {
    if (!category) return '';
    return category.toString();
  };
  
  const [formData, setFormData] = useState<Partial<IPrize>>({
    image: '',
    images: [],
    ...initialData
  });

  const {
    register,
    handleSubmit,
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
  
  // Keep track of the selected category as a string for the dropdown
  const [selectedCategory, setSelectedCategory] = useState<string>(
    getCategoryIdAsString(initialData?.categoryId)
  );
  
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [bannerImageFiles, setBannerImageFiles] = useState<File[]>([]);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [errorsImage, setErrorsImage] = useState<Record<string, string>>({});
  
  // Preview URLs for uploaded images
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(
    formData.image || null
  );
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>(
    formData.images || []
  );
  
  // Update preview when main image file changes
  useEffect(() => {
    console.log("mainImageFile",mainImageFile);
    if (!mainImageFile) return;
    
    const objectUrl = URL.createObjectURL(mainImageFile);
    setMainImagePreview(objectUrl);
    
    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  }, [mainImageFile]);
  
  // Update previews when additional image files change
  useEffect(() => {
    const objectUrls = additionalImageFiles.map(file => URL.createObjectURL(file));
    setAdditionalImagePreviews(prev => {
      // Keep existing URLs for images that were already in formData
      const originalUrls = formData.images || [];
      return [...originalUrls, ...objectUrls];
    });
    
    // Clean up preview URLs when component unmounts
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [additionalImageFiles]);

  // Verificar se há imagens no carregamento inicial
  useEffect(() => {
    if (additionalImageFiles.length === 0 && !initialData?.images?.length) {
      setErrorsImage({ image: 'É necessário pelo menos uma imagem' });
    }
  }, []);
  
  // Forçar a verificação de imagens antes do submit
  const validateImagesBeforeSubmit = () => {
    if (additionalImageFiles.length === 0) {
      setErrorsImage({ image: 'É necessário pelo menos uma imagem' });
      
      // Adicionar um pequeno delay para garantir que o erro seja exibido
      setTimeout(() => {
        const errorElement = document.getElementById('images-error');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      
      return false;
    }
    
    return true;
  };
  
  const handleBannerImageChange = (files: File[]) => {
    // If files array is not empty, use the first file as main image
    if (files.length > 0) {
      setMainImageFile(files[0]);
      
      // Clear error for image if it exists
      if (errorsImage.image) {
        setErrorsImage(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    } else {
      // If files array is empty, clear the main image
      setMainImageFile(null);
      setMainImagePreview(null);
    }
  };
  
  const handleAdditionalImagesChange = (files: File[]) => {
    setAdditionalImageFiles(files);
    // Limpar erros quando imagens são adicionadas
    if (files.length > 0 && errorsImage.image) {
      setErrorsImage({});
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // We'll handle the actual category creation at submission time
  };
  
  const handleRemoveExistingImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
  };
  
  
  const onSubmitForm = async (data: Partial<IPrize>) => {
    // Prevent default form submission behavior
    
    // Validar imagens primeiro
    if (!validateImagesBeforeSubmit()) {
      return;
    }
    
    // In a real application, you would upload the images to your server/cloud storage
    // and get back URLs to store in the database
    // For this demonstration, we'll just pass the current state
    console.log("additionalImageFiles",additionalImageFiles);
    console.log("mainImageFile",mainImageFile);
    
    // Create submission data
    const submissionData = {
      ...data,
      // A primeira imagem é a imagem principal
      image: additionalImageFiles[0],
      // Todas as imagens a partir da segunda são imagens adicionais
      images: additionalImageFiles.slice(1),
    };
    
    // Add category if selected
    if (selectedCategory) {
      // In a real app with MongoDB:
      // submissionData.category = new mongoose.Types.ObjectId(selectedCategory);
      
      // For mock version (type casting for TypeScript):
      submissionData.categoryId = selectedCategory as unknown as mongoose.Types.ObjectId;
    }

    console.log("submissionData",submissionData);

    onSubmit(submissionData);
  };
  
  return (
    <FormWrapper>
      <FormTitle>
        {initialData?._id ? 'Editar Prêmio' : 'Adicionar Novo Prêmio'}
      </FormTitle>
      
      <form onSubmit={handleSubmit(onSubmitForm)} noValidate>

        
        
        <FormGroup>
          <ProductImagesUploader
            id="images"
            maxImages={8}
            onChange={handleAdditionalImagesChange}
            value={additionalImageFiles}
            label="Imagens da Rifa"
            maxSizeInMB={5}
            allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
          />
          
          {formData.images && formData.images.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <FormLabel>Imagens existentes</FormLabel>
              <ImagePreviewContainer>
                {formData.images.map((url, index) => (
                  <ImagePreview key={index}>
                    <PreviewImage src={url} alt={`Imagem adicional ${index + 1}`} />
                    <RemoveImageButton 
                      type="button" 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveExistingImage(index);
                      }}
                      aria-label={`Remove image ${index + 1}`}
                    >
                      <FaTimes />
                    </RemoveImageButton>
                  </ImagePreview>
                ))}
              </ImagePreviewContainer>
              <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px' }}>
                Estas são as imagens já salvas. Novas imagens serão adicionadas a estas quando salvar.
              </div>
            </div>
          )}

          {errorsImage.image ? (
            <ErrorText id="images-error">
              <ErrorIcon />
              {errorsImage.image}
            </ErrorText>
          ) : (
            <ErrorText style={{ visibility: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
              <ErrorIcon />
              &nbsp;
            </ErrorText>  
          )}
        </FormGroup>
        
        <FormGroup>
          <FormInput
            id="name"
            label="Nome do Prêmio"
            {...register('name')}
            icon={<FaGift />}
            placeholder="Ex: iPhone 14 Pro Max"
            disabled={isLoading}
            error={errors.name?.message}
            required
            fullWidth
          />
        </FormGroup>
        
        <FormGroup>
          <FormLabel htmlFor="category">Categoria</FormLabel>
          <CustomDropdown
            options={MOCK_CATEGORIES}
            value={selectedCategory}
            onChange={handleCategoryChange}
            placeholder="Selecione uma categoria"
            icon={<FaTags />}
            disabled={isLoading}
          />
        </FormGroup>
        
        <FormGroup>
          <FormTextArea
            id="description"
            label="Descrição"
            icon={<FaFileAlt />}
            {...register('description')}
            placeholder="Descreva o prêmio em detalhes..."
            disabled={isLoading}
            error={errors.description?.message}
            fullWidth
            required
            rows={5}
          />
        </FormGroup>
        
        <FormGroup>
          <CurrencyInput
            id="value"  
            label="Valor"
            icon={<FaMoneyBillWave />}
            {...register('value')}
            placeholder="Ex: R$ 5.000,00" 
            disabled={isLoading}
            error={errors.value?.message}
            required
            fullWidth
            currency="R$"
          />
        </FormGroup>
        
        <ButtonGroup>
          <Button 
            type="button" 
            onClick={onCancel}
            disabled={isLoading}
          >
            <FaTimes />
            Cancelar
          </Button>
          
          <Button 
            type="submit" 
            $variant="primary"
            disabled={isLoading}
          >
            <FaSave />
            {isLoading ? 'Salvando...' : 'Salvar Prêmio'}
          </Button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
};

export default PrizeForm; 