'use client';

import React from 'react';
import styled from 'styled-components';
import { useController } from 'react-hook-form';
import { useAdminFormContext } from '@/context/AdminFormContext';
import { ADMIN_OPTIONS } from '@/zod/admin.schema';
import { 
  FaCheck, FaUser, FaEnvelope, FaPhone, FaIdCard, 
  FaCalendarAlt, FaShieldAlt, FaUnlock, FaBell,
  FaExclamationTriangle, FaClipboardCheck
} from 'react-icons/fa';
import InputCheckbox from '@/components/common/InputCheckbox';

const StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
  padding-bottom: 2rem;
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

const ReviewSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 0.75rem;
`;

const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ReviewItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

const ReviewIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
`;

const ReviewDetails = styled.div`
  flex: 1;
`;

const ReviewLabel = styled.div`
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 500;
`;

const ReviewValue = styled.div`
  font-size: 0.8rem;
  color: #374151;
  font-weight: 600;
  margin-top: 0.125rem;
`;

const PermissionsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.375rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PermissionItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
`;

const PermissionCheck = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
`;

const NotificationsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.375rem;
`;

const NotificationItem = styled.div<{ $enabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  opacity: ${props => props.$enabled ? 1 : 0.6};
`;

const NotificationStatus = styled.div<{ $enabled: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  background: ${props => props.$enabled ? '#10b981' : '#d1d5db'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.6rem;
`;

const TermsSection = styled.div`
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1rem 1.5rem 1rem;
  margin-top: 0.75rem;
`;

const TermsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const TermsIcon = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #f59e0b;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
`;

const TermsTitle = styled.h4`
  font-size: 0.9rem;
  font-weight: 600;
  color: #92400e;
  margin: 0;
`;

const TermsText = styled.p`
  font-size: 0.8rem;
  color: #92400e;
  line-height: 1.4;
  margin-bottom: 0.75rem;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
`;

const Checkbox = styled.input`
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 0.125rem;
  
  &:checked {
    background: #667eea;
    border-color: #667eea;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 0.8rem;
  color: #374151;
  line-height: 1.4;
  cursor: pointer;
  flex: 1;
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.75rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Step4Review: React.FC = () => {
  const { form } = useAdminFormContext();

  const { register, formState: { errors }, setValue, getValues, watch } = form;

  const formData = watch();

  const termsAgreement = watch('termsAgreement'); 

  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('termsAgreement', e.target.checked, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  // Funções para formatar dados
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone: string) => {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const getAccessLevelLabel = (accessLevel: string) => {
    return ADMIN_OPTIONS.accessLevels.find(level => level.value === accessLevel)?.label || accessLevel;
  };

  const getPermissionLabel = (permission: string) => {
    return ADMIN_OPTIONS.permissions.find(perm => perm.value === permission)?.label || permission;
  };

  return (
    <StepContainer>
      {/* Dados Pessoais */}
      <ReviewSection>
        <SectionTitle>
          <FaUser />
          Dados Pessoais
        </SectionTitle>
        <ReviewGrid>
          <ReviewItem>
            <ReviewIcon><FaUser /></ReviewIcon>
            <ReviewDetails>
              <ReviewLabel>Nome Completo</ReviewLabel>
              <ReviewValue>{formData.name || 'Não informado'}</ReviewValue>
            </ReviewDetails>
          </ReviewItem>

          <ReviewItem>
            <ReviewIcon><FaEnvelope /></ReviewIcon>
            <ReviewDetails>
              <ReviewLabel>E-mail</ReviewLabel>
              <ReviewValue>{formData.email || 'Não informado'}</ReviewValue>
            </ReviewDetails>
          </ReviewItem>

          <ReviewItem>
            <ReviewIcon><FaPhone /></ReviewIcon>
            <ReviewDetails>
              <ReviewLabel>Telefone</ReviewLabel>
              <ReviewValue>{formData.phone ? formatPhone(formData.phone) : 'Não informado'}</ReviewValue>
            </ReviewDetails>
          </ReviewItem>

          <ReviewItem>
            <ReviewIcon><FaIdCard /></ReviewIcon>
            <ReviewDetails>
              <ReviewLabel>CPF</ReviewLabel>
              <ReviewValue>{formData.cpf ? formatCPF(formData.cpf) : 'Não informado'}</ReviewValue>
            </ReviewDetails>
          </ReviewItem>

          <ReviewItem>
            <ReviewIcon><FaCalendarAlt /></ReviewIcon>
            <ReviewDetails>
              <ReviewLabel>Data de Nascimento</ReviewLabel>
              <ReviewValue>{formData.birthDate ? formatDate(formData.birthDate) : 'Não informado'}</ReviewValue>
            </ReviewDetails>
          </ReviewItem>
        </ReviewGrid>
      </ReviewSection>

      {/* Configurações de Acesso */}
      <ReviewSection>
        <SectionTitle>
          <FaShieldAlt />
          Configurações de Acesso
        </SectionTitle>
        <ReviewGrid>
          <ReviewItem>
            <ReviewIcon><FaUnlock /></ReviewIcon>
            <ReviewDetails>
              <ReviewLabel>Nível de Acesso</ReviewLabel>
              <ReviewValue>{getAccessLevelLabel(formData.accessLevel || 'ADMIN')}</ReviewValue>
            </ReviewDetails>
          </ReviewItem>
        </ReviewGrid>

        <div style={{ marginTop: '1rem' }}>
          <ReviewLabel style={{ marginBottom: '0.5rem', display: 'block' }}>Permissões Selecionadas:</ReviewLabel>
          <PermissionsList>
            {(formData.permissions || []).map((permission: string) => (
              <PermissionItem key={permission}>
                <PermissionCheck>
                  <FaCheck />
                </PermissionCheck>
                <span style={{ fontSize: '0.85rem', color: '#374151' }}>
                  {getPermissionLabel(permission)}
                </span>
              </PermissionItem>
            ))}
          </PermissionsList>
          {(!formData.permissions || formData.permissions.length === 0) && (
            <div style={{ color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Nenhuma permissão selecionada
            </div>
          )}
        </div>
      </ReviewSection>

      {/* Preferências de Notificação */}
      <ReviewSection>
        <SectionTitle>
          <FaBell />
          Preferências de Notificação
        </SectionTitle>
        <NotificationsList>
          <NotificationItem $enabled={formData.notificationPreferences?.emailAlerts}>
            <NotificationStatus $enabled={formData.notificationPreferences?.emailAlerts}>
              <FaCheck />
            </NotificationStatus>
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>
              Alertas por E-mail
            </span>
          </NotificationItem>

          <NotificationItem $enabled={formData.notificationPreferences?.systemAlerts}>
            <NotificationStatus $enabled={formData.notificationPreferences?.systemAlerts}>
              <FaCheck />
            </NotificationStatus>
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>
              Alertas do Sistema
            </span>
          </NotificationItem>

          <NotificationItem $enabled={formData.notificationPreferences?.securityAlerts}>
            <NotificationStatus $enabled={formData.notificationPreferences?.securityAlerts}>
              <FaCheck />
            </NotificationStatus>
            <span style={{ fontSize: '0.9rem', color: '#374151' }}>
              Alertas de Segurança
            </span>
          </NotificationItem>
        </NotificationsList>
      </ReviewSection>

      {/* Termos e Condições */}
      <TermsSection>
        <TermsHeader>
          <TermsIcon>
            <FaExclamationTriangle />
          </TermsIcon>
          <TermsTitle>Termos de Uso e Responsabilidades</TermsTitle>
        </TermsHeader>
        
        <TermsText>
          Ao aceitar estes termos, você confirma que tem autorização para criar uma conta 
          administrativa e que utilizará as permissões concedidas de forma responsável e 
          em conformidade com as políticas da empresa. O uso inadequado pode resultar em 
          suspensão ou revogação dos privilégios administrativos.
        </TermsText>

        <CheckboxContainer>
        <InputCheckbox
          id="termsAgreement"
          label={<>Eu li, compreendi e concordo com os termos de uso e responsabilidades. 
            Confirmo que tenho autorização para criar esta conta administrativa.</>}
          checked={!!termsAgreement}
          {...register('termsAgreement')}
          onChange={handleTermsChange}
          required
          customColor="#10b981"
          error={errors.termsAgreement?.message as string}
        />
          {/* <CheckboxLabel htmlFor="termsAgreement">
            Eu li, compreendi e concordo com os termos de uso e responsabilidades. 
            Confirmo que tenho autorização para criar esta conta administrativa.
          </CheckboxLabel> */}
        </CheckboxContainer>
      </TermsSection>
    </StepContainer>
  );
};

export default Step4Review;
