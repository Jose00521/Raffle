'use client';

import { useState } from 'react';
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form';

interface UseAddressFieldProps {
  setValue: UseFormSetValue<any>;
  trigger: UseFormTrigger<any>;
}

interface AddressFromCep {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

/**
 * Hook personalizado para gerenciar campos de endereço
 * - Busca de endereço por CEP
 * - Preenchimento automático dos campos de endereço
 */
export const useAddressField = ({ setValue, trigger }: UseAddressFieldProps) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    
    if (cep.length !== 8) {
      setCepError('CEP deve conter 8 dígitos');
      return;
    }
    
    try {
      setIsLoadingCep(true);
      setCepError(null);
      
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data: AddressFromCep = await response.json();
      
      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }
      
      setValue('endereco', data.logradouro, { shouldValidate: true });
      setValue('bairro', data.bairro, { shouldValidate: true });
      setValue('cidade', data.localidade, { shouldValidate: true });
      setValue('estado', data.uf, { shouldValidate: true });
      
      // Trigger validation for address fields
      trigger(['endereco', 'bairro', 'cidade', 'estado']);
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      setCepError('Erro ao buscar o CEP. Tente novamente.');
    } finally {
      setIsLoadingCep(false);
    }
  };

  return {
    isLoadingCep,
    cepError,
    handleCepBlur
  };
}; 