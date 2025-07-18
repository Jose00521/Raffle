'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaPlus, FaCreditCard, FaShieldAlt, FaCheckCircle, 
  FaCog, FaEllipsisV, FaEdit, FaTrash, FaStar,
  FaInfoCircle, FaExternalLinkAlt, FaLock, FaGlobe,
  FaEye, FaEyeSlash, FaSync, FaWallet, FaTimes,
  FaAngleDown, FaAngleUp, FaBookOpen, FaClock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import { toast } from 'react-toastify';
import GatewayConfigModal from '@/components/gateway/GatewayConfigModal';

// ============ INTERFACES ============
interface GatewayTemplate {
  _id: string;
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

interface UserGateway {
  _id: string;
  gatewayCode: string;
  templateRef: string;
  templateCode: string;
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING_VALIDATION' | 'ERROR';
  displayName: string;
  lastValidatedAt?: Date;
  validationError?: string;
  credentials: Record<string, any>;
  settings: Record<string, any>;
  createdAt: Date;
  template?: GatewayTemplate;
}

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1a1a1a'};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0;
  line-height: 1.5;
  max-width: 600px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

const AddGatewayButton = styled(motion.button)`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.35);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const RefreshButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
    color: #374151;
  }
`;

// Seção Principal
const MainContent = styled.div`
  display: grid;
  gap: 40px;
  
  @media (max-width: 768px) {
    gap: 32px;
  }
`;

// Seção de Gateways Configurados
const ConfiguredSection = styled.section``;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.4rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1a1a1a'};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 4px 0 0 0;
`;

const GatewaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  align-items: stretch;
  justify-items: stretch;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const GatewayCard = styled(motion.div)<{ $isDefault?: boolean; $status?: string }>`
  background: white;
  border-radius: 16px;
  border: 2px solid ${props => 
    props.$isDefault ? '#6366f1' : 
    props.$status === 'ERROR' ? '#ef4444' :
    props.$status === 'PENDING_VALIDATION' ? '#f59e0b' : '#e5e7eb'
  };
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 320px;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    border-color: ${props => 
      props.$isDefault ? '#6366f1' : 
      props.$status === 'ERROR' ? '#ef4444' :
      props.$status === 'PENDING_VALIDATION' ? '#f59e0b' : '#9ca3af'
    };
  }
  
  ${props => props.$isDefault && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
    }
  `}
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  z-index: 2;
`;

const GatewayHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
  min-height: 80px;
`;

const GatewayInfo = styled.div`
  flex: 1;
  padding-right: 12px;
`;

const GatewayLogo = styled.div<{ $color?: string }>`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$color || '#6366f1'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  margin-bottom: 12px;
  font-weight: 600;
`;

const GatewayName = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1a1a1a'};
  margin: 0 0 4px 0;
  line-height: 1.2;
`;

const GatewayDisplayName = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 8px 0;
  font-style: italic;
  line-height: 1.3;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const GatewayProvider = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text || '#9ca3af'};
  margin: 0;
  line-height: 1.2;
`;

const GatewayActions = styled.div`
  position: relative;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
`;

const StatusSection = styled.div`
  margin-bottom: 16px;
  min-height: 45px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const StatusBadge = styled.div<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    switch (props.$status) {
      case 'ACTIVE':
        return `
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        `;
      case 'PENDING_VALIDATION':
        return `
          background: rgba(245, 158, 11, 0.1);
          color: #f59e0b;
        `;
      case 'ERROR':
        return `
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        `;
      default:
        return `
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        `;
    }
  }}
`;

const GatewayFeatures = styled.div`
  margin-bottom: 16px;
  min-height: 60px;
  flex: 1;
`;

const FeaturesLabel = styled.p`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1.2;
`;

const FeaturesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: flex-start;
`;

const FeatureTag = styled.span`
  padding: 4px 8px;
  background: #f0f9ff;
  color: #0369a1;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
`;

const GatewayFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  min-height: 50px;
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  ${props => {
    if (props.$primary) {
      return `
        background: #6366f1;
        border-color: #6366f1;
        color: white;
        
        &:hover {
          background: #5855eb;
          border-color: #5855eb;
          transform: translateY(-1px);
        }
      `;
    } else if (props.$danger) {
      return `
        background: transparent;
        border-color: #ef4444;
        color: #ef4444;
        
        &:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-1px);
        }
      `;
    } else {
      return `
        background: transparent;
        border-color: #d1d5db;
        color: #6b7280;
        
        &:hover {
          background: #f9fafb;
          border-color: #9ca3af;
          color: #374151;
          transform: translateY(-1px);
        }
      `;
    }
  }}
`;

// Seção de Gateways Disponíveis
const AvailableSection = styled.section`
  margin-top: 32px;
`;

const AvailableGatewaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 20px;
  align-items: stretch;
  justify-items: stretch;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const AvailableGatewayCard = styled(motion.div)`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 200px;
  height: 100%;
  
  &:hover {
    transform: translateY(-2px);
    border-color: #6366f1;
    box-shadow: 0 8px 20px rgba(99, 102, 241, 0.15);
  }
`;

const AvailableGatewayHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  min-height: 40px;
`;

const AvailableGatewayLogo = styled.div<{ $color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$color || '#6366f1'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  font-weight: 600;
`;

const AvailableGatewayInfo = styled.div`
  flex: 1;
`;

const AvailableGatewayName = styled.h4`
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1a1a1a'};
  margin: 0 0 2px 0;
  line-height: 1.2;
`;

const AvailableGatewayProvider = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0;
  line-height: 1.2;
`;

const AvailableGatewayDescription = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 8px 0;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const AvailableGatewayFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 12px;
  min-height: 40px;
`;

const ConfigureButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background: #5855eb;
    transform: translateY(-1px);
  }
`;

const DocumentationLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  font-size: 0.75rem;
  text-decoration: none;
  transition: color 0.2s ease;
  
  &:hover {
    color: #6366f1;
  }
`;

// Estados vazios
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
`;

const EmptyStateIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #9ca3af;
  font-size: 2rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#1a1a1a'};
  margin: 0 0 8px 0;
`;

const EmptyStateDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#6b7280'};
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

// Modal/Dropdown de Ações
const ActionDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 160px;
  overflow: hidden;
`;

const DropdownItem = styled.button<{ $danger?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: white;
  color: ${props => props.$danger ? '#ef4444' : '#374151'};
  font-size: 0.85rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: ${props => props.$danger ? '#fef2f2' : '#f9fafb'};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

// Loading States
const LoadingCard = styled.div`
  background: white;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 320px;
  height: 100%;
`;

const LoadingLine = styled.div<{ $width?: string }>`
  height: 12px;
  background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%);
  border-radius: 6px;
  width: ${props => props.$width || '100%'};
  animation: shimmer 2s infinite;
  
  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`;

// ============ COMPONENTE PRINCIPAL ============
export default function GatewaysPage() {
  const [userGateways, setUserGateways] = useState<UserGateway[]>([]);
  const [availableGateways, setAvailableGateways] = useState<GatewayTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<GatewayTemplate | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Simular dados para desenvolvimento
  useEffect(() => {
    // Simular carregamento
    setTimeout(() => {
      // Dados mockados para desenvolvimento
      setUserGateways([
        {
          _id: '1',
          gatewayCode: 'USR_MP_001',
          templateRef: 'mp1',
          templateCode: 'MERCADO_PAGO_V1',
          isDefault: true,
          status: 'ACTIVE',
          displayName: 'Minha Conta Principal MP',
          lastValidatedAt: new Date(),
          credentials: {},
          settings: {},
          createdAt: new Date(),
          template: {
            _id: 'mp1',
            templateCode: 'MERCADO_PAGO_V1',
            name: 'Mercado Pago',
            description: 'Gateway oficial do Mercado Pago para processar pagamentos PIX e cartão',
            provider: 'MercadoPago',
            logo: '',
            color: '#009EE3',
            documentation: 'https://dev.mercadopago.com.br',
            status: 'ACTIVE',
            isPublic: true,
            credentialFields: [],
            settingFields: [],
            supportedMethods: ['PIX', 'CREDIT_CARD'],
            currency: 'BRL',
            country: 'BR'
          }
        },
        {
          _id: '2',
          gatewayCode: 'USR_GP_001',
          templateRef: 'gp1',
          templateCode: 'GHOSTSPAY_V1',
          isDefault: false,
          status: 'ERROR',
          displayName: 'GhostsPay Backup',
          validationError: 'Credenciais inválidas',
          credentials: {},
          settings: {},
          createdAt: new Date(),
          template: {
            _id: 'gp1',
            templateCode: 'GHOSTSPAY_V1',
            name: 'GhostsPay',
            description: 'Gateway brasileiro com foco em PIX e pagamentos instantâneos',
            provider: 'GhostsPay',
            logo: '',
            color: '#2D1B69',
            documentation: 'https://docs.ghostspay.com',
            status: 'ACTIVE',
            isPublic: true,
            credentialFields: [],
            settingFields: [],
            supportedMethods: ['PIX'],
            currency: 'BRL',
            country: 'BR'
          }
        }
      ]);

      setAvailableGateways([
        {
          _id: 'stripe1',
          templateCode: 'STRIPE_V1',
          name: 'Stripe',
          description: 'Gateway internacional com suporte global e alta conversão',
          provider: 'Stripe',
          logo: '',
          color: '#635BFF',
          documentation: 'https://stripe.com/docs',
          status: 'ACTIVE',
          isPublic: true,
          credentialFields: [],
          settingFields: [],
          supportedMethods: ['CREDIT_CARD', 'PIX'],
          currency: 'BRL',
          country: 'BR'
        },
        {
          _id: 'pagarme1',
          templateCode: 'PAGARME_V1',
          name: 'Pagar.me',
          description: 'Gateway brasileiro com taxas competitivas e integração simples',
          provider: 'PagarMe',
          logo: '',
          color: '#18A0FB',
          documentation: 'https://docs.pagar.me',
          status: 'ACTIVE',
          isPublic: true,
          credentialFields: [],
          settingFields: [],
          supportedMethods: ['PIX', 'CREDIT_CARD', 'BILLET'],
          currency: 'BRL',
          country: 'BR'
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  const handleSetDefault = async (gatewayId: string) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserGateways(prev => prev.map(gateway => ({
        ...gateway,
        isDefault: gateway._id === gatewayId
      })));
      
      toast.success('Gateway principal alterado com sucesso!');
    } catch (error) {
      toast.error('Erro ao alterar gateway principal');
    }
  };

  const handleDeleteGateway = async (gatewayId: string) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserGateways(prev => prev.filter(gateway => gateway._id !== gatewayId));
      toast.success('Gateway removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover gateway');
    }
  };

  const handleValidateCredentials = async (gatewayId: string) => {
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUserGateways(prev => prev.map(gateway => 
        gateway._id === gatewayId 
          ? { ...gateway, status: 'ACTIVE' as const, validationError: undefined, lastValidatedAt: new Date() }
          : gateway
      ));
      
      toast.success('Credenciais validadas com sucesso!');
    } catch (error) {
      toast.error('Erro na validação das credenciais');
    }
  };

  const handleAddGateway = (gatewayData: any) => {
    // Simular criação de gateway
    const newGateway: UserGateway = {
      _id: Date.now().toString(),
      gatewayCode: `USR_${gatewayData.templateCode}_${Date.now()}`,
      templateRef: gatewayData.templateRef,
      templateCode: gatewayData.templateCode,
      isDefault: userGateways.length === 0, // Primeiro gateway vira padrão
      status: 'PENDING_VALIDATION',
      displayName: gatewayData.displayName,
      credentials: gatewayData.credentials,
      settings: gatewayData.settings,
      createdAt: new Date(),
      template: availableGateways.find(t => t._id === gatewayData.templateRef)
    };

    setUserGateways(prev => [...prev, newGateway]);
    toast.success(`Gateway ${gatewayData.displayName} adicionado com sucesso!`);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <FaCheckCircle />;
      case 'PENDING_VALIDATION':
        return <FaClock />;
      case 'ERROR':
        return <FaTimes />;
      default:
        return <FaInfoCircle />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo';
      case 'PENDING_VALIDATION':
        return 'Pendente';
      case 'ERROR':
        return 'Erro';
      default:
        return 'Inativo';
    }
  };

  return (
    <CreatorDashboard>
      <PageContainer>
        <PageHeader>
          <HeaderContent>
            <PageTitle>
              <FaWallet />
              Gateways de Pagamento
            </PageTitle>
            <PageSubtitle>
              Configure e gerencie os gateways de pagamento da sua conta. 
              Você pode adicionar múltiplos gateways e escolher qual será o principal.
            </PageSubtitle>
          </HeaderContent>
          
          <HeaderActions>
            <RefreshButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
            >
              <FaSync />
            </RefreshButton>
            
            <AddGatewayButton
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConfigModal(true)}
            >
              <FaPlus />
              Nova integração
            </AddGatewayButton>
          </HeaderActions>
        </PageHeader>

        <MainContent>
          {/* Seção de Gateways Configurados */}
          <ConfiguredSection>
            <SectionHeader>
              <div>
                <SectionTitle>
                  <FaCog />
                  Gateways Configurados
                </SectionTitle>
                <SectionDescription>
                  Gerencie os gateways que você já configurou
                </SectionDescription>
              </div>
            </SectionHeader>

            {isLoading ? (
              <GatewaysGrid>
                {[1, 2, 3].map(i => (
                  <LoadingCard key={i}>
                    <LoadingLine $width="60%" />
                    <LoadingLine $width="40%" />
                    <LoadingLine $width="80%" />
                    <LoadingLine $width="30%" />
                  </LoadingCard>
                ))}
              </GatewaysGrid>
            ) : userGateways.length === 0 ? (
              <EmptyState>
                <EmptyStateIcon>
                  <FaWallet />
                </EmptyStateIcon>
                <EmptyStateTitle>Nenhum gateway configurado</EmptyStateTitle>
                <EmptyStateDescription>
                  Você ainda não configurou nenhum gateway de pagamento. 
                  Configure seu primeiro gateway para começar a receber pagamentos.
                </EmptyStateDescription>
                <AddGatewayButton
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfigModal(true)}
                >
                  <FaPlus />
                  Configurar Primeiro Gateway
                </AddGatewayButton>
              </EmptyState>
            ) : (
              <GatewaysGrid>
                <AnimatePresence>
                  {userGateways.map((gateway) => (
                    <GatewayCard
                      key={gateway._id}
                      $isDefault={gateway.isDefault}
                      $status={gateway.status}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ y: -4 }}
                    >
                      {gateway.isDefault && (
                        <DefaultBadge>
                          <FaStar />
                          Principal
                        </DefaultBadge>
                      )}

                      <GatewayHeader>
                        <GatewayInfo>
                          <GatewayLogo $color={gateway.template?.color}>
                            {gateway.template?.name.charAt(0) || 'G'}
                          </GatewayLogo>
                          <GatewayName>{gateway.template?.name}</GatewayName>
                          <GatewayDisplayName>"{gateway.displayName}"</GatewayDisplayName>
                          <GatewayProvider>{gateway.template?.provider}</GatewayProvider>
                        </GatewayInfo>

                        <GatewayActions>
                          <MoreButton
                            onClick={() => setActiveDropdown(
                              activeDropdown === gateway._id ? null : gateway._id
                            )}
                          >
                            <FaEllipsisV />
                          </MoreButton>

                          <AnimatePresence>
                            {activeDropdown === gateway._id && (
                              <ActionDropdown
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                              >
                                <DropdownItem onClick={() => console.log('edit')}>
                                  <FaEdit />
                                  Editar
                                </DropdownItem>
                                {!gateway.isDefault && (
                                  <DropdownItem onClick={() => handleSetDefault(gateway._id)}>
                                    <FaStar />
                                    Tornar Principal
                                  </DropdownItem>
                                )}
                                <DropdownItem onClick={() => handleValidateCredentials(gateway._id)}>
                                  <FaSync />
                                  Validar
                                </DropdownItem>
                                <DropdownItem 
                                  $danger 
                                  onClick={() => handleDeleteGateway(gateway._id)}
                                >
                                  <FaTrash />
                                  Remover
                                </DropdownItem>
                              </ActionDropdown>
                            )}
                          </AnimatePresence>
                        </GatewayActions>
                      </GatewayHeader>

                      <StatusSection>
                        <StatusBadge $status={gateway.status}>
                          {getStatusIcon(gateway.status)}
                          {getStatusText(gateway.status)}
                        </StatusBadge>
                        {gateway.validationError && (
                          <p style={{ 
                            fontSize: '0.8rem', 
                            color: '#ef4444', 
                            margin: '8px 0 0 0' 
                          }}>
                            {gateway.validationError}
                          </p>
                        )}
                      </StatusSection>

                      <GatewayFeatures>
                        <FeaturesLabel>Métodos Suportados</FeaturesLabel>
                        <FeaturesList>
                          {gateway.template?.supportedMethods.map(method => (
                            <FeatureTag key={method}>
                              {method === 'PIX' ? 'PIX' : 
                               method === 'CREDIT_CARD' ? 'Cartão' : 
                               method === 'BILLET' ? 'Boleto' : method}
                            </FeatureTag>
                          ))}
                        </FeaturesList>
                      </GatewayFeatures>

                      <GatewayFooter>
                        <small style={{ color: '#9ca3af', fontSize: '0.75rem' }}>
                          Criado em {gateway.createdAt.toLocaleDateString('pt-BR')}
                        </small>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          {gateway.template?.documentation && (
                            <ActionButton
                              as="a"
                              href={gateway.template.documentation}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FaBookOpen />
                              Docs
                            </ActionButton>
                          )}
                          
                          <ActionButton $primary>
                            <FaEdit />
                            Configurar
                          </ActionButton>
                        </div>
                      </GatewayFooter>
                    </GatewayCard>
                  ))}
                </AnimatePresence>
              </GatewaysGrid>
            )}
          </ConfiguredSection>

          {/* Seção de Gateways Disponíveis */}
          <AvailableSection>
            <SectionHeader>
              <div>
                <SectionTitle>
                  <FaGlobe />
                  Gateways Disponíveis
                </SectionTitle>
                <SectionDescription>
                  Explore os gateways que você pode adicionar à sua conta
                </SectionDescription>
              </div>
            </SectionHeader>

            {isLoading ? (
              <AvailableGatewaysGrid>
                {[1, 2, 3, 4].map(i => (
                  <LoadingCard key={i}>
                    <LoadingLine $width="50%" />
                    <LoadingLine $width="70%" />
                    <LoadingLine $width="40%" />
                  </LoadingCard>
                ))}
              </AvailableGatewaysGrid>
            ) : (
              <AvailableGatewaysGrid>
                <AnimatePresence>
                  {availableGateways.map((gateway) => (
                    <AvailableGatewayCard
                      key={gateway._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -2 }}
                      onClick={() => setSelectedGateway(gateway)}
                    >
                      <AvailableGatewayHeader>
                        <AvailableGatewayLogo $color={gateway.color}>
                          {gateway.name.charAt(0)}
                        </AvailableGatewayLogo>
                        <AvailableGatewayInfo>
                          <AvailableGatewayName>{gateway.name}</AvailableGatewayName>
                          <AvailableGatewayProvider>{gateway.provider}</AvailableGatewayProvider>
                        </AvailableGatewayInfo>
                      </AvailableGatewayHeader>

                      <AvailableGatewayDescription>
                        {gateway.description}
                      </AvailableGatewayDescription>

                      <GatewayFeatures>
                        <FeaturesList>
                          {gateway.supportedMethods.map(method => (
                            <FeatureTag key={method}>
                              {method === 'PIX' ? 'PIX' : 
                               method === 'CREDIT_CARD' ? 'Cartão' : 
                               method === 'BILLET' ? 'Boleto' : method}
                            </FeatureTag>
                          ))}
                        </FeaturesList>
                      </GatewayFeatures>

                      <AvailableGatewayFooter>
                        {gateway.documentation && (
                          <DocumentationLink 
                            href={gateway.documentation}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <FaExternalLinkAlt />
                            Documentação
                          </DocumentationLink>
                        )}
                        
                        <ConfigureButton>
                          <FaEdit />
                          Configurar
                        </ConfigureButton>
                      </AvailableGatewayFooter>
                    </AvailableGatewayCard>
                  ))}
                </AnimatePresence>
              </AvailableGatewaysGrid>
            )}
          </AvailableSection>
        </MainContent>

        {/* Modal de Configuração */}
        <GatewayConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSave={handleAddGateway}
        />
      </PageContainer>
    </CreatorDashboard>
  );
} 