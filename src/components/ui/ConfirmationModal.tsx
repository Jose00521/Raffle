'use client';

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle, FaCheck, FaTimes, FaQuestionCircle, FaInfoCircle, FaTrash } from 'react-icons/fa';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info' | 'success';
  icon?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

// Keyframes para animações
const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
  }
`;

const ripple = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

// Estilos para o modal
const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContainer = styled(motion.div)`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: ${({ theme, color }) => 
      color === 'danger' 
        ? 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)' 
        : color === 'warning'
        ? 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)'
        : color === 'info'
        ? 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
        : color === 'success'
        ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)'
        : 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)'};
  }
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Title = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
  letter-spacing: -0.01em;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 50%;
    transform: scale(0);
    transition: transform 0.2s ease;
  }
  
  &:hover {
    color: #0f172a;
    
    &::before {
      transform: scale(1);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ModalContent = styled.div`
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const IconContainer = styled(motion.div)<{ color: string }>`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  position: relative;
  color: ${({ color }) => 
    color === 'danger' 
      ? '#ef4444' 
      : color === 'warning'
      ? '#f59e0b'
      : color === 'info'
      ? '#3b82f6'
      : color === 'success'
      ? '#10b981'
      : '#6366f1'};
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 50%;
    background: ${({ color }) => 
      color === 'danger' 
        ? 'rgba(239, 68, 68, 0.1)' 
        : color === 'warning'
        ? 'rgba(245, 158, 11, 0.1)'
        : color === 'info'
        ? 'rgba(59, 130, 246, 0.1)'
        : color === 'success'
        ? 'rgba(16, 185, 129, 0.1)'
        : 'rgba(99, 102, 241, 0.1)'};
    z-index: 1;
  }
  
  &::after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    right: -5px;
    bottom: -5px;
    border-radius: 50%;
    border: 2px solid ${({ color }) => 
      color === 'danger' 
        ? 'rgba(239, 68, 68, 0.5)' 
        : color === 'warning'
        ? 'rgba(245, 158, 11, 0.5)'
        : color === 'info'
        ? 'rgba(59, 130, 246, 0.5)'
        : color === 'success'
        ? 'rgba(16, 185, 129, 0.5)'
        : 'rgba(99, 102, 241, 0.5)'};
    animation: ${pulse} 2s infinite;
    z-index: 0;
  }
  
  svg {
    font-size: 40px;
    z-index: 2;
  }
`;

const Ripple = styled(motion.div)<{ color: string }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: ${({ color }) => 
    color === 'danger' 
      ? 'rgba(239, 68, 68, 0.3)' 
      : color === 'warning'
      ? 'rgba(245, 158, 11, 0.3)'
      : color === 'info'
      ? 'rgba(59, 130, 246, 0.3)'
      : color === 'success'
      ? 'rgba(16, 185, 129, 0.3)'
      : 'rgba(99, 102, 241, 0.3)'};
`;

const Message = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #475569;
  text-align: center;
  margin: 0 0 32px;
  max-width: 400px;
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 8px;
  width: 100%;
  
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    gap: 12px;
  }
`;

const Button = styled(motion.button)<{ $variant: 'primary' | 'secondary'; color: string }>`
  flex: 1;
  padding: 14px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: ${({ $variant }) => $variant === 'primary' ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'};
  
  ${({ $variant, color }) => $variant === 'primary' ? `
    color: white;
    border: none;
    background: ${
      color === 'danger' 
        ? 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)' 
        : color === 'warning'
        ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
        : color === 'info'
        ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
        : color === 'success'
        ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
        : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)'};
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px ${
        color === 'danger' 
          ? 'rgba(239, 68, 68, 0.25)' 
          : color === 'warning'
          ? 'rgba(245, 158, 11, 0.25)'
          : color === 'info'
          ? 'rgba(59, 130, 246, 0.25)'
          : color === 'success'
          ? 'rgba(16, 185, 129, 0.25)'
          : 'rgba(99, 102, 241, 0.25)'};
    }
  ` : `
    color: #64748b;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #e2e8f0;
      color: #334155;
    }
  `}
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const getIconByType = (type: string, customIcon?: React.ReactNode) => {
  if (customIcon) return customIcon;
  
  switch (type) {
    case 'warning':
      return <FaExclamationTriangle />;
    case 'danger':
      return <FaTrash />;
    case 'success':
      return <FaCheck />;
    case 'info':
      return <FaInfoCircle />;
    default:
      return <FaQuestionCircle />;
  }
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info',
  icon,
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  };
  
  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25,
        delay: 0.1
      } 
    },
    exit: { 
      scale: 0.95, 
      opacity: 0, 
      y: 20,
      transition: { duration: 0.2 } 
    }
  };
  
  const [showRipple, setShowRipple] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      // Show ripple animation when modal opens
      setShowRipple(true);
      const timer = setTimeout(() => setShowRipple(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  const iconAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.3
      }
    }
  };
  
  const rippleAnimation = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { 
      scale: 2, 
      opacity: 0,
      transition: { duration: 1.2 }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={overlayVariants}
          onClick={closeOnOverlayClick ? onClose : undefined}
        >
          <ModalContainer
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
            color={type}
          >
            <ModalHeader>
              <Title>{title || (type === 'danger' ? 'Confirmar Exclusão' : 'Confirmação')}</Title>
              {showCloseButton && (
                <CloseButton onClick={onClose}>
                  <FaTimes />
                </CloseButton>
              )}
            </ModalHeader>
            
            <ModalContent>
              <IconContainer 
                initial="hidden"
                animate="visible"
                variants={iconAnimation}
                color={type}
              >
                {showRipple && (
                  <Ripple
                    initial="hidden"
                    animate="visible"
                    variants={rippleAnimation}
                    color={type}
                  />
                )}
                {getIconByType(type, icon)}
              </IconContainer>
              
              <Message>{message}</Message>
              
              <ButtonsContainer>
                <Button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  $variant="secondary"
                  onClick={onClose}
                  color={type}
                >
                  {cancelText}
                </Button>
                
                <Button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  $variant="primary"
                  onClick={onConfirm}
                  color={type}
                >
                  {confirmText}
                </Button>
              </ButtonsContainer>
            </ModalContent>
          </ModalContainer>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal; 