'use client';

import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { 
  FaCloudUploadAlt, 
  FaTrashAlt, 
  FaExclamationTriangle, 
  FaPlus, 
  FaStar, 
  FaArrowsAlt, 
  FaExchangeAlt,
  FaChevronUp,
  FaChevronDown,
  FaImages,
  FaInfo,
  FaQuestionCircle,
  FaCamera
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, MeasuringStrategy } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  uploading?: boolean;
  error?: string;
  isCover?: boolean;
}

interface MultipleImageUploaderProps {
  maxImages: number;
  onChange: (files: File[]) => void;
  value?: File[];
  label?: string;
  className?: string;
  maxSizeInMB?: number;
  allowedTypes?: string[];
  id?: string;
  onCoverImageChange?: (coverIndex: number) => void;
}

// Animações
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(106, 17, 203, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(106, 17, 203, 0); }
  100% { box-shadow: 0 0 0 0 rgba(106, 17, 203, 0); }
`;

// Adicionar animações de transição suaves
const slideInFromSide = keyframes`
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Container principal
const UploaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 24px;
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  padding: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
`;

// Cabeçalho
const UploaderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f5;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
    padding-bottom: 12px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UploaderTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: ${props => props.theme.colors?.primary || '#6a11cb'};
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ImageCount = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-weight: 600;
  padding: 6px 16px;
  background-color: #f3f4f8;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.theme.colors?.primary || '#6a11cb'};
  }
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
    padding: 4px 10px;
  }
`;

// Área de upload
const DropZone = styled.div<{ $isDragging: boolean, $isError?: boolean }>`
  border: 2px dashed ${props => {
    if (props.$isError) return '#ef4444';
    return props.$isDragging ? '#6a11cb' : 'rgba(0, 0, 0, 0.15)';
  }};
  border-radius: 16px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.$isDragging ? 'rgba(106, 17, 203, 0.05)' : '#f9fafc'};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  
  &:hover {
    border-color: #6a11cb;
    background-color: rgba(106, 17, 203, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 30px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 25px 12px;
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

// Componentes da galeria de imagens
const GalleryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: ${fadeIn} 0.3s ease-in-out;
`;

// Seção da imagem de capa
const CoverSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background-color: #f9fafc;
  border-radius: 16px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  margin-bottom: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const CoverHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CoverTitle = styled.h4`
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
  }
`;

const CoverWrapper = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(106, 17, 203, 0.15);
  aspect-ratio: 16 / 9;
  width: 100%;
  background-color: #f9fafc;
  
  &.has-cover {
    animation: pulse 1.5s;
  }
  
  &:hover {
    .cover-actions {
      opacity: 1;
    }
  }
`;

const CoverBadge = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: #eab308;
  color: white;
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 5;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  svg {
    font-size: 0.8rem;
  }
  
  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 0.7rem;
  }
`;

const CoverPlaceholder = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background-color: #f3f4f8;
  text-align: center;
  padding: 20px;
  
  svg {
    font-size: 3rem;
    color: #6a11cb;
    margin-bottom: 16px;
    opacity: 0.3;
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    max-width: 80%;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    svg {
      font-size: 2.5rem;
      margin-bottom: 12px;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
`;

const ImagePreview = styled.div<{ $backgroundImage?: string }>`
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #f3f4f6;
  background-image: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'none'};
  background-size: cover;
  background-position: center;
`;

const ImageActions = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 12px 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
  
  &.cover-actions {
    justify-content: flex-end;
    
    @media (max-width: 480px) {
      opacity: 0.9;
    }
  }
  
  @media (max-width: 768px) {
    opacity: 0.9;
    padding: 16px 10px 10px;
  }
`;

// Seção de miniaturas
const ThumbnailsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f9fafc;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(106, 17, 203, 0.1);
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 12px;
  }
`;

const ThumbnailsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ThumbnailsTitle = styled.h4`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #6a11cb;
  }
`;

const ThumbnailsHelpText = styled.div`
  margin: 4px 0 12px;
  font-size: 0.85rem;
  color: #6b7280;
  background-color: rgba(106, 17, 203, 0.05);
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid #6a11cb;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 1.1rem;
    color: #6a11cb;
    flex-shrink: 0;
  }
  
  span {
    font-weight: 500;
  }
`;

// Melhorar o estilo do ThumbnailsGrid com animações
const ThumbnailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  position: relative;
  
  & > * {
    transition: transform 250ms cubic-bezier(0.2, 0, 0, 1);
  }
  
  & > *:nth-child(odd) {
    animation: ${slideUp} 0.4s ease-out;
  }
  
  & > *:nth-child(even) {
    animation: ${slideInFromSide} 0.4s ease-out;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 10px;
  }
`;

// Melhorar o estilo do ThumbnailItem para indicar que pode ser arrastado
const ThumbnailItem = styled.div`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: grab;
  transition: all 0.25s ease;
  animation: ${slideUp} 0.3s ease-out;
  touch-action: none; /* Impede que o navegador processe gestos de toque */
  user-select: none; /* Impede seleção de texto */
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.3));
    opacity: 0;
    transition: opacity 0.25s ease;
    z-index: 2;
    pointer-events: none;
  }
  
  &::after {
    content: '⇄';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    color: white;
    opacity: 0;
    transition: all 0.25s ease;
    z-index: 3;
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.15);
    
    &::before {
      opacity: 1;
    }
    
    &::after {
      opacity: 0.8;
    }
    
    .thumbnail-actions {
      opacity: 1;
    }
  }
  
  &.is-cover {
    border: 3px solid #eab308;
    box-shadow: 0 4px 12px rgba(234, 179, 8, 0.3);
    
    &:hover {
      box-shadow: 0 8px 20px rgba(234, 179, 8, 0.4);
    }
  }
  
  &.dragging {
    opacity: 0.7;
    transform: scale(1.03);
    z-index: 999;
    box-shadow: 0 15px 30px rgba(106, 17, 203, 0.25);
    border: 2px dashed #6a11cb;
    cursor: grabbing;
    
    &::before, &::after {
      opacity: 0;
    }
  }
  
  @media (max-width: 768px) {
    border-radius: 8px;
    
    &::after {
      opacity: 0.5;
      font-size: 1.8rem;
    }
  }
`;

const ThumbnailOrderButtons = styled.div`
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ThumbnailItem}:hover & {
    opacity: 1;
  }
  
  @media (max-width: 768px) {
    opacity: 0.9;
  }
`;

const OrderButton = styled.button`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6a11cb;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  padding: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: #6a11cb;
    color: white;
    box-shadow: 0 4px 8px rgba(106, 17, 203, 0.2);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    
    &:hover {
      background-color: rgba(255, 255, 255, 0.9);
      color: #6a11cb;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
  }
  
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6a11cb;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.delete-btn {
    color: #ef4444;
    
    &:hover {
      background-color: #ef4444;
      color: white;
    }
  }
  
  &.cover-btn {
    color: #eab308;
    
    &:hover {
      background-color: #eab308;
      color: white;
    }
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }
`;

const ActionButtonSmall = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6a11cb;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  z-index: 10;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
    background-color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  }
  
  &:disabled {
    opacity: 0.4;
    cursor: default;
    background-color: rgba(255, 255, 255, 0.5);
    
    &:hover {
      transform: none;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }
  }
  
  &.delete-btn {
    color: #ef4444;
    
    &:hover {
      background-color: #ef4444;
      color: white;
    }
  }
  
  &.cover-btn {
    color: #eab308;
    
    &:hover {
      background-color: #eab308;
      color: white;
    }
    
    &.active {
      background-color: #eab308;
      color: white;
    }
  }
  
  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
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
  z-index: 5;
`;

const AddMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: ${props => props.theme.colors?.primary || '#6a11cb'};
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px;
  width: 100%;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  margin-top: 8px;
  
  svg {
    font-size: 1.1rem;
  }
  
  &:hover {
    background-color: #5a0aae;
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(106, 17, 203, 0.3);
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    padding: 12px;
  }
`;

const HelpCard = styled.div`
  background-color: #f9fafc;
  border: 1px solid rgba(106, 17, 203, 0.1);
  border-left: 3px solid #6a11cb;
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 8px;
  
  h5 {
    margin: 0 0 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
    display: flex;
    align-items: center;
    gap: 8px;
    
    svg {
      color: #6a11cb;
    }
  }
  
  ul {
    margin: 0;
    padding-left: 20px;
    
    li {
      font-size: 0.85rem;
      color: #6b7280;
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
`;

// Corrigir a tipagem do HelpButton adicionando uma interface
interface HelpButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  showHelp?: boolean;
}

const HelpButton = styled.button<HelpButtonProps>`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6a11cb;
  font-size: 1.1rem;
  opacity: 0.7;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px;
  position: relative;
  
  &:hover {
    opacity: 1;
    transform: scale(1.1);
  }
  
  &.active {
    opacity: 1;
    color: #4c0b8f;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background-color: #6a11cb;
    border-radius: 50%;
    top: 0;
    right: 0;
    transition: opacity 0.2s ease;
  }
  
  &.help-visible::after {
    opacity: 0;
  }
  
  &.help-hidden::after {
    opacity: 1;
  }
`;

const Tooltip = styled.div`
  display: none;
`;

const ImageCountFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 0.9rem;
  color: #6b7280;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.85rem;
  }
`;

// Criar um componente sortable para os itens de imagem
interface SortableItemProps {
  id: string;
  image: ImageFile;
  index: number;
  onSetCover: (id: string) => void;
  onDelete: (id: string) => void;
}

// Corrigir o componente SortableImageItem
const SortableImageItem: React.FC<SortableItemProps> = ({
  id,
  image,
  index,
  onSetCover,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: image.isCover // Desabilitar arrasto se for imagem de capa
  });

  const itemStyle = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 100 : image.isCover ? 10 : 1, // Dar z-index maior para capa
    position: 'relative' as const
  };

  return (
    <ThumbnailItem
      ref={setNodeRef}
      style={itemStyle}
      className={`${image.isCover ? 'is-cover' : ''} ${isDragging ? 'dragging' : ''}`}
      {...(image.isCover ? {} : attributes)} // Não adicionar atributos de arrasto se for capa
      {...(image.isCover ? {} : listeners)} // Não adicionar listeners de arrasto se for capa
      title={image.isCover ? "Imagem de capa" : "Clique e arraste para reordenar"}
    >
      {image.isCover && (
        <CoverBadge>
          <FaStar /> Capa
        </CoverBadge>
      )}
      
      <ImagePreview $backgroundImage={image.preview}>
        <ProgressOverlay $uploading={!!image.uploading}>
          {image.uploading ? 'Enviando...' : ''}
        </ProgressOverlay>
      </ImagePreview>
      
      <ImageActions className="thumbnail-actions">
        {!image.isCover && (
          <ActionButtonSmall
            className="cover-btn"
            onClick={() => onSetCover(image.id)}
            title="Definir como capa"
          >
            <FaStar />
          </ActionButtonSmall>
        )}
        <ActionButtonSmall
          className="delete-btn"
          onClick={() => onDelete(image.id)}
          title="Remover imagem"
        >
          <FaTrashAlt />
        </ActionButtonSmall>
      </ImageActions>
    </ThumbnailItem>
  );
};

const MultipleImageUploader: React.FC<MultipleImageUploaderProps> = ({
  id,
  maxImages = 10,
  onChange,
  label = 'Imagens da Rifa',
  value = [],
  className,
  maxSizeInMB = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  onCoverImageChange,
  ...props
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Configurar sensores com melhores parâmetros para um arrasto mais fluido
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Ativar o arrasto com menos movimento para torná-lo mais responsivo
      activationConstraint: {
        distance: 5, // Diminuir a distância necessária para iniciar o arrasto
        tolerance: 5, // Permitir um pequeno desvio na linha de movimento
        delay: 0, // Remover qualquer atraso na ativação
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Inicializar imagens a partir das props no mount
  useEffect(() => {
    if (value.length > 0 && images.length === 0) {
      const initialImages: ImageFile[] = value.map((file, index) => {
        const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        return {
          id,
          file,
          preview: URL.createObjectURL(file),
          isCover: index === 0 // Primeira imagem é a capa por padrão
        };
      });
      setImages(initialImages);
    }
  }, [value, images.length]);
  
  // Limpar URLs de objeto quando o componente desmontar
  useEffect(() => {
    return () => {
      images.forEach(img => {
        URL.revokeObjectURL(img.preview);
      });
    };
  }, [images]);
  
  // Manipular seleção de arquivo
  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Verificar se adicionar esses arquivos excederia o limite
    if (images.length + files.length > maxImages) {
      setError(`Você pode adicionar no máximo ${maxImages} imagens.`);
      return;
    }
    
    setError(null);
    const newImages: ImageFile[] = [];
    
    // Processar cada arquivo
    Array.from(files).forEach((file, index) => {
      // Validar tipo de arquivo
      if (!allowedTypes.includes(file.type)) {
        setError(`Tipo de arquivo não permitido. Use: ${allowedTypes.map(type => type.replace('image/', '')).join(', ')}`);
        return;
      }
      
      // Validar tamanho de arquivo
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`Arquivo muito grande. Tamanho máximo: ${maxSizeInMB}MB`);
        return;
      }
      
      // Criar uma URL de pré-visualização
      const id = `img-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const preview = URL.createObjectURL(file);
      
      // Determinar se esta imagem deve ser a capa (primeira imagem se não houver imagens anteriores)
      const shouldBeCover = images.length === 0 && index === 0;
      
      newImages.push({ 
        id, 
        file, 
        preview, 
        uploading: true,
        isCover: shouldBeCover
      });
      
      // Simular processo de upload (seria substituído pela lógica de upload real)
      setTimeout(() => {
        setImages(currentImages => 
          currentImages.map(img => {
            if (img.id === id) {
              return { ...img, uploading: false };
            }
            return img;
          })
        );
      }, 1000);
    });
    
    // Atualizar estado e chamar onChange
    const allImages = [...images, ...newImages];
    setImages(allImages);
    
    // Atualizar o onChange com a nova ordem de arquivos
    const orderedFiles = allImages.map(img => img.file);
    onChange(orderedFiles);
    
    // Notificar sobre a imagem de capa se for o primeiro upload
    if (images.length === 0 && newImages.length > 0 && onCoverImageChange) {
      onCoverImageChange(0);
    }
  };
  
  // Manipular eventos de arrastar para upload de arquivo
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
  
  // Definir uma imagem como capa
  const handleSetCover = (id: string) => {
    // Encontrar a imagem que será definida como capa
    const coverImageIndex = images.findIndex(img => img.id === id);
    if (coverImageIndex === -1) return;

    // Criar uma cópia do array de imagens e remover a imagem selecionada
    const newImages = [...images];
    const [coverImage] = newImages.splice(coverImageIndex, 1);
    
    // Definir essa imagem como capa e colocá-la no início do array
    coverImage.isCover = true;
    
    // Remover a flag isCover de todas as outras imagens
    newImages.forEach(img => img.isCover = false);
    
    // Colocar a imagem de capa na primeira posição
    const updatedImages = [coverImage, ...newImages];
    
    // Atualizar o estado
    setImages(updatedImages);
    
    // Notificar sobre a mudança da imagem de capa
    if (onCoverImageChange) {
      onCoverImageChange(0); // Sempre será o índice 0 agora
    }
    
    // Atualizar o onChange com a nova ordem de arquivos
    onChange(updatedImages.map(img => img.file));
    
    // Adicionar classe de animação
    const coverElement = document.getElementById('cover-image-container');
    if (coverElement) {
      coverElement.classList.remove('has-cover');
      // Trigger reflow
      void coverElement.offsetWidth;
      coverElement.classList.add('has-cover');
    }
  };
  
  // Manipular exclusão
  const handleDelete = (id: string) => {
    // Encontrar a imagem a ser excluída
    const imageToDelete = images.find(img => img.id === id);
    const wasCover = imageToDelete?.isCover || false;
    
    // Remover a imagem
    const newImages = images.filter(img => img.id !== id);
    
    // Se a imagem excluída era a capa e há outras imagens, definir a primeira imagem como a nova capa
    if (wasCover && newImages.length > 0) {
      // Remover a flag isCover de todas as imagens
      newImages.forEach(img => img.isCover = false);
      
      // Definir a primeira imagem como capa
      newImages[0].isCover = true;
      
      // Notificar sobre a mudança da imagem de capa
      if (onCoverImageChange) {
        onCoverImageChange(0);
      }
    }
    
    setImages(newImages);
    
    // Atualizar o onChange com a nova ordem de arquivos
    onChange(newImages.map(img => img.file));
    
    // Limpar erro se agora estamos abaixo do limite
    if (newImages.length < maxImages && error?.includes('máximo')) {
      setError(null);
    }
    
    // Revogar a URL do objeto para evitar vazamentos de memória
    if (imageToDelete) {
      URL.revokeObjectURL(imageToDelete.preview);
    }
  };
  
  // Manipular o fim do arrasto no DnD
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        // Encontrar os índices das imagens
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Se a imagem que está sendo arrastada é a de capa, não permitir movê-la
        if (items[oldIndex].isCover) {
          return items;
        }
        
        // Se a posição de destino é onde está a imagem de capa, não permitir sobrepor
        if (items[newIndex].isCover) {
          return items;
        }
        
        // Reordenar o array normalmente se não envolver a imagem de capa
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Atualizar o onChange com a nova ordem de arquivos
        onChange(newArray.map(img => img.file));
        
        return newArray;
      });
    }
  };
  
  // Abrir diálogo de arquivo
  const openFileDialog = () => {
    console.log("openFileDialog called", fileInputRef.current);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Alternar seção de ajuda
  const toggleHelp = () => {
    setShowHelp(prev => !prev);
  };
  
  // Encontrar a imagem de capa
  const coverImage = images.find(img => img.isCover);
  const hasCover = !!coverImage;

  // Filtrar apenas as imagens que não são capa para exibir na seção de miniaturas
  const nonCoverImages = images.filter(img => !img.isCover);
  
  // Input de arquivo compartilhado - colocado fora dos componentes condicionais
  const fileInputElement = (
    <FileInput
      {...props}
      id={id}
      ref={fileInputRef}
      type="file"
      accept={allowedTypes.join(',')}
      multiple
      onChange={(e) => handleFileSelect(e.target.files)}
      onClick={(e) => e.stopPropagation()}
    />
  );
  
  return (
    <UploaderContainer className={className}>
      {/* Incluir o input de arquivo no início para garantir que esteja sempre no DOM */}
      {fileInputElement}
      
      <UploaderHeader>
        <HeaderLeft>
          <UploaderTitle>
            <FaImages /> {label}
          </UploaderTitle>
          <HelpButton 
            onClick={toggleHelp} 
            title={showHelp ? "Ocultar ajuda" : "Mostrar ajuda"}
            className={showHelp ? "active help-visible" : "help-hidden"}
          >
            <FaQuestionCircle />
          </HelpButton>
        </HeaderLeft>
        <HeaderRight>
          <ImageCount>
            {images.length} / {maxImages}
          </ImageCount>
        </HeaderRight>
      </UploaderHeader>
      
      {/* Área principal: Dropzone ou Galeria de imagens */}
      {images.length === 0 ? (
        // Exibir apenas dropzone quando não há imagens
        <DropZone
          $isDragging={isDragging}
          $isError={!!error}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openFileDialog();
          }}
        >
          <UploadIcon>
            <FaCloudUploadAlt />
          </UploadIcon>
          <DropText>
            Arraste e solte imagens aqui ou <BrowseText onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openFileDialog();
            }}>escolha arquivos</BrowseText>
          </DropText>
          <HelpText>
            JPG, PNG, WebP • Máximo de {maxSizeInMB}MB por arquivo
          </HelpText>
        </DropZone>
      ) : (
        // Exibir galeria quando há imagens
        <GalleryContainer>
          {/* Seção da imagem de capa */}
          <CoverSection>
            <CoverHeader>
              <CoverTitle>
                <FaStar /> Imagem de Capa
              </CoverTitle>
            </CoverHeader>
            
            <CoverWrapper id="cover-image-container" className={hasCover ? 'has-cover' : ''}>
              {hasCover ? (
                <>
                  <ImagePreview $backgroundImage={coverImage.preview}>
                    <ProgressOverlay $uploading={!!coverImage.uploading}>
                      {coverImage.uploading ? 'Enviando...' : ''}
                    </ProgressOverlay>
                  </ImagePreview>
                  <ImageActions className="cover-actions">
                    <ActionButtonSmall 
                      className="delete-btn"
                      onClick={() => handleDelete(coverImage.id)}
                      title="Remover imagem"
                    >
                      <FaTrashAlt />
                    </ActionButtonSmall>
                  </ImageActions>
                </>
              ) : (
                <CoverPlaceholder>
                  <FaCamera />
                  <p>Selecione uma imagem de capa clicando na estrela em uma das miniaturas abaixo</p>
                </CoverPlaceholder>
              )}
            </CoverWrapper>
          </CoverSection>
          
          {/* Seção de miniaturas com DnD */}
          <ThumbnailsSection>
            <ThumbnailsHeader>
              <ThumbnailsTitle>
                <FaImages /> Todas as Imagens
              </ThumbnailsTitle>
            </ThumbnailsHeader>
            
            <ThumbnailsHelpText>
              <FaExchangeAlt />
              <div>
                <span>Organize suas imagens:</span> Clique e arraste diretamente nas imagens para reordenar. Clique na <FaStar style={{ fontSize: '0.9rem', verticalAlign: 'middle', color: '#eab308' }} /> para definir como capa.
              </div>
            </ThumbnailsHelpText>
            
            {/* DnD Context para arrastar e soltar */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={images.map(img => img.id)}
                strategy={horizontalListSortingStrategy}
              >
                <ThumbnailsGrid>
                  {images.map((img, index) => (
                    <SortableImageItem
                      key={img.id}
                      id={img.id}
                      image={img}
                      index={index}
                      onSetCover={handleSetCover}
                      onDelete={handleDelete}
                    />
                  ))}
                </ThumbnailsGrid>
              </SortableContext>
            </DndContext>
            
            {/* Apenas um botão de adicionar mais imagens */}
            {images.length < maxImages && (
              <AddMoreButton 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openFileDialog();
                }}
                className="main-add-button"
                type="button"
              >
                <FaPlus /> Adicionar mais imagens
              </AddMoreButton>
            )}
            
            {/* Informações sobre o número de imagens */}
            <ImageCountFooter>
              <span>{images.length} {images.length === 1 ? 'imagem' : 'imagens'} carregada{images.length === 1 ? '' : 's'}</span>
              {images.length < maxImages && (
                <span>Você pode adicionar mais {maxImages - images.length} {maxImages - images.length === 1 ? 'imagem' : 'imagens'}</span>
              )}
            </ImageCountFooter>
          </ThumbnailsSection>
          
          {/* Seção de ajuda */}
          {showHelp && (
            <HelpCard>
              <h5><FaInfo /> Como organizar suas imagens</h5>
              <ul>
                <li>Arraste as imagens para reordená-las facilmente</li>
                <li>Clique na estrela para definir uma imagem como capa</li>
                <li>A imagem de capa será a principal da sua rifa</li>
                <li>Clique na lixeira para remover uma imagem</li>
              </ul>
            </HelpCard>
          )}
        </GalleryContainer>
      )}
      
      {/* Exibir mensagem de erro */}
      {error && (
        <ErrorText>
          <FaExclamationTriangle /> {error}
        </ErrorText>
      )}
      
      <style jsx global>{`
        .has-cover {
          animation: pulse 1.5s;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(106, 17, 203, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(106, 17, 203, 0); }
          100% { box-shadow: 0 0 0 0 rgba(106, 17, 203, 0); }
        }
        
        .is-cover {
          border: 3px solid #eab308;
        }
        
        .dragging {
          z-index: 1000;
          cursor: grabbing !important;
          box-shadow: 0 15px 30px rgba(106, 17, 203, 0.25) !important;
          opacity: 0.7 !important;
        }
        
        /* Estilo de cursor para todos os itens arrastáveis */
        [role="button"] {
          cursor: grab !important;
        }
        
        /* Estilo durante o arrasto */
        html.dragging * {
          cursor: grabbing !important;
        }
        
        @media (max-width: 768px) {
          .mobile-add-button {
            display: none;
          }
          
          .main-add-button {
            width: 100%;
            padding: 12px;
            justify-content: center;
            margin-top: 16px;
          }
          
          .thumbnail-actions {
            display: flex;
            gap: 8px;
          }
          
          .is-cover {
            border-width: 3px;
          }
        }
      `}</style>
    </UploaderContainer>
  );
};

export default MultipleImageUploader; 