import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaTrash, FaSave, FaTimes, FaGift, FaMoneyBillWave, FaFileAlt, FaList, FaTags, FaExclamationCircle, FaStar, FaImages, FaCamera, FaPlus, FaArrowUp, FaArrowDown, FaInfo } from 'react-icons/fa';
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

interface PrizeUpdateFormProps {
  initialData: Partial<IPrize>; // Obrigatório para atualização
  onSubmit: (data: Partial<{
    name: string;
    description: string;
    value: string;
    image: File | string;
    images: Array<File | string>;
    categoryId: mongoose.Types.ObjectId;
  }>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Tipo personalizado para rastrear imagens de diferentes origens
interface ImageItem {
  id: string;
  type: 'url' | 'file';
  url?: string;
  file?: File;
  preview: string;
  isCover: boolean;
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
          color: #b91c1c;
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
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 16px;
  min-height: 16px;
  color: #ef4444;
`;

// Styled components para visualização e gerenciamento de imagens
const ImagesContainer = styled.div`
  margin-bottom: 24px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background-color: #f9fafb;
`;

const ImageSectionTitle = styled.h4`
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin-bottom: 16px;
  
  svg {
    margin-right: 10px;
    color: #6a11cb;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const ImageCard = styled.div<{ $isCover?: boolean }>`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  aspect-ratio: 1;
  transition: all 0.2s ease;
  
  ${({ $isCover }) => $isCover && `
    box-shadow: 0 0 0 3px #f59e0b, 0 4px 10px rgba(245, 158, 11, 0.3);
  `}
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const CoverBadge = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  background-color: rgba(245, 158, 11, 0.9);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 3px;
    font-size: 0.6rem;
  }
`;

const PositionBadge = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(37, 99, 235, 0.85);
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
`;

const ImageActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0));
  padding: 20px 8px 8px;
  display: flex;
  justify-content: space-between;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ImageCard}:hover & {
    opacity: 1;
  }
`;

const ImageActionButton = styled.button<{ $variant?: 'danger' | 'primary' }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $variant }) => 
    $variant === 'danger' ? 'rgba(239, 68, 68, 0.9)' : 
    $variant === 'primary' ? 'rgba(37, 99, 235, 0.9)' : 
    'rgba(255, 255, 255, 0.9)'};
  color: ${({ $variant }) => $variant === 'danger' || $variant === 'primary' ? 'white' : '#1f2937'};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;
  margin: 0 2px;
  
  &:hover {
    transform: scale(1.1);
    background-color: ${({ $variant }) => 
      $variant === 'danger' ? 'rgba(239, 68, 68, 1)' : 
      $variant === 'primary' ? 'rgba(37, 99, 235, 1)' : 
      'rgba(255, 255, 255, 1)'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ImageActionsGroup = styled.div`
  display: flex;
  gap: 4px;
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  aspect-ratio: 1;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 0.2s ease;
  
  svg {
    font-size: 1.5rem;
    color: #9ca3af;
  }
  
  &:hover {
    border-color: #9ca3af;
    background-color: #f3f4f6;
    
    svg {
      color: #6b7280;
    }
  }
`;

const HelpText = styled.div`
  background-color: #f0f0ff;
  border-left: 3px solid #6a11cb;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: #4b5563;
  display: flex;
  align-items: flex-start;
  
  svg {
    margin-right: 8px;
    margin-top: 2px;
    min-width: 16px;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
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

// Função para formatar valores monetários
const formatCurrency = (value: string | number | undefined): string => {
  if (!value) return '';
  
  // Se já estiver formatado como moeda, retornar como está
  if (typeof value === 'string' && value.includes('R$')) {
    return value;
  }
  
  // Converter para número
  let numValue: number;
  if (typeof value === 'string') {
    // Remover caracteres não numéricos
    numValue = parseFloat(value.replace(/\D/g, ''));
  } else {
    numValue = value;
  }
  
  // Formatar como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(numValue / 100); // Divide por 100 para considerar centavos
};

// Função auxiliar para normalizar valores numéricos para comparação
const normalizeValue = (value?: string | number): string => {
  if (!value) return '';
  
  // Converter para string
  const strValue = value.toString();
  
  // Remove "R$" e pontos, mas mantém a vírgula decimal
  return strValue
    .replace(/R\$/g, '')      // Remove R$
    .replace(/\./g, '')       // Remove pontos
    .replace(/\s+/g, '')      // Remove espaços
    .trim();                  // Remove espaços nas extremidades
};

// Função para gerar IDs únicos
const generateId = (): string => {
  return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const PrizeUpdateForm: React.FC<PrizeUpdateFormProps> = ({
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
  
  // Estado para rastrear se o formulário foi modificado
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  const [formData, setFormData] = useState<Partial<IPrize>>({
    image: '',
    images: [],
    ...initialData
  });

  // Estado para as imagens
  const [images, setImages] = useState<ImageItem[]>([]);
  const [errorsImage, setErrorsImage] = useState<string | null>(null);
  const [imagesModified, setImagesModified] = useState(false);
  
  // Ref para o input de arquivo
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Formatar o valor para exibição
  const formattedValue = initialData?.value ? formatCurrency(initialData.value) : '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty }
  } = useForm<PrizeForm>({
    resolver: zodResolver(prizeSchema),
    mode: 'all',
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      value: initialData?.value || '',
    }
  });

  // Observar os valores do formulário para detectar alterações
  const watchedValues = watch();

  // Keep track of the selected category as a string for the dropdown
  const [selectedCategory, setSelectedCategory] = useState<string>(
    getCategoryIdAsString(initialData?.categoryId)
  );
  
  // Inicializar o estado de imagens a partir dos dados iniciais
  useEffect(() => {
    const initialImages: ImageItem[] = [];
    
    // Adicionar imagem principal como capa
    if (initialData.image && typeof initialData.image === 'string') {
      initialImages.push({
        id: generateId(),
        type: 'url',
        url: initialData.image,
        preview: initialData.image,
        isCover: true
      });
    }
    
    // Adicionar imagens adicionais
    if (initialData.images && Array.isArray(initialData.images)) {
      initialData.images.forEach(img => {
        if (typeof img === 'string') {
          initialImages.push({
            id: generateId(),
            type: 'url',
            url: img,
            preview: img,
            isCover: false
          });
        }
      });
    }
    
    setImages(initialImages);
  }, [initialData]);
  
  // Verificar se o formulário foi modificado
  useEffect(() => {
    const hasFormChanges = isDirty || imagesModified || 
      selectedCategory !== getCategoryIdAsString(initialData?.categoryId) ||
      watchedValues.value !== initialData?.value;
    
    setIsFormDirty(hasFormChanges);
  }, [isDirty, imagesModified, selectedCategory, initialData, watchedValues.value]);

  const registerWithMask = useHookFormMask(register);
  
  // Manipulador para definir imagem como capa
  const handleSetCover = (id: string) => {
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      if (index < 0) return prevImages;
      
      // Create a copy of the images array
      const newImages = [...prevImages];
      
      // Get the image to set as cover
      const newCoverImage = {...newImages[index], isCover: true};
      
      // Remove the image from its current position
      newImages.splice(index, 1);
      
      // Move the new cover image to the first position
      newImages.unshift(newCoverImage);
      
      // Make sure all other images are not covers
      for (let i = 1; i < newImages.length; i++) {
        newImages[i].isCover = false;
      }
      
      return newImages;
    });
    setImagesModified(true);
  };
  
  // Manipulador para remover imagem
  const handleRemoveImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (!imageToRemove) return;
    
    const wasCover = imageToRemove.isCover;
    const updatedImages = images.filter(img => img.id !== id);
    
    // Se a imagem removida era a capa e ainda há outras imagens,
    // definir a primeira imagem restante como capa
    if (wasCover && updatedImages.length > 0) {
      updatedImages[0].isCover = true;
      
      // Garantir que as outras não são capas
      for (let i = 1; i < updatedImages.length; i++) {
        updatedImages[i].isCover = false;
      }
    }
    
    setImages(updatedImages);
    setImagesModified(true);
    
    // Limpar erro se havia
    if (errorsImage) {
      setErrorsImage(null);
    }
  };
  
  // Manipulador para adicionar novas imagens
  const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar se não excede o limite (8 imagens no total)
    if (images.length + files.length > 8) {
      setErrorsImage('Você pode adicionar no máximo 8 imagens no total.');
      return;
    }
    
    // Criar novos itens de imagem
    const newImageItems: ImageItem[] = Array.from(files).map(file => ({
      id: generateId(),
      type: 'file',
      file,
      preview: URL.createObjectURL(file),
      isCover: false // Inicialmente nenhuma nova imagem é capa
    }));
    
    setImages(prevImages => {
      // Se não houver imagens, a primeira nova imagem será a capa
      if (prevImages.length === 0 && newImageItems.length > 0) {
        newImageItems[0].isCover = true;
        return [...newImageItems];
      }
      
      // Se já existem imagens, manter a estrutura existente
      // A primeira imagem já deve ser a capa
      return [...prevImages, ...newImageItems];
    });
    
    setImagesModified(true);
    setErrorsImage(null);
    
    // Limpar o input de arquivo
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Manipulador para clicar no botão de upload
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  const validateImagesBeforeSubmit = () => {
    if (images.length === 0) {
      setErrorsImage('É necessário pelo menos uma imagem');
      return false;
    }
    
    return true;
  };
  
  // Manipulador para mover a imagem para cima na ordem
  const handleMoveImageUp = (id: string) => {
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      // Não permitir mover para cima se for a primeira imagem (capa) ou a segunda imagem
      if (index <= 0 || index === 1) return prevImages;
      
      const newImages = [...prevImages];
      const temp = newImages[index];
      newImages[index] = newImages[index - 1];
      newImages[index - 1] = temp;
      
      return newImages;
    });
    setImagesModified(true);
  };
  
  // Manipulador para mover a imagem para baixo na ordem
  const handleMoveImageDown = (id: string) => {
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      // Não permitir mover se for a imagem de capa (índice 0) ou a última imagem
      if (index < 0 || index === 0 || index >= prevImages.length - 1) return prevImages;
      
      const newImages = [...prevImages];
      const temp = newImages[index];
      newImages[index] = newImages[index + 1];
      newImages[index + 1] = temp;
      
      return newImages;
    });
    setImagesModified(true);
  };
  
  const onSubmitForm = async (data: PrizeForm) => {
    // Validar imagens primeiro
    if (!validateImagesBeforeSubmit()) {
      return;
    }
    
    // Criar objeto base para submissão
    const submissionData: any = {
      ...data
    };
    
    // Processar imagens para submissão
    if (images.length > 0) {
      // A primeira imagem é sempre a capa
      const coverImage = images[0];
      const additionalImages = images.slice(1);
      
      // Definir imagem de capa
      if (coverImage) {
        if (coverImage.type === 'url') {
          submissionData.image = coverImage.url;
        } else if (coverImage.file) {
          submissionData.image = coverImage.file;
        }
      }
      
      // Definir imagens adicionais
      submissionData.images = additionalImages.map(img => {
        if (img.type === 'url') {
          return img.url;
        } else if (img.file) {
          return img.file;
        }
        return null;
      }).filter(Boolean);
    } else {
      submissionData.image = '';
      submissionData.images = [];
    }
    
    // Adicionar categoria
    if (selectedCategory) {
      submissionData.categoryId = selectedCategory as unknown as mongoose.Types.ObjectId;
    }
    
    // Enviar o formulário
    onSubmit(submissionData);
  };

  // Limpar URLs de objeto quando o componente desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.type === 'file' && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

  return (
    <FormWrapper>
      <FormTitle>
        Editar Prêmio
      </FormTitle>
      
      <form onSubmit={handleSubmit(onSubmitForm)} noValidate>
        <FormGroup>
          <ImageSectionTitle>
            <FaImages /> Imagens do Prêmio
          </ImageSectionTitle>
          
          <HelpText>
            <FaInfo />
            <span>
              A primeira imagem é sempre a capa do prêmio.
              Você pode adicionar até 8 imagens no total. Clique em uma imagem e selecione a estrela para definir como capa, que será automaticamente movida para a primeira posição.
              Use os botões de seta para alterar a ordem das demais imagens.
            </span>
          </HelpText>
          
          <ImageGrid>
            {/* Mostrar imagens existentes */}
            {images.map((image, index) => (
              <ImageCard 
                key={image.id} 
                $isCover={image.isCover}
                onClick={() => handleSetCover(image.id)}
              >
                <ImagePreview src={image.preview} alt="Imagem do prêmio" />
                {image.isCover && (
                  <CoverBadge>
                    <FaStar /> Capa
                  </CoverBadge>
                )}
                <PositionBadge>
                  {index + 1}
                </PositionBadge>
                <ImageActions>
                  <ImageActionsGroup>
                    <ImageActionButton 
                      type="button"
                      $variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveImageUp(image.id);
                      }}
                      disabled={index === 0 || index === 1}
                      title={index === 0 ? "A imagem de capa não pode ser movida" : index === 1 ? "Não é possível mover acima da capa" : "Mover para cima"}
                    >
                      <FaArrowUp />
                    </ImageActionButton>
                    <ImageActionButton 
                      type="button"
                      $variant="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveImageDown(image.id);
                      }}
                      disabled={index === 0 || index === images.length - 1}
                      title={index === 0 ? "A imagem de capa não pode ser movida" : "Mover para baixo"}
                    >
                      <FaArrowDown />
                    </ImageActionButton>
                  </ImageActionsGroup>
                  <ImageActionsGroup>
                    <ImageActionButton 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetCover(image.id);
                      }}
                      title="Definir como capa"
                    >
                      <FaStar />
                    </ImageActionButton>
                    <ImageActionButton 
                      type="button"
                      $variant="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(image.id);
                      }}
                      title="Remover imagem"
                    >
                      <FaTrash />
                    </ImageActionButton>
                  </ImageActionsGroup>
                </ImageActions>
              </ImageCard>
            ))}
            
            {/* Botão para adicionar mais imagens */}
            {images.length < 8 && (
              <UploadButton 
                type="button" 
                onClick={handleUploadClick}
              >
                <FaPlus />
              </UploadButton>
            )}
          </ImageGrid>
          
          {/* Input de arquivo oculto */}
          <HiddenFileInput
            type="file"
            ref={fileInputRef}
            onChange={handleAddImages}
            accept="image/jpeg,image/png,image/webp"
            multiple
          />
          
          {errorsImage && (
            <ErrorText id="images-error">
              <ErrorIcon />
              {errorsImage}
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
            value={initialData?.value}
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
            disabled={isLoading || (initialData && !isFormDirty)}
          >
            <FaSave />
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </ButtonGroup>
      </form>
    </FormWrapper>
  );
};

export default PrizeUpdateForm; 