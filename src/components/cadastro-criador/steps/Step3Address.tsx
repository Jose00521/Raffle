'use client';

import React from 'react';
import { FaMapMarkerAlt, FaCity, FaGlobe, FaHome, FaMapMarked } from 'react-icons/fa';
import { useCreatorFormContext } from '../../../context/CreatorFormContext';
import FormInput from '../../common/FormInput';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  FormRow,
  FormGroup
} from '../../../styles/registration.styles';
import { useHookFormMask } from 'use-mask-input';
import { useAddressField } from '../../../hooks/useAddressField';

const Step3Address: React.FC = () => {
  const { form } = useCreatorFormContext();
  const { 
    formState: { errors },
    register,
    setValue,
    trigger
  } = form;

  const registerWithMask = useHookFormMask(register);
  const { isLoadingCep, cepError, handleCepBlur } = useAddressField({ setValue, trigger });

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaMapMarked /></StepContentIcon>
        <StepContentTitle>Endereço</StepContentTitle>
      </StepContentHeader>
      
      <FormRow>
        <FormInput
          id="cep"
          label="CEP"
          required
          icon={<FaMapMarkerAlt />}
          placeholder="00000-000"
          {...registerWithMask('cep', '99999-999')}
          error={errors.cep?.message as string || cepError || undefined}
          onBlur={handleCepBlur}
          disabled={isLoadingCep}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="endereco"
            label="Endereço"
            required
            icon={<FaHome />}
            placeholder="Rua, Avenida, etc."
            {...register('endereco')}
            error={errors.endereco?.message as string}
            disabled={isLoadingCep}
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            id="numero"
            label="Número"
            required
            placeholder="Número"
            {...register('numero')}
            error={errors.numero?.message as string}
          />
        </FormGroup>
      </FormRow>
      
      <FormRow>
        <FormInput
          id="complemento"
          label="Complemento"
          icon={<FaHome />}
          placeholder="Apartamento, bloco, etc. (opcional)"
          {...register('complemento')}
          error={errors.complemento?.message as string}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="bairro"
          label="Bairro"
          required
          icon={<FaMapMarkerAlt />}
          placeholder="Seu bairro"
          {...register('bairro')}
          error={errors.bairro?.message as string}
          disabled={isLoadingCep}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="cidade"
            label="Cidade"
            required
            icon={<FaCity />}
            placeholder="Sua cidade"
            {...register('cidade')}
            error={errors.cidade?.message as string}
            disabled={isLoadingCep}
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            id="estado"
            label="Estado"
            required
            icon={<FaGlobe />}
            placeholder="UF"
            {...registerWithMask('estado', 'AA')}
            error={errors.estado?.message as string}
            disabled={isLoadingCep}
          />
        </FormGroup>
      </FormRow>
    </StepContent>
  );
};

export default Step3Address; 