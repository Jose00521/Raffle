'use client';

import React, { useCallback, useEffect } from 'react';
import { 
  FaMapMarkerAlt, 
  FaCity, 
  FaBuilding, 
  FaRoad, 
  FaMapPin, 
  FaHome
} from 'react-icons/fa';
import { useFormContext, RegisterFormData } from '../../../context/FormContext';
import { useAddressField } from '../../../hooks/useAddressField';
import FormInput from '../../common/FormInput';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  FormRow,
  FormGroup,
  LoadingSpinner
} from '../../../styles/registration.styles';

const Step3Address: React.FC = () => {
  const { form } = useFormContext();
  const { 
    formState: { errors, touchedFields }, 
    setValue,
    setError,
    trigger,
    watch,
    clearErrors
  } = form;
  
  // Para depuração - mostrar erros ao montar ou atualizar
  useEffect(() => {
    console.log('Erros no formulário:', errors);
    if (errors.cep) {
      console.log('Erro no CEP:', errors.cep);
    }
  }, [errors]);
  
  const { isLoadingCep, handleCepChange } = useAddressField(setValue, setError, clearErrors);

  // Helper function para registrar os inputs com tipagem correta e debounce
  const registerInput = (name: keyof RegisterFormData) => {
    const { ref, onChange, onBlur, name: fieldName } = form.register(name);
    
    return {
      ref,
      onChange(e: React.ChangeEvent<HTMLInputElement>) {
        // Atualizar o valor no formulário
        onChange(e);
        
        // Para o CEP, validamos de forma especial
        if (name === 'cep') {
          const cepValue = e.target.value.replace(/\D/g, '');
          setTimeout(() => {
            handleCepChange(e)
          }, 600);
          
          console.log('CEP onChange:', cepValue);
          
          // Limpar error quando o usuário digitar
        //   clearErrors('cep');
          
          // Validar apenas quando estiver vazio ou completo
          if (cepValue === '' || cepValue.length === 8) {
            // Garante que o formulário tem o valor atualizado
            form.setValue(name, e.target.value);
            
            setTimeout(() => {
              trigger(name);
            }, 600);
          }
        } else {
          setTimeout(() => {
            trigger(name);
          }, 400);
        }
      },
      onBlur(e: React.FocusEvent<HTMLInputElement>) {
        // Quando perde o foco, validar também
        onBlur(e);
        
        if (name === 'cep') {
          // Para o CEP, validamos apenas se vazio ou completo
          const cepValue = e.target.value.replace(/\D/g, '');
          console.log('CEP onBlur:', cepValue);
          
          if (cepValue === '' || cepValue.length === 8) {
            trigger(name);
          }
        } else {
          trigger(name);
        }
      },
      name: fieldName,
      value: watch(name)
    };
  };

  // Função de bloco separada para o CEP para melhor clareza
  const handleCepOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chamar o onBlur do register first
    const cepRegistration = registerInput('cep');
    cepRegistration.onChange(e);
    
    console.log('CEP valor no onBlur:', e.target.value);
    
    // Chamar a busca de CEP apenas se o valor não for vazio
    const cepValue = e.target.value.replace(/\D/g, '');
    if (cepValue.length > 0) {
      handleCepChange(e);
    }
  };

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaMapMarkerAlt /></StepContentIcon>
        <StepContentTitle>Dados de Endereço</StepContentTitle>
      </StepContentHeader>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="cep"
            label="CEP"
            icon={isLoadingCep ? <LoadingSpinner /> : <FaMapPin />}
            placeholder="00000-000"
            error={errors.cep?.message as string}
            required
            mask="cep"
            disabled={isLoadingCep}
            {...registerInput('cep')}
          />
        </FormGroup>
        
        <FormGroup>
          <FormInput
            id="uf"
            label="UF"
            icon={<FaMapMarkerAlt />}
            placeholder="UF"
            error={errors.uf?.message as string}
            required
            mask="uf"
            disabled={isLoadingCep}
            {...registerInput('uf')}
          />
        </FormGroup>
      </FormRow>
      
      <FormRow>
        <FormInput
          id="logradouro"
          label="Endereço"
          icon={<FaRoad />}
          placeholder="Rua, Avenida, etc."
          error={errors.logradouro?.message as string}
          required
          {...registerInput('logradouro')}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="numero"
          label="Número"
          icon={<FaHome />}
          placeholder="Número"
          error={errors.numero?.message as string}
          required
          {...registerInput('numero')}
        />
        
        <FormInput
          id="complemento"
          label="Complemento"
          icon={<FaBuilding />}
          placeholder="Apartamento, bloco, etc."
          {...registerInput('complemento')}
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="bairro"
          label="Bairro"
          icon={<FaCity />}
          placeholder="Bairro"
          error={errors.bairro?.message as string}
          required
          {...registerInput('bairro')}
        />
        
        <FormInput
          id="cidade"
          label="Cidade"
          icon={<FaCity />}
          placeholder="Cidade"
          error={errors.cidade?.message as string}
          required
          {...registerInput('cidade')}
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="pontoReferencia"
          label="Ponto de Referência"
          icon={<FaMapMarkerAlt />}
          placeholder="Ex: Próximo ao supermercado XYZ"
          {...registerInput('pontoReferencia')}
          fullWidth
        />
      </FormRow>
    </StepContent>
  );
};

export default Step3Address; 