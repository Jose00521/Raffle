'use client';

import React from 'react';
import styled from 'styled-components';
import { useController } from 'react-hook-form';
import { useAdminFormContext } from '@/context/AdminFormContext';
import FormInput from '@/components/common/FormInput';
import { FaUser, FaEnvelope, FaPhone, FaIdCard, FaCalendarAlt } from 'react-icons/fa';

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

const Step1PersonalInfo: React.FC = () => {
  const { form } = useAdminFormContext();
  const { control, formState: { errors } } = form;

  const {
    field: nameField
  } = useController({
    name: 'name',
    control,
  });

  const {
    field: emailField
  } = useController({
    name: 'email',
    control,
  });

  const {
    field: phoneField
  } = useController({
    name: 'phone',
    control,
  });

  const {
    field: confirmPhoneField
  } = useController({
    name: 'confirmPhone',
    control,
  });

  const {
    field: cpfField
  } = useController({
    name: 'cpf',
    control,
  });

  const {
    field: birthDateField
  } = useController({
    name: 'birthDate',
    control,
  });

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  // Função para formatar telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  };

  // Função para formatar data
  const formatDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    return cleaned
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{4})\d+?$/, '$1');
  };

  return (
    <StepContainer>
      <StepTitle>Dados Pessoais</StepTitle>
      <StepDescription>
        Informe seus dados pessoais para criar sua conta de administrador.
        Todos os campos são obrigatórios e devem ser preenchidos com informações válidas.
      </StepDescription>

      <FormGrid>
        <FullWidthField>
          <FormInput
            id="name"
            label="Nome Completo"
            placeholder="Digite seu nome completo"
            icon={<FaUser />}
            required
            value={nameField.value || ''}
            onChange={(e) => nameField.onChange(e.target.value)}
            onBlur={nameField.onBlur}
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
            value={emailField.value || ''}
            onChange={(e) => emailField.onChange(e.target.value)}
            onBlur={emailField.onBlur}
            error={errors.email?.message}
            helpText="E-mail será usado para login e comunicações importantes"
          />
        </FullWidthField>

        <FormInput
          id="phone"
          label="Telefone/Celular"
          placeholder="(11) 99999-9999"
          icon={<FaPhone />}
          required
          value={formatPhone(phoneField.value || '')}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, '');
            phoneField.onChange(cleaned);
          }}
          onBlur={phoneField.onBlur}
          error={errors.phone?.message}
          helpText="Número para contato e verificação de segurança"
        />

        <FormInput
          id="confirmPhone"
          label="Confirmar Telefone"
          placeholder="(11) 99999-9999"
          icon={<FaPhone />}
          required
          value={formatPhone(confirmPhoneField.value || '')}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, '');
            confirmPhoneField.onChange(cleaned);
          }}
          onBlur={confirmPhoneField.onBlur}
          error={errors.confirmPhone?.message}
          helpText="Digite novamente o telefone para confirmação"
        />

        <FormInput
          id="cpf"
          label="CPF"
          placeholder="000.000.000-00"
          icon={<FaIdCard />}
          required
          value={formatCPF(cpfField.value || '')}
          onChange={(e) => {
            const cleaned = e.target.value.replace(/\D/g, '');
            cpfField.onChange(cleaned);
          }}
          onBlur={cpfField.onBlur}
          error={errors.cpf?.message}
          helpText="Documento necessário para identificação"
        />

        <FormInput
          id="birthDate"
          label="Data de Nascimento"
          type="date"
          icon={<FaCalendarAlt />}
          required
          value={birthDateField.value ? new Date(birthDateField.value).toISOString().split('T')[0] : ''}
          onChange={(e) => {
            const date = e.target.value ? new Date(e.target.value) : null;
            birthDateField.onChange(date);
          }}
          onBlur={birthDateField.onBlur}
          error={errors.birthDate?.message}
          helpText="Deve ser maior de 18 anos"
        />
      </FormGrid>
    </StepContainer>
  );
};

export default Step1PersonalInfo;
