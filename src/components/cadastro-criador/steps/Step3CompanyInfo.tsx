'use client';

import React from 'react';
import { FaBuilding, FaGlobe, FaIdCard, FaCertificate } from 'react-icons/fa';
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
import CustomDropdown from '@/components/common/CustomDropdown';
import styled from 'styled-components';

const StyledDropdownWrapper = styled.div`
  width: 100%;
  position: relative;
  z-index: 10;
  
  .dropdown-label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    color: #333;
  }
  
  .required-mark {
    color: #ef4444;
    margin-left: 4px;
  }
  
  .error-message {
    color: #ef4444;
    font-size: 0.8rem;
    margin-top: 6px;
    font-weight: 500;
  }
`;



const Step3CompanyInfo: React.FC = () => {
  const { form, accountType } = useCreatorFormContext();
  const { 
    formState: { errors },
    register,
    watch,
    setValue,
    trigger,
  } = form;

  const registerWithMask = useHookFormMask(register);

  const categories = [
    { value: 'ASF', label: 'Associação Sem Fins Lucrativos (ASF)' },
    { value: 'MEI', label: 'Microempreendedor Individual (MEI)' },
    { value: 'ME', label: 'Microempreendedor (ME)' },
    { value: 'EPP', label: 'Empresa de Pequeno Porte (EPP)' },
  ];

  const selectedCategory = watch('categoriaEmpresa');
  
  console.log('Categoria selecionada:', selectedCategory);

  const handleCategoryChange = (value: string) => {
    console.log('Alterando categoria para:', value);
    setValue('categoriaEmpresa', value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

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

      <StyledDropdownWrapper>
            <label htmlFor="uf" className="dropdown-label">
              Tipo de Empresa<span className="required-mark">*</span>
            </label>
            <CustomDropdown
              id="categoriaEmpresa"
              options={categories}
              value={selectedCategory || ''}
              onChange={handleCategoryChange}
              placeholder="Selecione o tipo de empresa"
              icon={<FaCertificate />}
            />
            {(errors as any).categoriaEmpresa && (
              <div className="error-message">
                {(errors as any).categoriaEmpresa.message as string}
              </div>
            )}
          </StyledDropdownWrapper>
      </FormRow>
    </StepContent>
  );
};

export default Step3CompanyInfo; 