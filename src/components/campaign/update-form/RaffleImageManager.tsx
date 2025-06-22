'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { 
  FaStar, 
  FaTrashAlt, 
  FaPlus, 
  FaInfoCircle, 
  FaExclamationTriangle,
  FaImages,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { ImageItem, RaffleImageManagerProps } from './types';

// Styled components
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

const HiddenFileInput = styled.input`
  display: none;
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

const HelpText = styled.p`
  margin: 10px 0 0;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-style: italic;
  line-height: 1.5;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  
  svg {
    flex-shrink: 0;
    margin-top: 2px;
  }
  
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

// Função para gerar IDs únicos
const generateId = (): string => {
  return `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Componente para gerenciar as imagens da rifa
 */
const RaffleImageManager: React.FC<RaffleImageManagerProps> = ({ value, onChange }) => {
  // Estado para as imagens
  const [images, setImages] = useState<ImageItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs para controle de renderização e cache
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasInitializedRef = useRef<boolean>(false);
  const lastProcessedImagesRef = useRef<string>('');
  const lastCoverImageRef = useRef<File | string | undefined>(undefined);

  // Inicializar o estado de imagens a partir dos dados recebidos
  useEffect(() => {
    // Evitar re-inicialização
    if (hasInitializedRef.current) return;
    
    const initialImages: ImageItem[] = [];
    
    if (value && Array.isArray(value)) {
      value.forEach((img, index) => {
        if (typeof img === 'string') {
          initialImages.push({
            id: generateId(),
            type: 'url',
            url: img,
            preview: img,
            isCover: index === 0 // A primeira imagem é a capa
          });
        } else if (img instanceof File) {
          initialImages.push({
            id: generateId(),
            type: 'file',
            file: img,
            preview: URL.createObjectURL(img),
            isCover: index === 0 // A primeira imagem é a capa
          });
        }
      });
    }
    
    if (initialImages.length > 0) {
      setImages(initialImages);
      
      // Processar imagens iniciais para o cache de comparação
      const processedImages = initialImages.map(img => img.type === 'url' ? img.url! : img.file!);
      lastProcessedImagesRef.current = JSON.stringify(processedImages);
      
      // Definir a imagem de capa inicial para o cache
      const coverImage = initialImages.find(img => img.isCover);
      if (coverImage) {
        lastCoverImageRef.current = coverImage.type === 'url' ? coverImage.url! : coverImage.file!;
      }
    }
    
    // Marcar como inicializado para evitar loops
    hasInitializedRef.current = true;
  }, [value]);

  // Efeito para notificar mudanças nas imagens para o componente pai
  useEffect(() => {
    // Não fazer nada se o array de imagens estiver vazio e não for uma mudança intencional
    if (images.length === 0 && !hasInitializedRef.current) return;

    const processedImages = images.map(img => {
      return img.type === 'url' ? img.url! : img.file!;
    });

    // Encontrar a imagem de capa
    const coverImage = images.find(img => img.isCover);
    const coverImageValue = coverImage ? 
      (coverImage.type === 'url' ? coverImage.url! : coverImage.file!) : 
      undefined;

    // Comparar com o último valor para evitar atualizações desnecessárias
    const imagesJSON = JSON.stringify(processedImages);
    if (imagesJSON !== lastProcessedImagesRef.current || 
        coverImageValue !== lastCoverImageRef.current) {
      
      lastProcessedImagesRef.current = imagesJSON;
      lastCoverImageRef.current = coverImageValue;
      
      onChange(processedImages, coverImageValue);
    }
    
    // Função de limpeza
    return () => {
      images.forEach(img => {
        if (img.type === 'file' && img.preview) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images, onChange]);

  // Manipulador para definir imagem como capa
  const handleSetCover = (id: string) => {
    setImages(prevImages => {
      const index = prevImages.findIndex(img => img.id === id);
      if (index < 0) return prevImages;
      
      // Criar uma cópia do array de imagens
      const newImages = [...prevImages];
      
      // Obter a imagem a ser definida como capa
      const newCoverImage = {...newImages[index], isCover: true};
      
      // Remover a imagem da posição atual
      newImages.splice(index, 1);
      
      // Mover a nova imagem de capa para a primeira posição
      newImages.unshift(newCoverImage);
      
      // Garantir que todas as outras imagens não sejam capas
      for (let i = 1; i < newImages.length; i++) {
        newImages[i].isCover = false;
      }
      
      // Resetar o cache de comparação para forçar nova comparação
      setTimeout(() => {
        lastProcessedImagesRef.current = '';
        lastCoverImageRef.current = undefined;
      }, 0);
      
      return newImages;
    });
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
    
    // Resetar o cache de comparação para forçar nova comparação
    lastProcessedImagesRef.current = '';
    lastCoverImageRef.current = undefined;
    
    // Limpar erro se havia
    if (error) {
      setError(null);
    }
  };
  
  // Manipulador para adicionar novas imagens
  const handleAddImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar se não excede o limite (10 imagens no total)
    if (images.length + files.length > 10) {
      setError('Você pode adicionar no máximo 10 imagens no total.');
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
    
    // Resetar o cache de comparação para forçar nova comparação
    lastProcessedImagesRef.current = '';
    lastCoverImageRef.current = undefined;
    
    setError(null);
    
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
      
      // Resetar o cache de comparação
      setTimeout(() => {
        lastProcessedImagesRef.current = '';
      }, 0);
      
      return newImages;
    });
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
      
      // Resetar o cache de comparação
      setTimeout(() => {
        lastProcessedImagesRef.current = '';
      }, 0);
      
      return newImages;
    });
  };

  return (
    <div>
      <ImageSectionTitle>
        <FaImages /> Imagens da Rifa
      </ImageSectionTitle>
      
      <HelpText>
        <FaInfoCircle />
        A primeira imagem é sempre a capa da rifa. 
        Você pode adicionar até 10 imagens no total. 
        Clique em uma imagem e selecione a estrela para definir como capa.
      </HelpText>
      
      <ImageGrid>
        {/* Mostrar imagens existentes */}
        {images.map((image, index) => (
          <ImageCard 
            key={image.id} 
            $isCover={image.isCover}
          >
            <ImagePreview src={image.preview} alt="Imagem da rifa" />
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
                  <FaTrashAlt />
                </ImageActionButton>
              </ImageActionsGroup>
            </ImageActions>
          </ImageCard>
        ))}
        
        {/* Botão para adicionar mais imagens */}
        {images.length < 10 && (
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
      
      {error && (
        <ErrorText>
          <FaExclamationTriangle /> {error}
        </ErrorText>
      )}
    </div>
  );
};

export default RaffleImageManager; 