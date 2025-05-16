'use client';

import React, { ReactNode } from 'react';
import styled from 'styled-components';

interface FormTextAreaProps {
  id: string;
  label: string;
  icon?: ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  rows?: number;
}

const InputGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${props => props.$fullWidth ? '1 0 100%' : '1'};
  margin-bottom: 28px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 14px;
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
  
  svg {
    font-size: 1.1rem;
  }
`;

const StyledTextArea = styled.textarea<{ $hasIcon: boolean; $hasError?: boolean }>`
  width: 100%;
  min-height: 120px;
  padding: ${props => props.$hasIcon ? '14px 16px 14px 42px' : '14px 16px'};
  border-radius: 10px;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : props.$hasIcon ? 'rgba(106, 17, 203, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
  background-color: ${props => props.$hasIcon ? 'rgba(106, 17, 203, 0.02)' : 'white'};
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  resize: vertical;
  font-family: inherit;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ef4444' : '#6a11cb'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(106, 17, 203, 0.1)'};
    background-color: white;
  }
  
  &:disabled {
    background-color: #f5f5f5;
    border-color: rgba(0, 0, 0, 0.05);
    cursor: not-allowed;
    opacity: 0.8;
  }
  
  &::placeholder {
    color: #6d7280;
    opacity: 0.8;
  }
  
  @media (max-width: 768px) {
    min-height: 100px;
    font-size: 0.9rem;
    padding: ${props => props.$hasIcon ? '12px 14px 12px 38px' : '12px 14px'};
  }
  
  @media (max-width: 480px) {
    min-height: 90px;
    font-size: 0.85rem;
    padding: ${props => props.$hasIcon ? '10px 12px 10px 36px' : '10px 12px'};
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  
  svg {
    font-size: 0.9rem;
  }
`;

const FormTextArea: React.FC<FormTextAreaProps> = ({
  id,
  label,
  icon,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  className,
  rows = 4
}) => {
  return (
    <InputGroup $fullWidth={fullWidth} className={className}>
      <InputLabel htmlFor={id}>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </InputLabel>
      
      <InputWrapper>
        {icon && <InputIcon>{icon}</InputIcon>}
        
        <StyledTextArea
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          $hasIcon={!!icon}
          $hasError={!!error}
          rows={rows}
        />
      </InputWrapper>
      
      {error && <ErrorText>{error}</ErrorText>}
    </InputGroup>
  );
};

export default FormTextArea; 