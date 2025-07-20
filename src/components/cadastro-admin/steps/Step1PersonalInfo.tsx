'use client';

import React from 'react';
import styled from 'styled-components';
import { useController } from 'react-hook-form';
import { useAdminFormContext } from '@/context/AdminFormContext';
import FormInput from '@/components/common/FormInput';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt } from 'react-icons/fa';
import { useHookFormMask } from 'use-mask-input';

import { Controller } from 'react-hook-form';
import FormDatePicker from '@/components/common/FormDatePicker';
import { FormGroup, StyledFormDatePickerWrapper } from '@/styles/registration.styles';
import { usePhoneConfirmation } from '@/hooks/usePhoneConfirmation';

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
    gap: 1.25rem;
  }
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
`;

const Step1PersonalInfo: React.FC = () => {
  const { 
    form,
   } = useAdminFormContext();

   const {
    control,
    formState: { errors },
    register,
    watch,
    getValues,
    setValue,
    trigger,
    setError,
    clearErrors,
   } = form;

   const registerWithMask = useHookFormMask(register);

   usePhoneConfirmation({
    phone: {
      text: 'phone',
      value: watch('phone', ''),
    },
    confirmPhone: {
      text: 'confirmPhone',
      value: watch('confirmPhone', ''),
    },
    setError: setError,
    clearErrors: clearErrors,
    debounceTime: 300
   })


  return (
    <StepContainer>

      <FormGrid>
        <FullWidthField>
          <FormInput
            id="name"
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            icon={<FaUser />}
            required
            {...register('name')}
            error={errors.name?.message}
            helpText="Nome completo como aparece nos documentos oficiais"
          />
        </FullWidthField>

        <FullWidthField>
          <FormInput
            id="email"
            label="E-mail"
            type="email"
            placeholder="seu.email@exemplo.com"
            icon={<FaEnvelope />}
            required
            {...register('email')}
            error={errors.email?.message}
            helpText="E-mail será usado para login e comunicações importantes"
          />
        </FullWidthField>

        <FormInput
          id="phone"
          label="Celular"
          placeholder="(11) 99999-9999"
          icon={<FaPhone />}
          required
          {...registerWithMask('phone', '(99) 99999-9999')}
          error={errors.phone?.message}
          helpText="Número para contato e verificação de segurança"
        />

        <FormInput
          id="confirmPhone"
          label="Confirmar Celular"
          placeholder="(11) 99999-9999"
          icon={<FaPhone />}
          required
          {...registerWithMask('confirmPhone', '(99) 99999-9999')}
          error={errors.confirmPhone?.message}
          helpText="Digite novamente o telefone para confirmação"
        />

        <FormInput
          id="cpf"
          label="CPF"
          placeholder="000.000.000-00"
          icon={<FaIdCard />}
          required  
          {...registerWithMask('cpf', 'cpf')}
          error={errors.cpf?.message}
          helpText="Documento necessário para identificação"
        />

<FormGroup>
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <StyledFormDatePickerWrapper>
                <FormDatePicker
                  id="birthDate"
                  label="Data de Nascimento"
                  selected={field.value}
                  icon={<FaCalendarAlt />}
                  placeholder="DD/MM/AAAA"
                  required
                  showYearDropdown
                  showMonthDropdown
                  maxDate={new Date()}
                  {...register('birthDate')}
                  error={errors.birthDate?.message as string}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  triggerValidation={() => trigger('birthDate')}
                />
              </StyledFormDatePickerWrapper>
            )}
          />
        </FormGroup>
      </FormGrid>
    </StepContainer>
  );
};

export default React.memo(Step1PersonalInfo);
