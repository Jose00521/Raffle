'use client';

import React from 'react';
import styled from 'styled-components';
import { useController } from 'react-hook-form';
import { useAdminFormContext } from '@/context/AdminFormContext';
import CustomDropdown from '@/components/common/CustomDropdown';
import { ADMIN_OPTIONS } from '@/zod/admin.schema';
import { 
  FaCog, FaShieldAlt, FaUsers, FaCreditCard, 
  FaGavel, FaEye, FaLock, FaUnlock,
  FaBell, FaToggleOn, FaToggleOff
} from 'react-icons/fa';

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
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
`;

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PermissionCard = styled.div<{ $selected: boolean }>`
  padding: 1rem;
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e5e7eb'};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? 'rgba(102, 126, 234, 0.05)' : 'white'};
  
  &:hover {
    border-color: #667eea;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
  }
`;

const PermissionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const PermissionIcon = styled.div<{ $selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$selected ? '#667eea' : '#f3f4f6'};
  color: ${props => props.$selected ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s ease;
`;

const PermissionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
`;

const PermissionDescription = styled.p`
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
`;

const NotificationSection = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
`;

const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
`;

const NotificationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const NotificationIconContainer = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #667eea;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
`;

const NotificationDetails = styled.div``;

const NotificationTitle = styled.h5`
  font-size: 0.9rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem 0;
`;

const NotificationDesc = styled.p`
  font-size: 0.8rem;
  color: #6b7280;
  margin: 0;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#10b981' : '#d1d5db'};
  border: none;
  width: 48px;
  height: 24px;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const permissionIcons: { [key: string]: any } = {
  GATEWAY_MANAGEMENT: FaCreditCard,
  USER_MANAGEMENT: FaUsers,
  CAMPAIGN_MANAGEMENT: FaGavel,
  PAYMENT_MANAGEMENT: FaCreditCard,
  SYSTEM_SETTINGS: FaCog,
  AUDIT_ACCESS: FaEye,
  SECURITY_MANAGEMENT: FaLock,
  FULL_ACCESS: FaUnlock
};

const Step3Permissions: React.FC = () => {
  const { form } = useAdminFormContext();
  const { control, formState: { errors }, watch } = form;

  const selectedPermissions = watch('permissions') || [];

  const {
    field: permissionsField
  } = useController({
    name: 'permissions',
    control,
  });

  const {
    field: accessLevelField
  } = useController({
    name: 'accessLevel',
    control,
  });

  const {
    field: notificationPreferencesField
  } = useController({
    name: 'notificationPreferences',
    control,
  });

  const handlePermissionToggle = (permissionValue: 'GATEWAY_MANAGEMENT' | 'USER_MANAGEMENT' | 'CAMPAIGN_MANAGEMENT' | 'PAYMENT_MANAGEMENT' | 'SYSTEM_SETTINGS' | 'AUDIT_ACCESS' | 'SECURITY_MANAGEMENT' | 'FULL_ACCESS') => {
    const currentPermissions = permissionsField.value || [];
    const isSelected = currentPermissions.includes(permissionValue);
    
    let newPermissions: string[];
    if (isSelected) {
      newPermissions = currentPermissions.filter((p: string) => p !== permissionValue);
    } else {
      newPermissions = [...currentPermissions, permissionValue];
    }
    
    permissionsField.onChange(newPermissions);
  };

  const handleNotificationToggle = (notificationType: 'emailAlerts' | 'systemAlerts' | 'securityAlerts') => {
    const currentPreferences = notificationPreferencesField.value || {
      emailAlerts: true,
      systemAlerts: true,
      securityAlerts: true
    };
    
    const newPreferences = {
      ...currentPreferences,
      [notificationType]: !currentPreferences[notificationType]
    };
    
    notificationPreferencesField.onChange(newPreferences);
  };

  const notificationPreferences = notificationPreferencesField.value || {
    emailAlerts: true,
    systemAlerts: true,
    securityAlerts: true
  };

  return (
    <StepContainer>
      <StepTitle>Permissões e Acesso</StepTitle>
      <StepDescription>
        Configure as permissões e níveis de acesso para sua conta administrativa.
        Selecione as funcionalidades que você terá autorização para gerenciar.
      </StepDescription>

      <FormGrid>
        <FullWidthField>
          <SectionTitle>
            <FaShieldAlt />
            Nível de Acesso
          </SectionTitle>
          <CustomDropdown
            id="accessLevel"
            label="Nível de Administração"
            options={ADMIN_OPTIONS.accessLevels}
            value={accessLevelField.value || 'ADMIN'}
            onChange={accessLevelField.onChange}
            placeholder="Selecione o nível de acesso"
            error={errors.accessLevel?.message}
          />
        </FullWidthField>

        <FullWidthField>
          <SectionTitle>
            <FaUnlock />
            Permissões do Sistema
          </SectionTitle>
          <PermissionsGrid>
            {ADMIN_OPTIONS.permissions.map((permission) => {
              const IconComponent = permissionIcons[permission.value] || FaCog;
              const isSelected = selectedPermissions.includes(permission.value as any);
              
              return (
                <PermissionCard
                  key={permission.value}
                  $selected={isSelected}
                  onClick={() => handlePermissionToggle(permission.value as any)}
                >
                  <PermissionHeader>
                    <PermissionIcon $selected={isSelected}>
                      <IconComponent />
                    </PermissionIcon>
                    <div>
                      <PermissionTitle>{permission.label}</PermissionTitle>
                    </div>
                  </PermissionHeader>
                  <PermissionDescription>
                    {permission.value === 'GATEWAY_MANAGEMENT' && 'Gerenciar integrações e configurações de pagamento'}
                    {permission.value === 'USER_MANAGEMENT' && 'Administrar usuários, criadores e participantes'}
                    {permission.value === 'CAMPAIGN_MANAGEMENT' && 'Supervisionar campanhas e rifas ativas'}
                    {permission.value === 'PAYMENT_MANAGEMENT' && 'Monitorar transações e pagamentos'}
                    {permission.value === 'SYSTEM_SETTINGS' && 'Configurar parâmetros gerais do sistema'}
                    {permission.value === 'AUDIT_ACCESS' && 'Visualizar logs e relatórios de auditoria'}
                    {permission.value === 'SECURITY_MANAGEMENT' && 'Gerenciar configurações de segurança'}
                    {permission.value === 'FULL_ACCESS' && 'Acesso total a todas as funcionalidades'}
                  </PermissionDescription>
                </PermissionCard>
              );
            })}
          </PermissionsGrid>
          {errors.permissions && (
            <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.5rem' }}>
              {errors.permissions.message}
            </div>
          )}
        </FullWidthField>

        <FullWidthField>
          <SectionTitle>
            <FaBell />
            Preferências de Notificação
          </SectionTitle>
          <NotificationSection>
            <NotificationGrid>
              <NotificationItem>
                <NotificationInfo>
                  <NotificationIconContainer>
                    <FaBell />
                  </NotificationIconContainer>
                  <NotificationDetails>
                    <NotificationTitle>Alertas por E-mail</NotificationTitle>
                    <NotificationDesc>Receber notificações importantes por e-mail</NotificationDesc>
                  </NotificationDetails>
                </NotificationInfo>
                <ToggleButton
                  type="button"
                  $active={notificationPreferences.emailAlerts}
                  onClick={() => handleNotificationToggle('emailAlerts')}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIconContainer>
                    <FaCog />
                  </NotificationIconContainer>
                  <NotificationDetails>
                    <NotificationTitle>Alertas do Sistema</NotificationTitle>
                    <NotificationDesc>Notificações sobre eventos e atualizações do sistema</NotificationDesc>
                  </NotificationDetails>
                </NotificationInfo>
                <ToggleButton
                  type="button"
                  $active={notificationPreferences.systemAlerts}
                  onClick={() => handleNotificationToggle('systemAlerts')}
                />
              </NotificationItem>

              <NotificationItem>
                <NotificationInfo>
                  <NotificationIconContainer>
                    <FaShieldAlt />
                  </NotificationIconContainer>
                  <NotificationDetails>
                    <NotificationTitle>Alertas de Segurança</NotificationTitle>
                    <NotificationDesc>Notificações sobre atividades de segurança e tentativas de acesso</NotificationDesc>
                  </NotificationDetails>
                </NotificationInfo>
                <ToggleButton
                  type="button"
                  $active={notificationPreferences.securityAlerts}
                  onClick={() => handleNotificationToggle('securityAlerts')}
                />
              </NotificationItem>
            </NotificationGrid>
          </NotificationSection>
        </FullWidthField>
      </FormGrid>
    </StepContainer>
  );
};

export default Step3Permissions;
