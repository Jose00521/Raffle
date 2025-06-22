'use client';

import React, { useState, ReactNode, useEffect, useRef, useCallback, forwardRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { FaEye, FaEyeSlash, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import { formatCurrency, parseCurrencyToNumber, formatCurrencyForTyping, stripCurrencyFormat } from '@/utils/formatNumber';

interface FormInputProps {  
  id: string;
  name?: string;
  label?: string;
  icon?: ReactNode;
  placeholder?: string;
  type?: string;
  value?: string | number;
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
  helpText?: string;
  ref?: React.Ref<HTMLInputElement>;
  allowNegative?: boolean;
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

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  @media (max-height: 800px) {
    margin-bottom: 6px;
  }
  
  @media (max-height: 700px) {
    margin-bottom: 4px;
  }
`;

const InputLabel = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (max-height: 800px) {
    font-size: 0.85rem;
  }
  
  @media (max-height: 700px) {
    font-size: 0.8rem;
  }
`;

const RequiredMark = styled.span`
  color: #ef4444;
  margin-left: 4px;
`;

const HelpIconWrapper = styled.div`
  position: relative;
  margin-left: 6px;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
`;

const HelpIcon = styled(FaInfoCircle)`
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  font-size: 16px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors?.secondary || '#2575fc'};
  }
  
  @media (max-height: 800px) {
    font-size: 14px;
  }
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
  padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '16px 15px'};
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
    padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '16px 15px'};
  }
  
  @media (max-height: 700px) {
    height: 55px !important;
    font-size:1rem;
    padding: ${props => props.$hasIcon ? '16px 15px 16px 40px' : '16px 15px'};
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

const fadeInTooltip = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Tooltip = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  padding: 10px 14px;
  width: max-content;
  max-width: 250px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  font-size: 0.85rem;
  color: #333;
  z-index: 100;
  opacity: ${props => props.$visible ? 1 : 0};
  visibility: ${props => props.$visible ? 'visible' : 'hidden'};
  animation: ${props => props.$visible ? css`${fadeInTooltip} 0.2s ease` : 'none'};
  font-weight: 400;
  line-height: 1.5;
  pointer-events: none;
  border: 1px solid rgba(106, 17, 203, 0.1);
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: white transparent transparent transparent;
  }
`;

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
  currency = 'BRL',
  helpText,
  allowNegative = false,
  ...props
}, ref) => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  const [displayValue, setDisplayValue] = useState<string>('');
  const [showTooltip, setShowTooltip] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState<string | number>(
    typeof value === 'string' || typeof value === 'number' ? value : ''
  );
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  
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

  // Atualiza a posição do cursor de forma controlada e segura
  const updateCursorPosition = useCallback(() => {
    if (isFocused && cursorPosition !== null && inputRef.current) {
      setTimeout(() => {
        if (inputRef.current) {
          try {
            inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
          } catch (error) {
            console.warn('Erro ao atualizar posição do cursor:', error);
          }
        }
      }, 0);
    }
  }, [cursorPosition, isFocused]);

  // Use effect para atualizar a posição do cursor após a renderização
  useEffect(() => {
    updateCursorPosition();
  }, [displayValue, updateCursorPosition]);
  
  // Atualiza o valor interno quando o valor externo muda
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);
  
  // Inicializar valor de exibição apenas na primeira renderização ou quando o value muda externamente
  useEffect(() => {
    // Verificar se o input está focado - se estiver, não atualizar o valor para não interferir na digitação
    if (document.activeElement === inputRef.current) {
      return;
    }
    
    if (value !== undefined) {
      if (currency) {
        // Se for um formato de moeda
        if (typeof value === 'number') {
          // Se for um número, formatar como moeda
          setDisplayValue(formatCurrency(value, currency));
        } else if (typeof value === 'string') {
          // Se for uma string, verificar se é válido e formatar
          const numericValue = parseCurrencyToNumber(value);
          if (numericValue !== 0 || value.trim() !== '') {
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
    const currentCursorPosition = e.target.selectionStart || 0;
    
    // Armazenar o valor anterior para cálculo da posição do cursor
    const previousValue = displayValue;
    
    // Se o campo estiver vazio, limpar o valor
    if (!inputValue || inputValue.trim() === '') {
      setDisplayValue('');
      setInternalValue('');
      
      // Criar um evento sintético com valor como string vazia
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          name: e.target.name,
          value: ''
        }
      };
      
      onChange?.(syntheticEvent as any);
      return;
    }

    // Verificar se tem sinal negativo (se permitido)
    const isNegative = allowNegative && inputValue.includes('-');
    
    // Remover formatação e manter apenas dígitos
    let digits = stripCurrencyFormat(inputValue);
    
    // Se não tem dígitos, não processa
    if (!digits) {
      setDisplayValue('');
      setInternalValue('');
      return;
    }
    
    // Converte para number para processamento interno
    let valueInCents = parseInt(digits, 10) || 0;
    
    // Formatar em tempo real para exibição
    let formattedValue = formatCurrencyForTyping(digits, currency);
    
    // Adicionar sinal negativo se necessário
    if (isNegative && allowNegative) {
      formattedValue = '-' + formattedValue;
      valueInCents = -valueInCents;
    }
    
    // Atualizar o valor exibido e valor interno
    setDisplayValue(formattedValue);
    
    // Valor numérico em centavos
    const numericValue = valueInCents / 100;
    setInternalValue(numericValue);
    
    
    // Criar um evento sintético para passar o valor como string para compatibilidade
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name: e.target.name,
        value: numericValue.toString()
      }
    };
    
    // Chamar o onChange do componente pai
    onChange?.(syntheticEvent as any);
  };
  
  // Manipular eventos de foco
  const handleCurrencyFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    
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
  
  // Manipular eventos de blur para formatar o valor quando o campo perde o foco
  const handleCurrencyBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    
    // Formatar o valor quando o campo perde o foco
    if (displayValue) {
      try {
        // Obter o valor numérico
        const numericValue = parseCurrencyToNumber(displayValue);
        
        // Formatar como moeda final
        const formattedValue = formatCurrency(numericValue, currency);
        
        // Atualizar o valor exibido com a formatação completa
        setDisplayValue(formattedValue);
      } catch (error) {
        console.error("Erro ao formatar valor monetário:", error);
      }
    }
    
    // Chamar o onBlur original
    onBlur?.(e);
  };
  
  return (
    <InputGroup $fullWidth={fullWidth} className={className}>
      <LabelContainer>
        <InputLabel htmlFor={id}>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </InputLabel>
        
        {helpText && (
          <HelpIconWrapper 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <HelpIcon />
            <Tooltip $visible={showTooltip}>
              {helpText}
            </Tooltip>
          </HelpIconWrapper>
        )}
      </LabelContainer>
      
      <InputWrapper>
        {icon && <InputIcon>{icon}</InputIcon>}
        
        <StyledInput
          id={id}
          name={name}
          type={inputType}
          placeholder={placeholder || (currency ? `${currency === 'BRL' ? 'R$' : currency} 0,00` : undefined)}
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
          onBlur={currency ? handleCurrencyBlur : onBlur}
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