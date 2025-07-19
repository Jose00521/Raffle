'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { useController } from 'react-hook-form';
import { useAdminFormContext } from '@/context/AdminFormContext';
import FormInput from '@/components/common/FormInput';
import { FaLock, FaShieldAlt, FaCheck, FaTimes } from 'react-icons/fa';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const StepTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const StepDescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  text-align: center;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
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

const PasswordStrengthFill = styled.div<{ $strength: number }>`
  height: 100%;
  background: ${props => {
    if (props.$strength < 2) return '#ef4444';
    if (props.$strength < 3) return '#f59e0b';
    if (props.$strength < 4) return '#eab308';
    return '#10b981';
  }};
  width: ${props => (props.$strength / 4) * 100}%;
  transition: all 0.3s ease;
`;

const PasswordStrengthLabel = styled.div<{ $strength: number }>`
  font-size: 0.8rem;
  font-weight: 500;
  margin-top: 0.5rem;
  color: ${props => {
    if (props.$strength < 2) return '#ef4444';
    if (props.$strength < 3) return '#f59e0b';
    if (props.$strength < 4) return '#eab308';
    return '#10b981';
  }};
`;

const Step2Security: React.FC = () => {
  const { form } = useAdminFormContext();
  const { control, formState: { errors }, watch } = form;

  const passwordValue = watch('password') || '';

  const {
    field: passwordField
  } = useController({
    name: 'password',
    control,
  });

  const {
    field: confirmPasswordField
  } = useController({
    name: 'confirmPassword',
    control,
  });

  // Validação de força da senha
  const getPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
  };

  const calculatePasswordStrength = (password: string) => {
    const requirements = getPasswordRequirements(password);
    return Object.values(requirements).filter(Boolean).length;
  };

  const requirements = getPasswordRequirements(passwordValue);
  const strength = calculatePasswordStrength(passwordValue);

  const getStrengthLabel = (strength: number) => {
    if (strength < 2) return 'Muito Fraca';
    if (strength < 3) return 'Fraca';
    if (strength < 4) return 'Média';
    if (strength < 5) return 'Forte';
    return 'Muito Forte';
  };

  return (
    <StepContainer>
      <StepTitle>Configurações de Segurança</StepTitle>
      <StepDescription>
        Configure sua senha de acesso e defina as configurações de segurança.
        Uma senha forte é essencial para proteger sua conta administrativa.
      </StepDescription>

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
            value={passwordField.value || ''}
            onChange={(e) => passwordField.onChange(e.target.value)}
            onBlur={passwordField.onBlur}
            error={errors.password?.message}
            helpText="Sua senha deve atender aos critérios de segurança"
          />
          
          {passwordValue && (
            <PasswordStrengthContainer>
              <PasswordStrengthTitle>
                <FaShieldAlt />
                Força da Senha
              </PasswordStrengthTitle>
              
              <PasswordRequirements>
                <RequirementItem $met={requirements.length}>
                  <RequirementIcon $met={requirements.length}>
                    {requirements.length ? <FaCheck /> : <FaTimes />}
                  </RequirementIcon>
                  Mínimo 8 caracteres
                </RequirementItem>
                
                <RequirementItem $met={requirements.uppercase}>
                  <RequirementIcon $met={requirements.uppercase}>
                    {requirements.uppercase ? <FaCheck /> : <FaTimes />}
                  </RequirementIcon>
                  Letra maiúscula
                </RequirementItem>
                
                <RequirementItem $met={requirements.lowercase}>
                  <RequirementIcon $met={requirements.lowercase}>
                    {requirements.lowercase ? <FaCheck /> : <FaTimes />}
                  </RequirementIcon>
                  Letra minúscula
                </RequirementItem>
                
                <RequirementItem $met={requirements.number}>
                  <RequirementIcon $met={requirements.number}>
                    {requirements.number ? <FaCheck /> : <FaTimes />}
                  </RequirementIcon>
                  Número
                </RequirementItem>
                
                <RequirementItem $met={requirements.special}>
                  <RequirementIcon $met={requirements.special}>
                    {requirements.special ? <FaCheck /> : <FaTimes />}
                  </RequirementIcon>
                  Caractere especial
                </RequirementItem>
              </PasswordRequirements>
              
              <PasswordStrengthBar>
                <PasswordStrengthBarContainer>
                  <PasswordStrengthFill $strength={strength} />
                </PasswordStrengthBarContainer>
                <PasswordStrengthLabel $strength={strength}>
                  {getStrengthLabel(strength)}
                </PasswordStrengthLabel>
              </PasswordStrengthBar>
            </PasswordStrengthContainer>
          )}
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
            value={confirmPasswordField.value || ''}
            onChange={(e) => confirmPasswordField.onChange(e.target.value)}
            onBlur={confirmPasswordField.onBlur}
            error={errors.confirmPassword?.message}
            helpText="Repita a senha para confirmação"
          />
        </FullWidthField>
      </FormGrid>
    </StepContainer>
  );
};

export default Step2Security;
