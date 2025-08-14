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
  PasswordContainer
} from '../../../styles/registration.styles';

import { useHookFormMask } from 'use-mask-input';
import { usePasswordConfirmation } from '@/hooks/usePasswordConfirmation';

const Step2Authentication: React.FC = () => {
  const { form } = useFormContext();
  const { 
    formState: { errors, touchedFields }, 
    trigger,
    watch,
    register,
    setError,
    clearErrors,
    formState
  } = form;

  const registerWithMask = useHookFormMask(register);
  
  const password = watch('senha', '');
  const confirmPassword = watch('confirmarSenha', '');
  
  const { 
    passwordStrength
  } = usePasswordField(password);

  usePasswordConfirmation({
    password: {
      text: 'senha',
      value: password,
    },
    confirmPassword: {
      text: 'confirmarSenha',
      value: confirmPassword,
    },
    setError,
    clearErrors,
    debounceTime: 300
  });

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
            {password && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px', 
                marginTop: '5px',
                fontSize: '0.85rem',
              }}>
                <div style={{ 
                  display: 'flex', 
                  flex: 1, 
                  height: '4px', 
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${(passwordStrength.strength / 5) * 100}%`, 
                    background: passwordStrength.color,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ color: passwordStrength.color, fontWeight: 500 }}>
                  {passwordStrength.text}
                </span>
              </div>
            )}
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
            required
            {...register('confirmarSenha')}
            error={errors.confirmarSenha?.message as string }
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