'use client';

import React, { useState, useEffect, ReactNode, useRef } from 'react';
import styled from 'styled-components';
import { FaEyeDropper, FaExclamationCircle } from 'react-icons/fa';

interface FormColorInputProps {
  id: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  fullWidth?: boolean;
  className?: string;
  defaultColor?: string;
  icon?: ReactNode;
  helpText?: string;
}

const InputGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${props => props.$fullWidth ? '1 0 100%' : '1'};
  margin-bottom: 24px;
  position: relative;
`;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const InputLabel = styled.label`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
`;

const ColorPreviewContainer = styled.div<{ $hasError?: boolean }>`
  position: relative;
  height: 55px;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : 'rgba(0, 0, 0, 0)'};
  border-radius: 8px;
  background-color: #f8f9fa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  transition: all 0.2s ease;
  
  &:focus-within {
    border-color: ${props => props.$hasError ? '#ef4444' : '#6a11cb'};
    background-color: white;
  }
`;

const ColorPreview = styled.div<{ $color: string }>`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 55px;
  background-color: ${props => props.$color};
  border-right: 1px solid rgba(0, 0, 0, 0.05);
`;

const HexInput = styled.input`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0 15px 0 70px;
  font-size: 1rem;
  color: #333;
  
  &:focus {
    outline: none;
  }
  
  &:disabled {
    background-color: #f1f5f9;
    cursor: not-allowed;
  }
`;

const ColorPickerWrapper = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  z-index: 5; // Aumentar z-index para garantir que esteja acima
`;

const NativeColorPicker = styled.input`
  position: absolute;
  left: -5px;
  top: -5px;
  width: 40px;
  height: 40px;
  border: none;
  opacity: 0;
  cursor: pointer;
  z-index: 10; // Aumentar z-index para estar acima do ícone
  
  &::-webkit-color-swatch-wrapper {
    padding: 0;
  }
  
  &::-webkit-color-swatch {
    border: none;
  }
`;

const ColorPickerIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  color: #64748b;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    color: #475569;
  }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 14px;
  min-height: 14px;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #64748b;
  margin: 6px 0 0 0;
`;

const FormColorInput: React.FC<FormColorInputProps> = ({
  id,
  name = id,
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  fullWidth = false,
  className,
  defaultColor = '#6366f1',
  icon,
  helpText
}) => {
  const [localValue, setLocalValue] = useState<string>(value || defaultColor);
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  // Sincronizar o valor local com o valor do prop
  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setLocalValue(newColor);
    onChange(newColor);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Garantir que comece com #
    if (newValue.length > 0 && !newValue.startsWith('#')) {
      newValue = '#' + newValue;
    }
    
    // Validar se é um formato de cor válido (# + 3 ou 6 caracteres hexadecimais)
    if (newValue === '#' || /^#([0-9A-Fa-f]{3}){1,2}$/.test(newValue)) {
      setLocalValue(newValue);
      onChange(newValue);
    }
  };

  // Se estiver em branco, quando perder o foco, restaurar para valor padrão
  const handleHexBlur = () => {
    if (!localValue || localValue === '#') {
      setLocalValue(defaultColor);
      onChange(defaultColor);
    }
    
    if (onBlur) {
      onBlur();
    }
  };

  // Função para abrir o seletor de cores
  const openColorPicker = () => {
    if (colorInputRef.current && !disabled) {
      colorInputRef.current.click();
    }
  };

  return (
    <InputGroup $fullWidth={fullWidth} className={className}>
      <LabelContainer>
        <InputLabel htmlFor={id}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </InputLabel>
      </LabelContainer>
      
      <ColorPreviewContainer $hasError={!!error}>
        <ColorPreview $color={localValue || defaultColor} />
        <HexInput 
          type="text"
          id={id}
          name={name}
          value={localValue || ''}
          onChange={handleHexChange}
          onBlur={handleHexBlur}
          disabled={disabled}
          placeholder="#000000"
          maxLength={7}
        />
        
        <ColorPickerWrapper onClick={openColorPicker}>
          <NativeColorPicker 
            type="color"
            value={localValue}
            onChange={handleColorChange}
            disabled={disabled}
            ref={colorInputRef}
          />
          <ColorPickerIcon>
            <FaEyeDropper size={14} />
          </ColorPickerIcon>
        </ColorPickerWrapper>
      </ColorPreviewContainer>
      
      {helpText && (
        <HelpText>{helpText}</HelpText>
      )}
      
      {error && (
        <ErrorText>
          <ErrorIcon />
          {error}
        </ErrorText>
      )}
    </InputGroup>
  );
};

export default FormColorInput; 