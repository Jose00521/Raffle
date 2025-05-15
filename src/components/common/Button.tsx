import React, { ReactNode } from 'react';
import styled, { css } from 'styled-components';

interface ButtonProps {
  children: ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  className?: string;
  $primary?: boolean;
  $outline?: boolean;
  $danger?: boolean;
  $success?: boolean;
  $fullWidth?: boolean;
  $size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
}

// Estilos base do botão
const BaseButton = styled.button<{
  $primary?: boolean;
  $outline?: boolean;
  $danger?: boolean;
  $success?: boolean;
  $fullWidth?: boolean;
  $size?: 'sm' | 'md' | 'lg';
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  
  ${props => props.$fullWidth && css`
    width: 100%;
  `}
  
  // Variações de tamanho
  ${props => {
    switch (props.$size) {
      case 'sm':
        return css`
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
        `;
      case 'lg':
        return css`
          padding: 0.75rem 1.75rem;
          font-size: 1rem;
        `;
      default: // 'md' é o padrão
        return css`
          padding: 0.625rem 1.5rem;
          font-size: 0.95rem;
        `;
    }
  }}
  
  // Variações de cor e estilo
  ${props => {
    if (props.$primary) {
      return css`
        background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(106, 17, 203, 0.2);
        }
        
        &:active {
          transform: translateY(0);
        }
      `;
    }
    
    if (props.$danger) {
      return css`
        background: linear-gradient(to right, #ef4444, #dc2626);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(239, 68, 68, 0.2);
        }
      `;
    }
    
    if (props.$success) {
      return css`
        background: linear-gradient(to right, #10b981, #059669);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(16, 185, 129, 0.2);
        }
      `;
    }
    
    if (props.$outline) {
      return css`
        background: transparent;
        border: 2px solid #6a11cb;
        color: #6a11cb;
        
        &:hover {
          background: rgba(106, 17, 203, 0.05);
          transform: translateY(-2px);
        }
      `;
    }
    
    // Estilo padrão (secondary)
    return css`
      background: #f8f9fa;
      color: #333;
      border: 1px solid #e9ecef;
      
      &:hover {
        background: #f1f3f5;
        transform: translateY(-2px);
      }
    `;
  }}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className,
  $primary = false,
  $outline = false,
  $danger = false,
  $success = false,
  $fullWidth = false,
  $size = 'md',
  icon,
}) => {
  return (
    <BaseButton
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      $primary={$primary}
      $outline={$outline}
      $danger={$danger}
      $success={$success}
      $fullWidth={$fullWidth}
      $size={$size}
    >
      {icon && icon}
      {children}
    </BaseButton>
  );
};

export default Button; 