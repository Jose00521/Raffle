'use client';

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 1000;
  overflow-y: auto;
  padding: 0.5rem;
`;

const ModalContainer = styled.div<{ maxWidth?: string }>`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  position: relative;
  width: 100%;
  max-width: ${props => props.maxWidth || '800px'};
  margin: 2rem auto;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 640px) {
    padding: 1.25rem;
    margin: 0.5rem auto;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, maxWidth }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close when clicking outside
  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
  //       onClose();
  //     }
  //   };

  //   if (isOpen) {
  //     document.addEventListener('mousedown', handleClickOutside);
  //     // Prevent body scroll when modal is open
  //     document.body.style.overflow = 'hidden';
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside);
  //     document.body.style.overflow = 'auto';
  //   };
  // }, [isOpen, onClose]);
  
  // Close on escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);
  
  // Previne o scroll do body quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const ModalContent = (
    <ModalOverlay onClick={onClose}>
      <ModalContainer 
        maxWidth={maxWidth} 
        onClick={e => e.stopPropagation()}
      >
        {children}
      </ModalContainer>
    </ModalOverlay>
  );

  // Use portal for better accessibility and to avoid z-index issues
  return typeof document !== 'undefined' 
    ? createPortal(ModalContent, document.body) 
    : null;
};

export default Modal; 