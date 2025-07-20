// src/hooks/usePasswordConfirmation.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import debounce from 'lodash/debounce';

interface UsePhoneConfirmationProps {
  phone: {
    text: string;
    value: string;
  };
  confirmPhone: {
    text: string;
    value: string;
  };
  setError?: UseFormSetError<any>;
  clearErrors?: UseFormClearErrors<any>;
  debounceTime?: number;
}

/**
 * Hook personalizado para validar a confirmação de senha em tempo real com debounce
 * Utiliza o debounce do Lodash para melhor performance
 */
export const usePhoneConfirmation = ({
  phone,
  confirmPhone,
  setError,
  clearErrors,
  debounceTime = 300
}: UsePhoneConfirmationProps) => {
  const [phonesMatch, setPhonesMatch] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Criar a função de validação debounced usando Lodash
  const debouncedValidate = useRef(
    debounce((phone: {text: string, value: string}, confirmPhone: {text: string, value: string}) => {
        const phoneValue = phone.value.replace(/\D/g, '');
        const confirmPhoneValue = confirmPhone.value.replace(/\D/g, '');

        if (phoneValue.length < 11 || confirmPhoneValue.length < 11) {
            setPhonesMatch(null);
            setIsValidating(false);
            return;
        }

      if (!phoneValue || !confirmPhoneValue) {
        setPhonesMatch(null);
        setIsValidating(false);
        return;
      }

      const match = phoneValue === confirmPhoneValue;
      setPhonesMatch(match);

      // Atualizar os erros do formulário se os callbacks foram fornecidos
      if (setError && clearErrors) {
        if (!match) {
          setError(confirmPhone.text, { 
            type: 'manual', 
            message: 'Os telefones não conferem' 
          });
        } else {
          clearErrors(confirmPhone.text);
        }
      }

      setIsValidating(false);
    }, debounceTime)
  ).current;

  // Limpar o debounce quando o componente for desmontado
  useEffect(() => {
    return () => {
      debouncedValidate.cancel();
    };
  }, [debouncedValidate]);

  // Disparar a validação quando as senhas mudarem
  useEffect(() => {
    if (confirmPhone.value.length > 0) {
      setIsValidating(true);
      debouncedValidate(phone, confirmPhone);
    } else {
      setPhonesMatch(null);
      // Limpar erro se o campo estiver vazio
      if (clearErrors) {
        clearErrors('confirmarSenha');
      }
    }
  }, [phone.value, confirmPhone.value, clearErrors, debouncedValidate]);

  return { 
    phonesMatch, 
    isValidating 
  };
};