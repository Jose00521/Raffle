'use client';

import React from 'react';
import styled from 'styled-components';
import { useAdminFormContext } from '@/context/AdminFormContext';
import FormInput from '@/components/common/FormInput';
import { FaLock } from 'react-icons/fa';
import { usePasswordConfirmation } from '@/hooks/usePasswordConfirmation';
import PasswordRequirementsComplete from '@/components/common/PasswordRequirementsComplete';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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
    debounceTime: 200 // 300ms é um bom valor para debounce de senha
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
