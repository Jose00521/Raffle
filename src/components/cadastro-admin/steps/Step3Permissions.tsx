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
  gap: 1.25rem;
  width: 100%;
  min-height: 0;
  flex: 1;
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
  gap: 1.5rem;
  width: 100%;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FullWidthField = styled.div`
  grid-column: 1 / -1;
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

const PermissionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  
  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const PermissionCard = styled.div<{ $selected: boolean, $disabled: boolean }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$selected ? '#667eea' : '#e5e7eb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$selected ? 'rgba(102, 126, 234, 0.05)' : 'white'};
  opacity: ${props => props.$disabled ? 0.5 : 1};
  pointer-events: ${props => props.$disabled ? 'none' : 'auto'};
  &:hover {
    border-color: #667eea;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
  }
`;

const PermissionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
`;

const PermissionIcon = styled.div<{ $selected: boolean }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: ${props => props.$selected ? '#667eea' : '#f3f4f6'};
  color: ${props => props.$selected ? 'white' : '#6b7280'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  transition: all 0.2s ease;
`;

const PermissionTitle = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
  line-height: 1.2;
`;

const PermissionDescription = styled.p`
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.3;
`;

const NotificationSection = styled.div`
  background: #f8fafc;
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid #e2e8f0;
  width: 100%;
`;

const NotificationGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
`;

const NotificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
`;

const NotificationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
`;

const NotificationIconContainer = styled.div`
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

const NotificationDetails = styled.div``;

const NotificationTitle = styled.h5`
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.125rem 0;
`;

const NotificationDesc = styled.p`
  font-size: 0.7rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  background: ${props => props.$active ? '#10b981' : '#d1d5db'};
  border: none;
  width: 40px;
  height: 20px;
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '22px' : '2px'};
    width: 16px;
    height: 16px;
    background: white;
    border-radius: 50%;
    transition: all 0.2s ease;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
`;

const permissionValues = ADMIN_OPTIONS.permissions.map((permission) => permission.value);

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
  const { 
    control, 
    formState: { errors }, 
    watch, 
    register,
    setValue,
    getValues,
  } = form;

  const selectedPermissions = watch('permissions') || [];

  

  const handlePermissionToggle = (permissionValue: string) => {
    const currentPermissions = getValues('permissions') || [];
    const isSelected = currentPermissions.includes(permissionValue as any);

    if(permissionValue === 'FULL_ACCESS' && !isSelected){
      setValue('permissions', ['FULL_ACCESS'], {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      return;
    }
    
    let newPermissions: string[];
    if (isSelected) {
      newPermissions = currentPermissions.filter((p: string) => p !== permissionValue);
    } else {
      newPermissions = [...currentPermissions, permissionValue];
    }
    
    setValue('permissions', newPermissions as any, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const handleNotificationToggle = (notificationType: 'emailAlerts' | 'systemAlerts' | 'securityAlerts') => {
    const currentPreferences = getValues('notificationPreferences') || {
      emailAlerts: true,
      systemAlerts: true,
      securityAlerts: true
    };
    
    const newPreferences = {
      ...currentPreferences,
      [notificationType]: !currentPreferences[notificationType]
    };
    
    setValue('notificationPreferences', newPreferences, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  const notificationPreferences = getValues('notificationPreferences') || {
    emailAlerts: true,
    systemAlerts: true,
    securityAlerts: true
  };

  const handleAccessLevelChange = (value: string) => {
    setValue('accessLevel', value as any, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
  };

  return (
    <StepContainer>
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
            value={getValues('accessLevel') || 'ADMIN'}
            onChange={handleAccessLevelChange}
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
                  $disabled={selectedPermissions.includes('FULL_ACCESS') && permission.value !== 'FULL_ACCESS'}
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
                    {permission.description}
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

export default React.memo(Step3Permissions);
