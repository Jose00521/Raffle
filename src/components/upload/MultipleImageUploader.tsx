'use client';

import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaCloudUploadAlt, FaTrashAlt, FaExclamationTriangle, FaPlus } from 'react-icons/fa';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
}

interface MultipleImageUploaderProps {
  maxImages: number;
  onChange: (files: File[]) => void;
  value?: File[];
  className?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
}

const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

const UploaderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UploaderTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ImageCount = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const DropZone = styled.div<{ $isDragging: boolean, $isError?: boolean }>`
  border: 2px dashed ${props => {
    if (props.$isError) return '#ef4444';
    return props.$isDragging ? '#6a11cb' : 'rgba(0, 0, 0, 0.15)';
  }};
  border-radius: 10px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isDragging ? 'rgba(106, 17, 203, 0.05)' : 'transparent'};
  transition: all 0.2s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #6a11cb;
    background-color: rgba(106, 17, 203, 0.05);
  }
  
  @media (max-width: 768px) {
    padding: 24px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 20px 12px;
  }
`;

const UploadIcon = styled.div`
  font-size: 48px;
  color: ${props => props.theme.colors?.primary || '#6a11cb'};
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 40px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 36px;
    margin-bottom: 10px;
  }
`;

const DropText = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
  }
`;

const BrowseText = styled.span`
  color: ${props => props.theme.colors?.primary || '#6a11cb'};
  font-weight: 600;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const HelpText = styled.p`
  margin: 8px 0 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  text-align: center;
  
  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const ErrorText = styled.p`
  color: #ef4444;
  font-size: 0.85rem;
  margin: 8px 0 0;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 20px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-top: 16px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    margin-top: 14px;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }
`;

const ImageItem = styled(motion.div)`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const ImagePreview = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f3f4f6;
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  font-size: 0.85rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  ${ImageItem}:hover & {
    opacity: 1;
  }
  
  &:hover {
    background-color: #ef4444;
    color: white;
  }
  
  @media (max-width: 480px) {
    opacity: 1;
    width: 24px;
    height: 24px;
    top: 6px;
    right: 6px;
  }
`;

const ProgressOverlay = styled.div<{ $uploading: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: ${props => props.$uploading ? '100%' : '0%'};
  background-color: rgba(106, 17, 203, 0.3);
  transition: height 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
`;

const AddMoreButton = styled.div`
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  border: 2px dashed rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.theme.colors?.primary || '#6a11cb'};
  font-size: 1.5rem;
  background-color: rgba(106, 17, 203, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.1);
    border-color: #6a11cb;
  }
`;

const MultipleImageUploader: React.FC<MultipleImageUploaderProps> = ({
  maxImages = 10,
  onChange,
  value = [],
  className,
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Handle file selection
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Check if adding these files would exceed the limit
    if (images.length + files.length > maxImages) {
      setError(`Você pode adicionar no máximo ${maxImages} imagens.`);
      return;
    }
    
    setError(null);
    const newImages: ImageFile[] = [];
    
    // Process each file
    Array.from(files).forEach(file => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de arquivo não permitido. Use: ${allowedTypes.map(type => type.replace('image/', '')).join(', ')}`);
        return;
      }
      
      // Validate file size
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`);
        return;
      }
      
      // Create a preview URL
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const preview = URL.createObjectURL(file);
      
      newImages.push({ id, file, preview, uploading: true });
      
      // Simulate upload process (would be replaced with actual upload logic)
      setTimeout(() => {
        setImages(currentImages => 
          currentImages.map(img => {
            if (img.id === id) {
              return { ...img, uploading: false };
            }
            return img;
          })
        );
      }, 1500);
    });
    
    // Update state and call onChange
    setImages(prev => [...prev, ...newImages]);
    onChange([...value, ...newImages.map(img => img.file)]);
  };
  
  // Handle drag events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };
  
  // Handle delete
  const handleDelete = (id: string) => {
    // Prevent focus from shifting
    const activeElement = document.activeElement;
    
    const newImages = images.filter(img => img.id !== id);
    setImages(newImages);
    onChange(newImages.map(img => img.file));
    
    // Clear error if we're now below the limit
    if (newImages.length < maxImages && error?.includes('máximo')) {
      setError(null);
    }
    
    // Restore focus after state update
    setTimeout(() => {
      if (activeElement instanceof HTMLElement) {
        activeElement.focus();
      }
    }, 0);
  };
  
  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <UploaderContainer className={className}>
      <UploaderHeader>
        <UploaderTitle>Imagens da Rifa</UploaderTitle>
        <ImageCount>
          {images.length} / {maxImages} imagens
        </ImageCount>
      </UploaderHeader>
      
      {images.length < maxImages && (
        <>
          <DropZone
            $isDragging={isDragging}
            $isError={!!error}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <UploadIcon>
              <FaCloudUploadAlt />
            </UploadIcon>
            <DropText>
              Arraste e solte imagens aqui ou <BrowseText>escolha arquivos</BrowseText>
            </DropText>
            <HelpText>
              JPG, PNG, WebP • Máximo de {maxSizeInMB}MB por arquivo
            </HelpText>
            <FileInput
              ref={fileInputRef}
              type="file"
              accept={allowedTypes.join(',')}
              multiple
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </DropZone>
          
          {error && (
            <ErrorText>
              <FaExclamationTriangle /> {error}
            </ErrorText>
          )}
        </>
      )}
      
      {images.length > 0 && (
        <ImageGrid>
          <AnimatePresence>
            {images.map(img => (
              <ImageItem
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <ImagePreview>
                  <Image 
                    src={img.preview} 
                    alt="Preview" 
                    fill 
                    style={{ objectFit: 'cover' }} 
                  />
                  <ProgressOverlay $uploading={!!img.uploading}>
                    {img.uploading ? 'Enviando...' : ''}
                  </ProgressOverlay>
                </ImagePreview>
                <DeleteButton onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDelete(img.id);
                }}>
                  <FaTrashAlt />
                </DeleteButton>
              </ImageItem>
            ))}
            
            {images.length < maxImages && (
              <AddMoreButton onClick={openFileDialog}>
                <FaPlus />
              </AddMoreButton>
            )}
          </AnimatePresence>
        </ImageGrid>
      )}
    </UploaderContainer>
  );
};

export default MultipleImageUploader; 