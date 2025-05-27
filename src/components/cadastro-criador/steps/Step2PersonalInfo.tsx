'use client';

import React from 'react';
import { Controller } from 'react-hook-form';
import { FaUser, FaIdCard, FaCalendarAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { useCreatorFormContext } from '../../../context/CreatorFormContext';
import FormInput from '../../common/FormInput';
import FormDatePicker from '../../common/FormDatePicker';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  FormRow,
  FormGroup,
  StyledFormDatePickerWrapper
} from '../../../styles/registration.styles';
import { useHookFormMask } from 'use-mask-input';

const Step2PersonalInfo: React.FC = () => {
  const { form, accountType } = useCreatorFormContext();
  const { 
    control, 
    formState: { errors },
    trigger,
    register,
  } = form;

  const registerWithMask = useHookFormMask(register);

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaUser /></StepContentIcon>
        <StepContentTitle>
          {accountType === 'individual' ? 'Dados Pessoais' : 'Dados do Representante Legal'}
        </StepContentTitle>
      </StepContentHeader>
      
      <FormRow>
        <FormInput
          id="nomeCompleto"
          label="Nome Completo"
          required
          icon={<FaUser />}
          placeholder="Digite seu nome completo"
          {...register('nomeCompleto')}
          error={errors.nomeCompleto?.message as string}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <FormInput
            id="email"
            label="Email"
            required
            icon={<FaEnvelope />}
            placeholder="Digite seu email"
            type="email"
            {...register('email')}
            error={errors.email?.message as string}
          />
        </FormGroup>
      </FormRow>


        <FormRow>
        <FormGroup>
          <FormInput
            id="telefone"
            label="Telefone"
            required
            icon={<FaPhone />}
            placeholder="(00) 00000-0000"
            {...registerWithMask('telefone', '(99) 99999-9999')}
            error={errors.telefone?.message as string}
          />
        </FormGroup>

        <FormGroup>
          <FormInput
            id="confirmarTelefone"
            label="Confirmar Telefone"
            required
            icon={<FaPhone />}
            placeholder="(00) 00000-0000"
            {...registerWithMask('confirmarTelefone', '(99) 99999-9999')}
            error={errors.confirmarTelefone?.message as string}
          />
        </FormGroup>
      </FormRow>
      
      <FormRow>
      <FormInput
            id="cpf"
            label="CPF"
            required
            icon={<FaIdCard />}
            placeholder="000.000.000-00"
            {...registerWithMask('cpf', 'cpf')}
            error={errors.cpf?.message as string}
          />
        <FormGroup>
          <Controller
            name="dataNascimento"
            control={control}
            render={({ field }) => (
              <StyledFormDatePickerWrapper>
                <FormDatePicker
                  id="dataNascimento"
                  label="Data de Nascimento"
                  selected={field.value}
                  icon={<FaCalendarAlt />}
                  placeholder="DD/MM/AAAA"
                  required
                  showYearDropdown
                  showMonthDropdown
                  maxDate={new Date()}
                  {...register('dataNascimento')}
                  error={errors.dataNascimento?.message as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  triggerValidation={() => trigger('dataNascimento')}
                />
              </StyledFormDatePickerWrapper>
            )}
          />
        </FormGroup>
        
  
      </FormRow>
    </StepContent>
  );
};

export default Step2PersonalInfo; 