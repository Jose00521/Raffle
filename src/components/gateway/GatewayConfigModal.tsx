'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaTimes, FaCheck, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import Modal from '@/components/ui/Modal';
import AdvancedGatewayDropdown from '@/components/gateway/AdvancedGatewayDropdown';
import GatewayConfigForm from '@/components/gateway/GatewayConfigForm';
import { adminGatewayTemplateAPIClient } from '@/API/admin/adminGatewayTemplateAPIClient';

// ============ INTERFACES ============
interface GatewayTemplate {
  _id: string;
  templateUniqueCode: string;
  templateCode: string;
  name: string;
  description: string;
  provider: string;
  logo?: string;
  color?: string;
  documentation?: string;
  status: 'ACTIVE' | 'INACTIVE';
  isPublic: boolean;
  credentialFields: CredentialField[];
  settingFields: SettingField[];
  supportedMethods: string[];
  minimumAmount?: number;
  maximumAmount?: number;
  currency: string;
  country: string;
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

interface GatewayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gatewayData: any) => void;
}

// ============ STYLED COMPONENTS ============
const ModalContent = styled.div`
  padding: 0;
  min-height: 500px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const ModalHeader = styled.div`
  padding: 24px 28px 0;
  border-bottom: 1px solid #f1f5f9;
  margin-bottom: 0;
  
  @media (max-width: 768px) {
    padding: 20px 20px 0;
  }
`;

const HeaderTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const HeaderContent = styled.div`
  flex: 1;
  padding-right: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: #6366f1;
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const ModalSubtitle = styled.p`
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: #f8fafc;
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f5f9;
    color: #374151;
    transform: scale(1.05);
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0 20px;
`;

const ProgressStep = styled.div<{ $active?: boolean; $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.2s ease;
  
  ${props => {
    if (props.$completed) {
      return `
        background: rgba(16, 185, 129, 0.1);
        color: #10b981;
      `;
    } else if (props.$active) {
      return `
        background: rgba(99, 102, 241, 0.1);
        color: #6366f1;
      `;
    } else {
      return `
        background: #f8fafc;
        color: #94a3b8;
      `;
    }
  }}
`;

const StepNumber = styled.div<{ $active?: boolean; $completed?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  
  ${props => {
    if (props.$completed) {
      return `
        background: #10b981;
        color: white;
      `;
    } else if (props.$active) {
      return `
        background: #6366f1;
        color: white;
      `;
    } else {
      return `
        background: #e2e8f0;
        color: #94a3b8;
      `;
    }
  }}
`;

const ModalBody = styled.div`
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const ModalFooter = styled.div`
  padding: 16px 28px 24px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 768px) {
    padding: 16px 20px 20px;
    flex-direction: column;
    gap: 12px;
  }
`;

const FooterActions = styled.div`
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
  
  &:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #475569;
  }
  
  @media (max-width: 768px) {
    flex: 1;
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

const SecurityNotice = styled.div`
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
export default function GatewayConfigModal({ isOpen, onClose, onSave }: GatewayConfigModalProps) {
  const [step, setStep] = useState(1);
  const [isLoadingGateway, setIsLoadingGateway] = useState(false);
  const [isSubmittingGatewayData, setIsSubmittingGatewayData] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<GatewayTemplate | null>(null);
  const [gatewayTemplates, setGatewayTemplates] = useState<GatewayTemplate[]>([]);
  const [gatewayData, setGatewayData] = useState({
    displayName: '',
    credentials: new Map(),
    settings: new Map()
  });

  useEffect(() => {
    const fetchGatewayTemplates = async () => {
      setIsLoadingGateway(true);
      const result = await adminGatewayTemplateAPIClient.getAllGatewayTemplates();
      if(result.success){
        setGatewayTemplates(result.data);
        setIsLoadingGateway(false);
      }
    }
    fetchGatewayTemplates();
  }, []);

  const handleTemplateSelect = (template: GatewayTemplate) => {
    setSelectedTemplate(template);
    setGatewayData(prev => ({
      ...prev,
      displayName: `Minha conta ${template.name}`
    }));
    //setStep(2);
  };

  const handleFormSubmit = (formData: any) => {
    setIsSubmittingGatewayData(true);
    const finalData = {
      templateUniqueCode: selectedTemplate?.templateUniqueCode,
      templateCode: selectedTemplate?.templateCode,
      ...formData
    };

    console.log(finalData);
    

    
    //handleClose();
  };

  const handleClose = () => {
    // setStep(1);
    // setSelectedTemplate(null);
    // setGatewayData({
    //   displayName: '',
    //   credentials: new Map(),
    //   settings: new Map()
    // });
    onClose();
  };

  const canProceed = step === 1 ? selectedTemplate !== null : true;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} maxWidth="900px">
      <ModalContent>
        <ModalHeader>
          <HeaderTop>
            <HeaderContent>
              <ModalTitle>
                <FaShieldAlt />
                Adicionar Gateway de Pagamento
              </ModalTitle>
              <ModalSubtitle>
                Configure um novo gateway para processar os pagamentos das suas rifas
              </ModalSubtitle>
            </HeaderContent>
            
            <CloseButton onClick={handleClose}>
              <FaTimes />
            </CloseButton>
          </HeaderTop>

          <ProgressIndicator>
            <ProgressStep $active={step === 1} $completed={step > 1}>
              <StepNumber $active={step === 1} $completed={step > 1}>
                {step > 1 ? <FaCheck size={12} /> : '1'}
              </StepNumber>
              Selecionar Gateway
            </ProgressStep>
            
            <ProgressStep $active={step === 2} $completed={step > 2}>
              <StepNumber $active={step === 2} $completed={step > 2}>
                {step > 2 ? <FaCheck size={12} /> : '2'}
              </StepNumber>
              Configurar Credenciais
            </ProgressStep>
          </ProgressIndicator>
        </ModalHeader>

        <ModalBody>
          {step === 1 && (
            <AdvancedGatewayDropdown
              templates={gatewayTemplates}
              onSelect={handleTemplateSelect}
              selectedTemplate={selectedTemplate}
            />
          )}
          
          {step === 2 && selectedTemplate && (
            <GatewayConfigForm
              template={selectedTemplate}
              initialData={gatewayData}
              onSubmit={handleFormSubmit}
              onBack={() => setStep(1)}
            />
          )}
        </ModalBody>

        {step === 1 && (
          <ModalFooter>
            <SecurityNotice>
              <FaShieldAlt />
              Todos os dados são criptografados
            </SecurityNotice>
            
            <FooterActions>
              <SecondaryButton onClick={handleClose}>
                Cancelar
              </SecondaryButton>
              
              <PrimaryButton 
                $disabled={!canProceed}
                onClick={() => canProceed && setStep(2)}
              >
                Continuar
                <FaCheck />
              </PrimaryButton>
            </FooterActions>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
} 