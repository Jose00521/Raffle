'use client';

import React from 'react';
import { FaBuilding, FaIdCard } from 'react-icons/fa';
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

const Step3CompanyInfo: React.FC = () => {
  const { form, accountType } = useCreatorFormContext();
  const { 
    formState: { errors },
    register,
  } = form;

  const registerWithMask = useHookFormMask(register);

  if (accountType !== 'company') {
    return null; // Don't render anything if not a company
  }

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaBuilding /></StepContentIcon>
        <StepContentTitle>Dados da Empresa</StepContentTitle>
      </StepContentHeader>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="razaoSocial"
            label="Razão Social"
            required
            icon={<FaBuilding />}
            placeholder="Razão social da empresa"
            {...register('razaoSocial')}
            error={errors.razaoSocial?.message as string}
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            id="nomeFantasia"
            label="Nome Fantasia"
            required
            icon={<FaBuilding />}
            placeholder="Nome fantasia da empresa"
            {...register('nomeFantasia')}
            error={errors.nomeFantasia?.message as string}
          />
        </FormGroup>
      </FormRow>
      
      <FormRow>
        <FormInput
          id="cnpj"
          label="CNPJ"
          required
          icon={<FaIdCard />}
          placeholder="00.000.000/0000-00"
          {...registerWithMask('cnpj', 'cnpj')}
          error={errors.cnpj?.message as string}
          fullWidth
        />
      </FormRow>
    </StepContent>
  );
};

export default Step3CompanyInfo; 