'use client';

import React, { useState, ReactNode, useEffect, useRef, useCallback, forwardRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';

interface FormInputProps {
  id: string;
  name?: string;
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  type?: string;
  value?: string | number | Date;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  isPassword?: boolean;
  fullWidth?: boolean;
  className?: string;
  mask?: 'cpf' | 'phone' | 'cep' | 'uf' | string;
  currency?: string;
  ref?: React.Ref<HTMLInputElement>;
}

const InputGroup = styled.div<{ $fullWidth?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: ${props => props.$fullWidth ? '1 0 100%' : '1'};
  margin-bottom: 24px;
  position: relative;

  
  @media (max-height: 900px) {
    margin-bottom: 20px;
    min-height: 78px;
  }
  
  @media (max-height: 800px) {
    margin-bottom: 16px;
    min-height: 74px;
  }
  
  @media (max-height: 700px) {
    margin-bottom: 12px;
    min-height: 70px;
  }
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-height: 800px) {
    margin-bottom: 6px;
    font-size: 0.85rem;
  }
  
  @media (max-height: 700px) {
    margin-bottom: 4px;
    font-size: 0.8rem;
  }
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
  
  @media (max-height: 800px) {
    left: 10px;
    font-size: 0.9em;
  }
  
  @media (max-height: 700px) {
    left: 8px;
    font-size: 0.85em;
  }
`;

const StyledInput = styled.input<{ $hasIcon: boolean; $hasError?: boolean }>`
  width: 100%;
  border: ${props => props.$hasError ? '2px solid #ef4444' : '2px solid rgba(0, 0, 0, 0)'};
  padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '0 15px'};
  padding-right: 40px; /* Ensure space for password toggle button */
  border-radius: 8px;
  background-color: #f8f9fa;
  font-size: 1.0rem;
  transition: all 0.2s;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  color: #333;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border: 2px solid ${props => props.$hasError ? '#ef4444' : '#6a11cb'};
    border-color: ${props => props.$hasError ? '#ef4444' : '#6a11cb'};
    background-color: white;
    
  }
  
  &:disabled {
    background-color: #f3f4f6;
    cursor: not-allowed;
  }
  
  &::placeholder {
    color: #6d7280;
    opacity: 0.8;
  }
  
  @media (max-height: 900px) {
    height: 55px !important;
  }
  
  @media (max-height: 800px) {

    font-size: 1rem;
      padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '0 15px'};
  }
  
  @media (max-height: 700px) {
    height: 55px !important;
    font-size:1rem;
  padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '0 15px'};
  }
  
  @media (max-width: 768px) {
    height: 55px !important;
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    height: 55px !important;
    font-size:1rem;
  }
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  &:hover {
    color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  }
  
  &:focus {
    outline: none;
  }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ErrorText = styled.div`
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 6px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  animation: ${fadeIn} 0.2s ease;
  position: absolute;
  bottom: -22px;
  left: 0;
  right: 0;
  min-height: 16px;
  
  @media (max-height: 800px) {
    margin-top: 4px;
    font-size: 0.75rem;
    bottom: -20px;
  }
  
  @media (max-height: 700px) {
    margin-top: 3px;
    font-size: 0.7rem;
    bottom: -18px;
  }
`;

const ErrorIcon = styled(FaExclamationCircle)`
  min-width: 14px;
  min-height: 14px;
`;

// Função para formatar valor como moeda
const formatCurrency = (value: string, currencySymbol: string = 'R$'): string => {
  // Remove todos os caracteres não numéricos exceto vírgula e ponto
  let numericValue = value.replace(/[^\d.,]/g, '');
  
  // Converte para o formato de número com 2 casas decimais
  let cleanValue = numericValue.replace(/[^\d]/g, '');
  
  // Se não tiver valor, retorna vazio
  if (!cleanValue) return '';
  
  // Formata o número como monetário (123456.78 => 123.456,78)
  // Primeiro converte para centavos
  const cents = parseInt(cleanValue, 10);
  
  // Divide por 100 para obter o valor real (com 2 casas decimais)
  const valueWithDecimals = (cents / 100).toFixed(2);
  
  // Substitui ponto por vírgula para o formato brasileiro
  const decimalPart = valueWithDecimals.split('.')[1];
  
  // Formata a parte inteira com separadores de milhar
  let integerPart = valueWithDecimals.split('.')[0];
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  // Retorna o valor formatado com o símbolo da moeda
  return `${currencySymbol} ${integerPart},${decimalPart}`;
};

// Função para obter o valor numérico sem formatação
const parseCurrencyToNumber = (formattedValue: string): number => {
  // Remove o símbolo da moeda e espaços
  const cleanValue = formattedValue.replace(/[^\d.,]/g, '')
    // Substitui vírgula por ponto para cálculos
    .replace(',', '.');
  
  // Converte para número
  return parseFloat(cleanValue) || 0;
};

const CurrencyInput = forwardRef<HTMLInputElement, FormInputProps>(({
  id,
  name = id,
  label,
  icon,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  disabled = false,
  required = false,
  min,
  max,
  step,
  isPassword = false,
  fullWidth = false,
  className,
  currency,
  ...props
}, ref) => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [displayValue, setDisplayValue] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  
  // Merge dos refs para permitir acesso ao ref interno e ao ref fornecido pelo usuário
  const setMergedRef = useCallback((element: HTMLInputElement) => {
    inputRef.current = element;
    
    // Encaminhar o ref
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = element;
    }
  }, [ref]);
  
  // Inicializar valor de exibição
  useEffect(() => {
    if (value !== undefined) {
      if (currency) {
        // Se for um formato de moeda
        if (typeof value === 'number') {
          // Se for um número, formatar como moeda
          setDisplayValue(formatCurrency(value.toString(), currency));
        } else if (typeof value === 'string') {
          // Se for uma string, verificar se é válido e formatar
          const numericValue = value.replace(/[^\d.,]/g, '');
          if (numericValue) {
            setDisplayValue(formatCurrency(numericValue, currency));
          } else {
            setDisplayValue('');
          }
        } else {
          setDisplayValue('');
        }
      } else {
        // Para outros tipos, apenas converter para string
        setDisplayValue(value?.toString() || '');
      }
    } else {
      setDisplayValue('');
    }
  }, [value, currency]);
  
  // Manipular mudanças no campo quando é uma moeda
  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remover formatação para processar apenas números
    const numericValue = inputValue.replace(/[^\d]/g, '');
    
    // Formatar o valor como moeda
    const formattedValue = formatCurrency(numericValue, currency);
    
    // Atualizar o valor exibido
    setDisplayValue(formattedValue);
    
    // Criar um evento sintético para passar o valor sem formatação
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: parseCurrencyToNumber(formattedValue).toString()
      }
    };
    
    // Chamar o onChange do componente pai
    onChange?.(syntheticEvent as any);
  };
  
  // Manipular eventos de foco e clique para melhorar a experiência com moeda
  const handleCurrencyFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Ao receber foco, posicionar o cursor no final
    const input = e.target;
    setTimeout(() => {
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;
    }, 0);
    
    // Chamar o onFocus original
    onFocus?.(e);
  };
  
  const togglePasswordVisibility = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setShowPassword(prev => !prev);
  }, []);

  useEffect(() => {
    setLocalError(error);
  }, [error]);
  
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  
  return (
    <InputGroup $fullWidth={fullWidth} className={className}>
      <InputLabel htmlFor={id}>
        {label}
        {required && <RequiredMark>*</RequiredMark>}
      </InputLabel>
      
      <InputWrapper>
        {icon && <InputIcon>{icon}</InputIcon>}
        
        <StyledInput
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          step={step}
          $hasIcon={!!icon}
          $hasError={!!localError}
          autoComplete={isPassword ? 'new-password' : 'on'}
          ref={setMergedRef}
          value={displayValue}
          onChange={currency ? handleCurrencyChange : onChange}
          onFocus={currency ? handleCurrencyFocus : onFocus}
          {...props}
        />
        
        {isPassword && (
          <TogglePasswordButton 
            type="button" 
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
          >
            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
          </TogglePasswordButton>
        )}
      </InputWrapper>
      
      {localError ? (
        <ErrorText>
          <ErrorIcon />
          {localError}
        </ErrorText>
      ) : (
        <ErrorText style={{ visibility: 'hidden', pointerEvents: 'none' }} aria-hidden="true">
          <ErrorIcon />
          &nbsp;
        </ErrorText>
      )}
    </InputGroup>
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default React.memo(CurrencyInput); 