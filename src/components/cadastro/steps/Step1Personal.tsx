'use client';

import React, { useState, useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { FaUser, FaIdCard, FaCalendarAlt } from 'react-icons/fa';
import { useFormContext, RegisterFormData } from '../../../context/FormContext';
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

const Step1Personal: React.FC = () => {
  const { form } = useFormContext();
  const { 
    control, 
    formState: { errors, touchedFields, dirtyFields },
    trigger, 
    watch, 
    getValues
  } = form;

  // Estado para armazenar o último campo alterado
   
  
  // Função helper para registrar inputs
  const registerInput = (name: keyof RegisterFormData) => {
    const { ref, onChange, onBlur, name: fieldName } = form.register(name);
    
    return {
      ref,
      onChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e);
        
        // Para CPF, validamos apenas quando estiver completo
        if (name == 'cpf') {
          // Pegamos o valor limpo (sem máscara)
          const cpfValue = e.target.value ? e.target.value.replace(/\D/g, '') : '';
          
          console.log('CPF value onChange:', cpfValue); // Debug log
          
          // Apenas validamos quando vazio (para mostrar obrigatório) ou quando completo
          if (cpfValue === '' || cpfValue.length === 11) {
            // Atualizamos o valor no formulário antes de validar
            form.setValue('cpf', e.target.value);
            
            setTimeout(() => {
              trigger(name);
            }, 600);
          }
        } else {
            form.setValue(name, e.target.value);
          // Para outros campos, validamos normalmente
          setTimeout(() => {
            trigger(name);
          }, 600);
        }
      },
      onBlur(e: React.FocusEvent<HTMLInputElement>) {
        onBlur(e);
        
        // Para CPF, só valida no blur se estiver completo
        if (name === 'cpf') {
          const cpfValue = e.target.value ? e.target.value.replace(/\D/g, '') : '';
          
          // Validamos quando vazio ou completo
          if (cpfValue === '' || cpfValue.length === 11) {
            trigger(name);
          }
        } else {
          // Outros campos validam normalmente no blur
          trigger(name);
        }
      },
      name: fieldName,
      value: watch(name)
    };
  };

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
          required
          error={errors.nomeCompleto?.message as string}
          {...registerInput('nomeCompleto')}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="nomeSocial"
          label="Nome Social"
          icon={<FaUser />}
          placeholder="Digite seu nome social (opcional)"
          {...registerInput('nomeSocial')}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormInput
          id="cpf"
          label="CPF"
          icon={<FaIdCard />}
          placeholder="000.000.000-00"
          error={errors.cpf?.message as string}
          required
          mask="cpf"
          {...registerInput('cpf')}
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