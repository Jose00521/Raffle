'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FaEnvelope, FaLock, FaLockOpen, FaPhone } from 'react-icons/fa';
import { useFormContext, RegisterFormData } from '../../../context/UserFormContext';
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

import { useHookFormMask } from 'use-mask-input';

const Step2Authentication: React.FC = () => {
  const { form } = useFormContext();
  const { 
    formState: { errors, touchedFields }, 
    trigger,
    watch,
    register,
  } = form;

  const registerWithMask = useHookFormMask(register);
  
  const password = watch('senha');
  const confirmPassword = watch('confirmarSenha');
  
  const { 
    passwordStrength, 
    strengthText, 
    passwordsMatch
  } = usePasswordField(password, confirmPassword);

  // Criar as funções de debounce uma vez

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
          {...register('email')}
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
              {...register('senha')}
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
            {...register('confirmarSenha')}
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
          {...registerWithMask('telefone', '(99) 99999-9999')}
        />
        
        <FormInput
          id="confirmarTelefone"
          label="Confirmar Telefone"
          icon={<FaPhone />}
          placeholder="(00) 00000-0000"
          error={errors.confirmarTelefone?.message as string}
          {...registerWithMask('confirmarTelefone', '(99) 99999-9999')}
        />
      </FormRow>
    </StepContent>
  );
};

export default Step2Authentication; 