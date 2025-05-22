'use client';

import React, { useState, useEffect } from 'react';
import { Controller, UseFormRegister } from 'react-hook-form';
import { FaUser, FaIdCard, FaCalendarAlt } from 'react-icons/fa';
import { useFormContext, RegisterFormData } from '../../../context/UserFormContext';
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


const Step1Personal: React.FC = () => {
  const { form } = useFormContext();
  const { 
    control, 
    formState: { errors, touchedFields, dirtyFields },
    trigger,
    register,
  } = form;

  const registerWithMask = useHookFormMask(register);

  
  // Função helper para registrar inputs

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaUser /></StepContentIcon>
        <StepContentTitle>Informações Pessoais</StepContentTitle>
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
        <FormInput
          id="nomeSocial"
          label="Nome Social"
          required
          icon={<FaUser />}
          placeholder="Digite seu nome social (opcional)"
          {...register('nomeSocial')}
          fullWidth
        />
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
      </FormRow>
      
      <FormRow>
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

export default Step1Personal; 

