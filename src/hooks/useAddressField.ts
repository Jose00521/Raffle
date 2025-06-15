'use client';

import { useState } from 'react';
import { UseFormClearErrors, UseFormSetError, UseFormSetValue, UseFormTrigger } from 'react-hook-form';

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
export const useAddressField = (setValues: UseFormSetValue<any>, setError: UseFormSetError<any>,clearErrors: UseFormClearErrors<any>,trigger: UseFormTrigger<any>) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');

    console.log(cep);
    
    if (cep.length === 8) {
      console.log('cep valido');
        try {
          setIsLoadingCep(true);
          
          const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
          const data: AddressFromCep = await response.json();
          
          if (data.erro) {
            setError('cep', { message: 'CEP não encontrado' });
            setValues('logradouro', '', { shouldValidate: true });
            setValues('bairro', '', { shouldValidate: true });
            setValues('cidade', '', { shouldValidate: true });
            setValues('uf', '', { shouldValidate: true });

            
            return;
          }else{
            setValues('logradouro', data.logradouro, { shouldValidate: true });
            setValues('bairro', data.bairro, { shouldValidate: true });
            setValues('cidade', data.localidade, { shouldValidate: true });
            setValues('uf', data.uf, { shouldValidate: true });

            const triggerFields = ['logradouro', 'bairro', 'cidade','uf'	];
            const isTriggerSuccess = await trigger(triggerFields)
            if(isTriggerSuccess){ 
              clearErrors('cep');
            }else{
              setError('cep', { message: 'Erro ao buscar o CEP. Tente novamente.' });
              setValues('logradouro', '', { shouldValidate: true });
              setValues('bairro', '', { shouldValidate: true });
              setValues('cidade', '', { shouldValidate: true });
              setValues('uf', '', { shouldValidate: true });
            }
          
        
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setError('cep', { message: 'Erro ao buscar o CEP. Tente novamente.' });
      } finally {
        setIsLoadingCep(false);
      }

    }
    
  };



  const clearAddressFields = () => {
    setValues('cep', '');
    setValues('logradouro', '');
    setValues('numero', '');
    setValues('bairro', '');
    setValues('cidade', '');
    setValues('uf', '');
  }

  return {
    isLoadingCep,
    cepError,
    clearAddressFields,
    handleCepChange
  };
}; 