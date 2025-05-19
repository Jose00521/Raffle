'use client';

import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaLockOpen, FaPhone } from 'react-icons/fa';
import { useFormContext, RegisterFormData } from '../../../context/FormContext';
import { usePasswordField } from '../../../hooks/usePasswordField';
import FormInput from '../../common/FormInput';
import { 
  StepContent, 
  StepContentHeader, 
  StepContentIcon, 
  StepContentTitle,
  FormRow,
  FormGroup,
  PasswordContainer,
  PasswordStrengthMeter,
  PasswordStrengthIndicator,
  PasswordStrengthText
} from '../../../styles/registration.styles';

const Step2Authentication: React.FC = () => {
  const { form } = useFormContext();
  const { 
    formState: { errors, touchedFields }, 
    trigger,
    watch,
    getValues
  } = form;
  
  const password = watch('senha');
  const confirmPassword = watch('confirmarSenha');
  
  const { 
    passwordStrength, 
    strengthText, 
    passwordsMatch
  } = usePasswordField(password, confirmPassword);

  // Estado para armazenar o último campo alterado

  // Helper function para registrar os inputs com validação otimizada
  const registerInput = (name: keyof RegisterFormData) => {
    const { ref, onChange, onBlur, name: fieldName } = form.register(name);
    
    return {
      ref,
      onChange(e: React.ChangeEvent<HTMLInputElement>) {
        onChange(e);
        
        // Separate validation logic for different field types
        const value = e.target.value;
        
        // For password fields, use longer delay and validate both fields
        if (name === 'senha' || name === 'confirmarSenha') {
          const timeoutId = setTimeout(() => {
            if (value === e.target.value) { // Only validate if value hasn't changed
              trigger('senha');
              if (value.length >= 8) { // Only validate confirm if password meets min length
                trigger('confirmarSenha');
              }
            }
          }, 800); // Longer delay for password validation
          
          return () => clearTimeout(timeoutId);
        }
        
        // For phone fields, validate with medium delay
        if (name === 'telefone' || name === 'confirmarTelefone') {
          const timeoutId = setTimeout(() => {
            if (value === e.target.value) {
              // Get clean value (without mask)
              const phoneClean = value.replace(/\D/g, '');
              
              console.log(`${name} value onChange:`, phoneClean); // Debug log
              
              // Don't validate incomplete values (unless empty)
              if (phoneClean === '' || phoneClean.length >= 10) {
                // Make sure the form has the current value before validation
                form.setValue(name, value);
                
                trigger(name).then(isValid => {
                  // If primary phone is valid and confirm phone has content, validate confirm
                  if (name === 'telefone' && isValid && form.getValues('confirmarTelefone')) {
                    const confirmPhoneClean = form.getValues('confirmarTelefone').replace(/\D/g, '');
                    if (confirmPhoneClean.length >= 10) {
                      trigger('confirmarTelefone');
                    }
                  }
                });
              }
            }
          }, 800); // Longer delay for phone validation
          
          return () => clearTimeout(timeoutId);
        }
        
        // For email, validate with shorter delay
        if (name === 'email') {
          const timeoutId = setTimeout(() => {
            if (value === e.target.value && value.includes('@')) {
              trigger(name);
            }
          }, 600);
          
          return () => clearTimeout(timeoutId);
        }
      },
      onBlur(e: React.FocusEvent<HTMLInputElement>) {
        onBlur(e);


            trigger(name);
      },
      name: fieldName,
      value: watch(name)
    };
  };

  return (
    <StepContent>
      <StepContentHeader>
        <StepContentIcon><FaLock /></StepContentIcon>
        <StepContentTitle>Dados de Acesso</StepContentTitle>
      </StepContentHeader>
      
      <FormRow>
        <FormInput
          id="email"
          label="E-mail"
          icon={<FaEnvelope />}
          type="email"
          placeholder="Digite seu e-mail"
          error={errors.email?.message as string}
          required
          {...registerInput('email')}
          fullWidth
        />
      </FormRow>
      
      <FormRow>
        <FormGroup>
          <PasswordContainer>
            <FormInput
              id="senha"
              label="Senha"
              icon={<FaLock />}
              type="password"
              placeholder="Digite sua senha"
              isPassword
              error={errors.senha?.message as string}
              required
              {...registerInput('senha')}
            />
            <PasswordStrengthMeter>
              <PasswordStrengthIndicator $strength={passwordStrength} />
            </PasswordStrengthMeter>
            <PasswordStrengthText $strength={passwordStrength}>
              {strengthText}
            </PasswordStrengthText>
          </PasswordContainer>
        </FormGroup>
        
        <FormGroup>
          <FormInput
            id="confirmarSenha"
            label="Confirmar Senha"
            icon={<FaLockOpen />}
            type="password"
            placeholder="Confirme sua senha"
            isPassword
            error={
              errors.confirmarSenha?.message as string || 
              (passwordsMatch === false && confirmPassword ? "As senhas não conferem" : undefined)
            }
            required
            {...registerInput('confirmarSenha')}
          />
        </FormGroup>
      </FormRow>
      
      <FormRow>
        <FormInput
          id="telefone"
          label="Telefone"
          icon={<FaPhone />}
          placeholder="(00) 00000-0000"
          error={errors.telefone?.message as string}
          required
          mask="phone"
          {...registerInput('telefone')}
        />
        
        <FormInput
          id="confirmarTelefone"
          label="Confirmar Telefone"
          icon={<FaPhone />}
          placeholder="(00) 00000-0000"
          error={errors.confirmarTelefone?.message as string}
          required
          mask="phone"
          {...registerInput('confirmarTelefone')}
        />
      </FormRow>
    </StepContent>
  );
};

export default Step2Authentication; 