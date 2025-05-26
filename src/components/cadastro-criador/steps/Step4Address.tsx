'use client';

import React from 'react';
import { FaMapMarkerAlt, FaCity, FaGlobe, FaHome, FaMapMarked, FaMapPin } from 'react-icons/fa';
import { useCreatorFormContext } from '../../../context/CreatorFormContext';
import FormInput from '../../common/FormInput';
import CustomDropdown from '../../common/CustomDropdown';
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
import { useAddressField } from '../../../hooks/useAddressField';
import styled from 'styled-components';
import debounce from 'lodash/debounce';

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

const Step4Address: React.FC = () => {
  const { form } = useCreatorFormContext();
  const { 
    formState: { errors },
    register,
    setValue,
    trigger,
    watch,
    setError,
    clearErrors
  } = form;

  const registerWithMask = useHookFormMask(register);
  const { isLoadingCep, cepError, handleCepChange } = useAddressField(setValue, setError, clearErrors,trigger);
  
  const selectedUF = watch('uf');
  
  const brazilianStates = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' }
  ];
  
  const handleStateChange = (value: string) => {
    setValue('uf', value, { shouldValidate: true });
  };

  const handleCepOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Chamar o onBlur do register first
    const cepRegistration = register('cep');
    cepRegistration.onChange(e);
    debounce(handleCepChange, 1000)(e);
  
  };

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
          icon={isLoadingCep ? <LoadingSpinner /> : <FaMapPin />}
          placeholder="00000-000"
          {...registerWithMask('cep', '99999-999')}
          error={errors.cep?.message as string || cepError || undefined}
          onChange={handleCepOnChange}
          disabled={isLoadingCep}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="logradouro"
            label="Endereço"
            required
            icon={<FaHome />}
            placeholder="Rua, Avenida, etc."
            {...register('logradouro')}
            error={errors.logradouro?.message as string}
            disabled={isLoadingCep}
          />
        </FormGroup>
        <FormGroup>
          <FormInput
            id="numero"
            label="Número"
            icon={<FaHome />}
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
          <StyledDropdownWrapper>
            <label htmlFor="uf" className="dropdown-label">
              Estado<span className="required-mark">*</span>
            </label>
            <CustomDropdown
              options={brazilianStates}
              value={selectedUF || ''}
              onChange={handleStateChange}
              placeholder="Selecione o estado"
              icon={<FaGlobe />}
              disabled={isLoadingCep}
            />
            {errors.uf && (
              <div className="error-message">
                {errors.uf.message as string}
              </div>
            )}
          </StyledDropdownWrapper>
        </FormGroup>
      </FormRow>
    </StepContent>
  );
};

export default Step4Address; 