'use client';

import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEllipsisV, 
  FaExternalLinkAlt, 
  FaPencilAlt, 
  FaTrash, 
  FaPowerOff,
  FaCode,
  FaCreditCard,
  FaQrcode,
  FaFileInvoice,
  FaPaypal,
  FaBitcoin,
  FaUniversity,
  FaQuestion
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Gateway, PaymentGatewayTemplateStatus } from '@/mocks/gatewayMocks';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

// Interfaces e tipos
interface GatewayListProps {
  gateways: Gateway[];
}

// Componentes estilizados
const Container = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 0.5fr;
  padding: 0.875rem 1.5rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-weight: 600;
  font-size: 0.75rem;
  color: #4b5563;

  @media (max-width: 1024px) {
    grid-template-columns: 3fr 1fr 1fr 0.5fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 3fr 1fr 0.5fr;
  }
`;

const HeaderItem = styled.div`
  &:last-child {
    text-align: right;
  }

  @media (max-width: 1024px) {
    &:nth-child(4) {
      display: none;
    }
  }

  @media (max-width: 768px) {
    &:nth-child(3) {
      display: none;
    }
  }
`;

// Adicionar um novo componente estilizado para os métodos de pagamento
const SupportedMethods = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const MethodIcon = styled.div<{ $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 3px;
  background-color: transparent;
  border: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 0.625rem;
  position: relative;
  cursor: help;

  &:hover {
    background-color: #f8fafc;
    border-color: #94a3b8;
  }

  &:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: rgba(15, 23, 42, 0.9);
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.7rem;
    white-space: nowrap;
    margin-bottom: 0.25rem;
    z-index: 10;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    font-weight: 500;
  }
`;

const GatewayItem = styled(motion.div)`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 0.5fr;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }

  @media (max-width: 1024px) {
    grid-template-columns: 3fr 1fr 1fr 0.5fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 3fr 1fr 0.5fr;
  }
`;

const GatewayInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.875rem;
`;

const LogoContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 0.25rem;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid #e2e8f0;
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const InfoContent = styled.div``;

const GatewayName = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const GatewayDescription = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const StatusBadge = styled.div<{ $status: 'active' | 'inactive' | 'pending' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  width: fit-content;
  
  ${props => {
    switch(props.$status) {
      case 'active':
        return `
          background-color: #f0fdf4;
          color: #16a34a;
          border: 1px solid #dcfce7;
        `;
      case 'inactive':
        return `
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fee2e2;
        `;
      case 'pending':
        return `
          background-color: #fffbeb;
          color: #d97706;
          border: 1px solid #fef3c7;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        `;
    }
  }}
`;

const TransactionInfo = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

const TransactionVolume = styled.div`
  font-weight: 600;
  color: #1a202c;
  font-size: 0.875rem;
`;

const TransactionCount = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
`;

const SuccessRate = styled.div`
  font-weight: 600;
  color: #16a34a;
  font-size: 0.875rem;

  @media (max-width: 1024px) {
    display: none;
  }
`;

const MenuContainer = styled.div`
  position: relative;
  text-align: right;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.25rem;
  
  &:hover {
    background-color: #f3f4f6;
    color: #4b5563;
  }
`;

const MenuDropdown = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  width: 200px;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  z-index: 10;
  overflow: hidden;
`;

const MenuItem = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  color: #4b5563;
  
  &:hover {
    background-color: #f8fafc;
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  color: #6b7280;
`;

const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #e5e7eb;
`;

const EmptyStateTitle = styled.div`
  font-weight: 600;
  font-size: 1rem;
  margin-bottom: 0.5rem;
`;

const EmptyStateDescription = styled.div`
  font-size: 0.875rem;
  max-width: 300px;
  text-align: center;
  line-height: 1.5;
`;

// Apenas atualizando o componente para usar o novo modelo
const GatewayList: React.FC<GatewayListProps> = ({ gateways }) => {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  
  const toggleMenu = (code: string) => {
    setActiveMenu(activeMenu === code ? null : code);
  };

  const handleEdit = (code: string) => {
    router.push(`/dashboard/admin/pagamentos/gateways/editar/${code}`);
    setActiveMenu(null);
  };

  const handleDetails = (code: string) => {
    router.push(`/dashboard/admin/pagamentos/gateways/detalhes/${code}`);
    setActiveMenu(null);
  };

  const handleToggleStatus = (code: string, currentStatus: PaymentGatewayTemplateStatus) => {
    const newStatus = currentStatus === PaymentGatewayTemplateStatus.ACTIVE 
      ? PaymentGatewayTemplateStatus.INACTIVE 
      : PaymentGatewayTemplateStatus.ACTIVE;
      
    console.log(`Toggle status for ${code}: ${newStatus}`);
    setActiveMenu(null);
  };

  const handleDelete = (code: string) => {
    console.log(`Delete gateway: ${code}`);
    setActiveMenu(null);
  };

  const renderStatusIcon = (status: PaymentGatewayTemplateStatus) => {
    switch (status) {
      case PaymentGatewayTemplateStatus.ACTIVE:
        return <FaCheckCircle />;
      case PaymentGatewayTemplateStatus.INACTIVE:
        return <FaTimesCircle />;
      case PaymentGatewayTemplateStatus.PENDING:
      case PaymentGatewayTemplateStatus.DRAFT:
        return <FaClock />;
      case PaymentGatewayTemplateStatus.DEPRECATED:
        return <FaTimesCircle />;
      default:
        return null;
    }
  };

  const getStatusText = (status: PaymentGatewayTemplateStatus): string => {
    const statusMap: Record<PaymentGatewayTemplateStatus, string> = {
      [PaymentGatewayTemplateStatus.ACTIVE]: 'Ativo',
      [PaymentGatewayTemplateStatus.INACTIVE]: 'Inativo',
      [PaymentGatewayTemplateStatus.PENDING]: 'Pendente',
      [PaymentGatewayTemplateStatus.DRAFT]: 'Rascunho',
      [PaymentGatewayTemplateStatus.DEPRECATED]: 'Descontinuado'
    };
    
    return statusMap[status] || 'Desconhecido';
  };

  // Função para obter o ícone do método de pagamento
  const getMethodIcon = (method: string) => {
    // Agora todos os ícones usarão a mesma cor neutra definida no componente MethodIcon
    // Apenas retornamos o ícone apropriado para cada método
    switch (method.toUpperCase()) {
      case 'CREDIT_CARD':
        return <FaCreditCard />;
      case 'DEBIT_CARD':
        return <FaCreditCard />;
      case 'PIX':
        return <FaQrcode />;
      case 'BILLET':
      case 'BOLETO':
        return <FaFileInvoice />;
      case 'PAYPAL':
        return <FaPaypal />;
      case 'CRYPTO':
      case 'BITCOIN':
        return <FaBitcoin />;
      case 'BANK_TRANSFER':
        return <FaUniversity />;
      default:
        return <FaQuestion />;
    }
  };

  if (gateways.length === 0) {
    return (
      <Container>
        <EmptyState>
          <EmptyStateIcon>
            <FaCode />
          </EmptyStateIcon>
          <EmptyStateTitle>Nenhum gateway encontrado</EmptyStateTitle>
          <EmptyStateDescription>
            Não existem gateways cadastrados ou que correspondam aos filtros aplicados.
          </EmptyStateDescription>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderItem>Gateway</HeaderItem>
        <HeaderItem>Status</HeaderItem>
        <HeaderItem>Transações</HeaderItem>
        <HeaderItem>Taxa de Sucesso</HeaderItem>
        <HeaderItem>Ações</HeaderItem>
      </Header>

      {gateways.map((gateway) => (
        <GatewayItem 
          key={gateway.templateCode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GatewayInfo>
            <LogoContainer>
              {gateway.logo ? (
                <Logo src={gateway.logo} alt={gateway.name} />
              ) : (
                <FaCreditCard size={20} color="#6b7280" />
              )}
            </LogoContainer>
            <InfoContent>
              <GatewayName>{gateway.name}</GatewayName>
              <GatewayDescription>{gateway.description}</GatewayDescription>
              
              {/* Adicionar os ícones dos métodos de pagamento */}
              <SupportedMethods>
                {gateway.supportedMethods && gateway.supportedMethods
                  .filter(method => method.enabled)
                  .map((method, index) => (
                    <MethodIcon 
                      key={`${gateway.templateCode}-${method.method}-${index}`}
                      data-tooltip={method.displayName}
                    >
                      {getMethodIcon(method.method)}
                    </MethodIcon>
                  ))
                }
              </SupportedMethods>
            </InfoContent>
          </GatewayInfo>
          
          <StatusBadge $status={mapStatusToUIStatus(gateway.status)}>
            {renderStatusIcon(gateway.status)}
            {getStatusText(gateway.status)}
          </StatusBadge>
          
          <TransactionInfo>
            <TransactionVolume>
              {gateway.transactionVolume ? formatCurrency(gateway.transactionVolume) : 'N/A'}
            </TransactionVolume>
            <TransactionCount>
              {gateway.transactionCount ? formatNumber(gateway.transactionCount) : '0'} transações
            </TransactionCount>
          </TransactionInfo>
          
          <SuccessRate>
            {gateway.successRate ? `${gateway.successRate.toFixed(1)}%` : 'N/A'}
          </SuccessRate>
          
          <MenuContainer>
            <MenuButton onClick={() => toggleMenu(gateway.templateCode)}>
              <FaEllipsisV />
            </MenuButton>
            
            {activeMenu === gateway.templateCode && (
              <MenuDropdown
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <MenuItem onClick={() => handleDetails(gateway.templateCode)}>
                  <FaExternalLinkAlt />
                  Ver Detalhes
                </MenuItem>
                <MenuItem onClick={() => handleEdit(gateway.templateCode)}>
                  <FaPencilAlt />
                  Editar Gateway
                </MenuItem>
                <MenuItem onClick={() => handleToggleStatus(gateway.templateCode, gateway.status)}>
                  <FaPowerOff />
                  {gateway.status === PaymentGatewayTemplateStatus.ACTIVE ? 'Desativar' : 'Ativar'}
                </MenuItem>
                <MenuItem onClick={() => handleDelete(gateway.templateCode)}>
                  <FaTrash />
                  Remover Gateway
                </MenuItem>
              </MenuDropdown>
            )}
          </MenuContainer>
        </GatewayItem>
      ))}
    </Container>
  );
};

// Helper para mapear os status do enum para os tipos aceitos pelo componente StatusBadge
function mapStatusToUIStatus(status: PaymentGatewayTemplateStatus): 'active' | 'inactive' | 'pending' {
  switch (status) {
    case PaymentGatewayTemplateStatus.ACTIVE:
      return 'active';
    case PaymentGatewayTemplateStatus.INACTIVE:
    case PaymentGatewayTemplateStatus.DEPRECATED:
      return 'inactive';
    case PaymentGatewayTemplateStatus.PENDING:
    case PaymentGatewayTemplateStatus.DRAFT:
      return 'pending';
    default:
      return 'inactive';
  }
}

export default GatewayList; 