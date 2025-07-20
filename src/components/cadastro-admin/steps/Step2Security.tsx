'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useController } from 'react-hook-form';
import { useAdminFormContext } from '@/context/AdminFormContext';
import FormInput from '@/components/common/FormInput';
import { FaLock, FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { usePasswordField } from '@/hooks/usePasswordField';
import { usePasswordConfirmation } from '@/hooks/usePasswordConfirmation';
import PasswordRequirementsComplete from '@/components/common/PasswordRequirementsComplete';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const StepTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const StepDescription = styled.p`
  font-size: 0.875rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthField = styled.div`
  
`;

const PasswordStrengthContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const PasswordStrengthTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PasswordRequirements = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RequirementItem = styled.div<{ $met: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: ${props => props.$met ? '#059669' : '#6b7280'};
  transition: color 0.2s ease;
`;

const RequirementIcon = styled.div<{ $met: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$met ? '#10b981' : '#d1d5db'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  transition: all 0.2s ease;
`;

const PasswordStrengthBar = styled.div`
  margin-top: 1rem;
`;

const PasswordStrengthBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.div<{ $strength: number, $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  width: ${props => (props.$strength / 5) * 100}%;
  transition: all 0.3s ease;
`;

const PasswordStrengthLabel = styled.div<{ $strength: number, $color: string }>`
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  color: ${props => props.$color};
`;

const Step2Security: React.FC = () => {
  const { form } = useAdminFormContext();
  const { 
    control, 
    formState: { errors }, 
    setError,
    clearErrors,
    register,
    watch,
    trigger
  } = form;

  const watchPassword = watch('password','');
  const watchConfirmPassword = watch('confirmPassword', '');

  usePasswordConfirmation({
    password: {
      text: 'password',
      value: watchPassword,
    },
    confirmPassword: {
      text: 'confirmPassword',
      value: watchConfirmPassword,
    },
    setError,
    clearErrors,
    debounceTime: 300 // 300ms é um bom valor para debounce de senha
  });

  return (
    <StepContainer>
      <FormGrid>
        <FullWidthField>
          <FormInput
            id="password"
            label="Senha"
            type="password"
            isPassword
            placeholder="Digite uma senha forte"
            icon={<FaLock />}
            required
            {...register('password')}
            error={errors.password?.message}
            helpText="Sua senha deve atender aos critérios de segurança"
          />

          <PasswordRequirementsComplete password={watchPassword} />

        </FullWidthField>

        <FullWidthField>
          <FormInput
            id="confirmPassword"
            label="Confirmar Senha"
            type="password"
            isPassword
            placeholder="Digite a senha novamente"
            icon={<FaLock />}
            required
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
            helpText="Repita a senha para confirmação"
          />
        </FullWidthField>
      </FormGrid>
    </StepContainer>
  );
};

export default React.memo(Step2Security);
