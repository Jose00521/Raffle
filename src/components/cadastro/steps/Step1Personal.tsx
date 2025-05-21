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

  // Estado para armazenar o último campo alterado
   
  
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
                  icon={<FaCalendarAlt />}
                  selected={field.value}
                  onChange={field.onChange}
                  error={errors.dataNascimento?.message as string}
                  placeholder="DD/MM/AAAA"
                  triggerValidation={() => trigger('dataNascimento')}
                  required
                  showYearDropdown
                  showMonthDropdown
                  maxDate={new Date()}
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

