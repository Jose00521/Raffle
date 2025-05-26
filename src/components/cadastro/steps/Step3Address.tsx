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
import { useFormContext, RegisterFormData } from '../../../context/UserFormContext';
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
import { useHookFormMask } from 'use-mask-input';

const Step3Address: React.FC = () => {
  const { form } = useFormContext();
  const { 
    formState: { errors, touchedFields }, 
    setValue,
    setError,
    trigger,
    watch,
    register,
    clearErrors
  } = form;

  const registerWithMask = useHookFormMask(register);
  
  // Para depuração - mostrar erros ao montar ou atualizar
  
  const { isLoadingCep, handleCepChange } = useAddressField(setValue, setError, clearErrors,trigger);

  // Helper function para registrar os inputs com tipagem correta e debounce
  

  // Função de bloco separada para o CEP para melhor clareza
  const handleCepOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chamar o onBlur do register first
    const cepRegistration = register('cep');
    cepRegistration.onChange(e);

    const cepValue = e.target.value.replace(/\D/g, '');
    
    handleCepChange(e);
  
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
            disabled={isLoadingCep}
            {...registerWithMask('cep', '99999-999')}
            onChange={handleCepOnChange}
          />
        </FormGroup>
        
        <FormGroup>
          <FormInput
            id="uf"
            label="UF"
            icon={<FaMapMarkerAlt />}
            placeholder="UF"
            error={errors.uf?.message as string}

            disabled={isLoadingCep}
            {...registerWithMask('uf', 'AA')}
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

          {...register('logradouro')}
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

          {...register('numero')}
        />
        
        <FormInput
          id="complemento"
          label="Complemento"
          icon={<FaBuilding />}
          placeholder="Apartamento, bloco, etc."
          {...register('complemento')}
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="bairro"
          label="Bairro"
          icon={<FaCity />}
          placeholder="Bairro"
          error={errors.bairro?.message as string}

          {...register('bairro')}
        />
        
        <FormInput
          id="cidade"
          label="Cidade"
          icon={<FaCity />}
          placeholder="Cidade"
          error={errors.cidade?.message as string}
          required
          {...register('cidade')}
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="pontoReferencia"
          label="Ponto de Referência"
          icon={<FaMapMarkerAlt />}
          placeholder="Ex: Próximo ao supermercado XYZ"
          {...register('pontoReferencia')}
          fullWidth
        />
      </FormRow>
    </StepContent>
  );
};

export default Step3Address; 