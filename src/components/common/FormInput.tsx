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

// const applyMaskValue = (value: string, maskType?: string): string => {
//   if (!value || !maskType) return value;
//   // Limpar valor para trabalhar apenas com os caracteres desejados
//   let rawValue = value.replace(/\D/g, '');
  
//   // Aplicar a máscara apropriada
//   switch (maskType) {
//     case 'cpf':
//       // Limitar a 11 dígitos
//       if (rawValue.length > 11) {
//         rawValue = rawValue.slice(0, 11);
//       }
      
//       // Formatar CPF: 000.000.000-00
//       if (rawValue.length > 0) {
//         // Limita a 11 dígitos
//         rawValue = rawValue.slice(0, 11);
        
//         // Aplica máscara
//         if (rawValue.length <= 3) {
//           // Nada a fazer
//         } else if (rawValue.length <= 6) {
//           rawValue = rawValue.replace(/^(\d{3})(\d+)/, '$1.$2');
//         } else if (rawValue.length <= 9) {
//           rawValue = rawValue.replace(/^(\d{3})\.?(\d{3})(\d+)/, '$1.$2.$3');
//         } else {
//           rawValue = rawValue.replace(/^(\d{3})\.?(\d{3})\.?(\d{3})(\d+)/, '$1.$2.$3-$4');
//         }
//       }
//       return rawValue;
      
//     case 'phone':
//     case 'telefone':
//       // Limitar a 11 dígitos e remover não-dígitos
//       rawValue = rawValue.replace(/\D/g, '').slice(0, 11);
      
//       // Formatar telefone: (00) 00000-0000 ou (00) 0000-0000
//       if (rawValue.length > 0) {
//         let formattedValue = '';
        
//         // Adiciona DDD
//         if (rawValue.length >= 2) {
//           formattedValue = `(${rawValue.slice(0, 2)}) `;
          
//           // Adiciona número
//           if (rawValue.length > 2) {
//             // Verifica se é celular (tem 11 dígitos)
//             const isCellphone = rawValue.length > 10;
            
//             if (isCellphone) {
//               // Garante que celular (11 dígitos) comece com 9
//               let rest = rawValue.slice(2);
              
//               // Se o primeiro dígito após o DDD não for 9, insere 9
//               if (rest.length > 0 && rest[0] !== '9') {
//                 rest = '9' + rest.slice(0, -1); // Remove o último dígito para manter 11 dígitos total
//               }
              
//               // Formato: (00) 90000-0000
//               formattedValue += rest.slice(0, 5);
//               if (rest.length > 5) {
//                 formattedValue += '-' + rest.slice(5);
//               }
//             } else {
//               // Formato: (00) 0000-0000
//               const rest = rawValue.slice(2);
//               formattedValue += rest.slice(0, 4);
//               if (rest.length > 4) {
//                 formattedValue += '-' + rest.slice(4);
//               }
//             }
//           }
//         } else {
//           formattedValue = rawValue;
//         }
        
//         return formattedValue;
//       }
//       return rawValue;
      
//     case 'cep':
//       // Limitar a 8 dígitos
//       if (rawValue.length > 8) {
//         rawValue = rawValue.slice(0, 8);
//       }
      
//       // Formatar CEP: 00000-000
//       if (rawValue.length > 5) {
//         rawValue = rawValue.replace(/^(\d{5})(\d)/, '$1-$2');
//       }
//       return rawValue;
      
//     case 'uf':
//       // Limitar a 2 caracteres e converter para maiúsculo
//       return value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
      
//     default:
//       return value;
//   }
// };

// // Função para obter o valor sem máscara
// const getUnmaskedValue = (value: string, maskType?: string): string => {
//   if (!value || !maskType) return value;
  
//   switch (maskType) {
//     case 'cpf':
//     case 'telefone':
//     case 'cep':
//       return value.replace(/\D/g, '');
//     case 'uf':
//       return value.toUpperCase();
//     default:
//       return value;
//   }
// };


const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({
  id,
  name = id,
  label,
  icon,
  placeholder,
  type = 'text',
  value,
  error,
  disabled = false,
  required = false,
  min,
  max,
  step,
  isPassword = false,
  fullWidth = false,
  className,
  ...props
}, ref) => {
  
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | undefined>(error);
  
  // Estado local para controlar o erro
  
  // Atualizar valor de exibição quando o valor de entrada muda
  
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
          ref={ref}
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

FormInput.displayName = 'FormInput';

export default React.memo(FormInput); 