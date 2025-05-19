'use client';

import { useState } from 'react';
import { UseFormSetValue, UseFormSetError, UseFormClearErrors } from 'react-hook-form';
import { RegisterFormData } from '../context/FormContext';

type SetValueFunction = UseFormSetValue<RegisterFormData>;
type SetErrorFunction = UseFormSetError<RegisterFormData>;
type ClearErrorsFunction = UseFormClearErrors<RegisterFormData>;

interface AddressFieldResult {
  isLoadingCep: boolean;
  handleCepChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

/**
 * Hook personalizado para gerenciar campos de endereço
 * - Busca de endereço por CEP
 * - Preenchimento automático dos campos de endereço
 */
export const useAddressField = (
  setValue: SetValueFunction, 
  setError?: SetErrorFunction,
  clearErrors?: ClearErrorsFunction
): AddressFieldResult => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Se temos a função para limpar erros, vamos usá-la
    // if (clearErrors) {
    //   clearErrors('cep');
    // }
    
    const cep = e.target.value.replace(/\D/g, '').toString();
    console.log('handleCepChange:', cep);
    
    if (cep.length !== 8) {
      // CEP incompleto
      if (setError) {
        setError('cep', {
          type: 'manual',
          message: 'CEP incompleto'
        });
      }
      return; // Não continue com a busca
    }
    
    setIsLoadingCep(true);
    
    try {
      console.log(`Buscando CEP: ${cep}`);
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      console.log('data:', data);
      
      if (!response.ok) {

            console.log('Definindo erro no campo CEP');
            setError?.('cep', {
              type: 'manual',
              message: 'CEP não encontrado'
            });
          
        throw new Error(`Erro na resposta: ${response.status}`);
      }
      
      console.log('CEP search result:', data);
      
      if (Boolean(data.erro)) {
        console.log('CEP não encontrado na API');
        setError?.('cep', {
            type: 'manual',
            message: 'CEP não encontrado'
          });
        
        // Limpar campos de endereço
        ['logradouro', 'bairro', 'cidade', 'uf'].forEach(field => {
          setValue(field as keyof RegisterFormData, '', { shouldValidate: false });
        });
        
        
        setValue('cep', e.target.value, { shouldValidate: true });
        return;
      }
      
      // CEP válido, preencher campos
      console.log('CEP válido, preenchendo campos');
      setValue('logradouro', data.logradouro || '');
      setValue('bairro', data.bairro || '');
      setValue('cidade', data.localidade || '');
      setValue('uf', data.uf || '');
      
      // Limpar qualquer erro anterior
      if (clearErrors) {
        clearErrors('cep');
      }
      
      // Re-validate the fields after setting values
      setTimeout(() => {
        ['logradouro', 'bairro', 'cidade', 'uf'].forEach(field => {
          setValue(field as keyof RegisterFormData, 
                 getValue(data, field), 
                 { shouldValidate: true, shouldDirty: true });
        });
      }, 100);
      
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      
      // Limpar campos de endereço
      ['logradouro', 'bairro', 'cidade', 'uf'].forEach(field => {
        setValue(field as keyof RegisterFormData, '', { shouldValidate: false });
      });
      
      if (setError) {
        console.log('Definindo erro de API no campo CEP');
        setError('cep', {
          type: 'manual',
          message: 'Erro ao buscar CEP'
        });
      }
    } finally {
      setIsLoadingCep(false);
    }
  };

  // Helper function to safely get values from the API response
  const getValue = (data: any, field: string): string => {
    if (!data) return '';
    
    // Map fields to viacep API response fields
    const fieldMapping: Record<string, string> = {
      'logradouro': 'logradouro',
      'bairro': 'bairro',
      'cidade': 'localidade',
      'uf': 'uf'
    };
    
    const apiField = fieldMapping[field] || field;
    return data[apiField] || '';
  };

  return { isLoadingCep, handleCepChange };
}; 