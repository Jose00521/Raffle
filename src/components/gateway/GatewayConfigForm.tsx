'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, FaEye, FaEyeSlash, FaShieldAlt, 
  FaCheck, FaInfoCircle, FaCog, FaKey, FaLock
} from 'react-icons/fa';
import { motion } from 'framer-motion';

// ============ INTERFACES ============
interface GatewayTemplate {
  _id: string;
  templateCode: string;
  name: string;
  description: string;
  provider: string;
  logo?: string;
  color?: string;
  credentialFields: CredentialField[];
  settingFields: SettingField[];
  supportedMethods: string[];
}

interface CredentialField {
  name: string;
  label: string;
  type: 'TEXT' | 'PASSWORD' | 'EMAIL' | 'SELECT' | 'NUMBER';
  required: boolean;
  placeholder?: string;
  description?: string;
  isSecret?: boolean;
  options?: { value: string; label: string }[];
}

interface SettingField {
  name: string;
  label: string;
  type: 'TEXT' | 'PASSWORD' | 'EMAIL' | 'SELECT' | 'NUMBER' | 'BOOLEAN';
  required: boolean;
  placeholder?: string;
  description?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

interface GatewayConfigFormProps {
  template: GatewayTemplate;
  initialData: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
}

// ============ STYLED COMPONENTS ============
const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  padding: 6px 0;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6366f1;
  }
`;

const GatewayPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  border: 1px solid #e2e8f0;
`;

const GatewayLogo = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.3rem;
`;

const GatewayInfo = styled.div`
  flex: 1;
`;

const GatewayName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px 0;
`;

const GatewayProvider = styled.p`
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
  font-weight: 500;
`;

const FormSection = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 30px;
  overflow: hidden;
`;

const SectionHeader = styled.div`
  padding: 16px 20px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionTitle = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const SectionDescription = styled.p`
  font-size: 0.8rem;
  color: #64748b;
  margin: 10px 0 0 20px;
  line-height: 1.3;
`;

const SectionBody = styled.div`
  padding: 20px;
`;

const FieldGrid = styled.div`
  display: grid;
  gap: 16px;
  
  @media (min-width: 640px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label<{ $required?: boolean }>`
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 4px;
  
  ${props => props.$required && `
    &::after {
      content: '*';
      color: #ef4444;
      font-weight: 700;
    }
  `}
`;

const FieldDescription = styled.p`
  font-size: 0.75rem;
  color: #64748b;
  margin: 0;
  line-height: 1.3;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
  color: #000;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ef4444' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  }
  
  &::placeholder {
    color: #9ca3af;
  }
  
  &[type="password"] {
    padding-right: 44px;
  }
`;

const Select = styled.select<{ $hasError?: boolean }>`
  width: 100%;
  padding: 10px 14px;
  border: 2px solid ${props => props.$hasError ? '#ef4444' : '#e2e8f0'};
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$hasError ? '#ef4444' : '#6366f1'};
    box-shadow: 0 0 0 3px ${props => props.$hasError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)'};
  }
`;

const TogglePasswordButton = styled.button`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6b7280;
  }
`;

const ErrorMessage = styled.span`
  font-size: 0.75rem;
  color: #ef4444;
  font-weight: 500;
`;

const DisplayNameField = styled.div`
  margin-bottom: 20px;
`;

const DisplayNameInput = styled(Input)`
  font-size: 0.95rem;
  padding: 12px 16px;
  border-width: 2px;
  
  &:focus {
    box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  margin: 0 -20px -20px;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    margin: 0 -20px -20px;
    flex-direction: column;
    gap: 10px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const PrimaryButton = styled.button<{ $disabled?: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.$disabled ? 0.6 : 1};
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    ${props => !props.$disabled && `
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
    `}
  }
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: center;
  }
`;

const ValidationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 0.8rem;
  
  svg {
    color: #10b981;
  }
  
  @media (max-width: 768px) {
    order: -1;
    width: 100%;
    justify-content: center;
  }
`;

// ============ COMPONENTE PRINCIPAL ============
export default function GatewayConfigForm({ 
  template, 
  initialData, 
  onSubmit, 
  onBack 
}: GatewayConfigFormProps) {
  const [formData, setFormData] = useState({
    credentials: new Map(),
    settings: new Map()
  });
  
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar campos com valores padrão
  useEffect(() => {
    const newSettings = new Map();
    template.settingFields.forEach(field => {
      if (field.defaultValue) {
        newSettings.set(field.name, field.defaultValue);
      }
    });
    
    setFormData(prev => ({
      ...prev,
      settings: newSettings
    }));
  }, [template]);

  const handleInputChange = (fieldName: string, value: string, isCredential: boolean = true) => {
    setFormData(prev => {
      const newData = { ...prev };
      if (isCredential) {
        newData.credentials = new Map(prev.credentials);
        newData.credentials.set(fieldName, value);
      } else {
        newData.settings = new Map(prev.settings);
        newData.settings.set(fieldName, value);
      }
      return newData;
    });

    // Limpar erro do campo quando o usuário digitar
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const togglePasswordVisibility = (fieldName: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar campos de credenciais
    template.credentialFields.forEach(field => {
      const value = formData.credentials.get(field.name);
      if (field.required && (!value || !value.trim())) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }
    });

    // Validar campos de configuração
    template.settingFields.forEach(field => {
      const value = formData.settings.get(field.name);
      if (field.required && (!value || !value.trim())) {
        newErrors[field.name] = `${field.label} é obrigatório`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(formData);
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field: CredentialField | SettingField, isCredential: boolean = true) => {
    const value = isCredential 
      ? formData.credentials.get(field.name) || ''
      : formData.settings.get(field.name) || '';
    
    const hasError = !!errors[field.name];
    const isPassword = field.type === 'PASSWORD';
    const showPassword = showPasswords[field.name];
    const isSecretField = 'isSecret' in field ? field.isSecret : false;

    return (
      <FormField key={field.name}>
        <FieldLabel $required={field.required}>
          {isSecretField && <FaLock size={12} />}
          {field.label}
        </FieldLabel>
        
        {field.description && (
          <FieldDescription>{field.description}</FieldDescription>
        )}

        <InputContainer>
          {field.type === 'SELECT' ? (
            <Select
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value, isCredential)}
              $hasError={hasError}
              required={field.required}
            >
              <option value="">Selecione...</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          ) : (
            <Input
              type={isPassword && !showPassword ? 'password' : 'text'}
              placeholder={field.placeholder}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value, isCredential)}
              $hasError={hasError}
            //   required={field.required}
            />
          )}

          {isPassword && (
            <TogglePasswordButton
              type="button"
              onClick={() => togglePasswordVisibility(field.name)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </TogglePasswordButton>
          )}
        </InputContainer>

        {hasError && <ErrorMessage>{errors[field.name]}</ErrorMessage>}
      </FormField>
    );
  };

  const isFormValid = !Object.keys(errors).length;

  return (
    <FormContainer>
      <BackButton onClick={onBack}>
        <FaArrowLeft />
        Voltar para seleção
      </BackButton>

      <GatewayPreview>
        <GatewayLogo $color={template.color}>
          <img src={template.logo} alt={template.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>
        </GatewayLogo>
        <GatewayInfo>
          <GatewayName>{template.name}</GatewayName>
          <GatewayProvider>by {template.provider}</GatewayProvider>
        </GatewayInfo>
      </GatewayPreview>

      <form onSubmit={handleSubmit}>

        {template.credentialFields.length > 0 && (
          <FormSection>
            <SectionHeader>
              <SectionTitle>
                <FaKey />
                Credenciais de Acesso
              </SectionTitle>
            </SectionHeader>
            <SectionDescription>
              Informe as credenciais necessárias para conectar com {template.name}
            </SectionDescription>
            <SectionBody>
              <FieldGrid>
                {template.credentialFields.map(field => renderField(field, true))}
              </FieldGrid>
            </SectionBody>
          </FormSection>
        )}

        {/* {template.settingFields.length > 0 && (
          <FormSection>
            <SectionHeader>
              <SectionTitle>
                <FaCog />
                Configurações
              </SectionTitle>
            </SectionHeader>
            <SectionDescription>
              Ajuste as configurações específicas do gateway
            </SectionDescription>
            <SectionBody>
              <FieldGrid>
                {template.settingFields.map(field => renderField(field, false))}
              </FieldGrid>
            </SectionBody>
          </FormSection>
        )} */}

        <FormActions>
          <ValidationInfo>
            <FaShieldAlt />
            Dados criptografados automaticamente
          </ValidationInfo>

          <ActionButtons>
            <SecondaryButton type="button" onClick={onBack}>
              <FaArrowLeft />
              Voltar
            </SecondaryButton>

            <PrimaryButton type="submit" $disabled={!isFormValid}>
              <FaCheck />
              Salvar Gateway
            </PrimaryButton>
          </ActionButtons>
        </FormActions>
      </form>
    </FormContainer>
  );
} 