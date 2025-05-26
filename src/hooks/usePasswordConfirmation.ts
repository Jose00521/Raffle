// src/hooks/usePasswordConfirmation.ts
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import debounce from 'lodash/debounce';

interface UsePasswordConfirmationProps {
  password: string;
  confirmPassword: string;
  setError?: UseFormSetError<any>;
  clearErrors?: UseFormClearErrors<any>;
  debounceTime?: number;
}

/**
 * Hook personalizado para validar a confirmação de senha em tempo real com debounce
 * Utiliza o debounce do Lodash para melhor performance
 */
export const usePasswordConfirmation = ({
  password,
  confirmPassword,
  setError,
  clearErrors,
  debounceTime = 300
}: UsePasswordConfirmationProps) => {
  const [passwordsMatch, setPasswordsMatch] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // Criar a função de validação debounced usando Lodash
  const debouncedValidate = useRef(
    debounce((password: string, confirmPassword: string) => {
      if (!password || !confirmPassword) {
        setPasswordsMatch(null);
        setIsValidating(false);
        return;
      }

      const match = password === confirmPassword;
      setPasswordsMatch(match);

      // Atualizar os erros do formulário se os callbacks foram fornecidos
      if (setError && clearErrors) {
        if (!match) {
          setError('confirmarSenha', { 
            type: 'manual', 
            message: 'As senhas não conferem' 
          });
        } else {
          clearErrors('confirmarSenha');
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
    if (confirmPassword.length > 0) {
      setIsValidating(true);
      debouncedValidate(password, confirmPassword);
    } else {
      setPasswordsMatch(null);
      // Limpar erro se o campo estiver vazio
      if (clearErrors) {
        clearErrors('confirmarSenha');
      }
    }
  }, [password, confirmPassword, clearErrors, debouncedValidate]);

  return { 
    passwordsMatch, 
    isValidating 
  };
};