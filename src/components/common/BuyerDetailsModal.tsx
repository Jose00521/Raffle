'use client';

import React from 'react';
import styled from 'styled-components';
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaTimes, 
  FaWhatsapp,
  FaRegEnvelope,
  FaCreditCard,
  FaMoneyBillWave,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimesCircle,
  FaArrowRight,
  FaUser,
  FaIdCard
} from 'react-icons/fa';
import { MdContentCopy } from 'react-icons/md';
import { SiPix } from 'react-icons/si';
import { IoMdOpen } from 'react-icons/io';
import Link from 'next/link';
import { formatCurrency } from '@/utils/formatNumber';

interface BuyerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  buyer: any;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: visible;
  pointer-events: ${props => props.$isOpen ? 'all' : 'none'};
  transition: opacity 0.3s ease;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: visible;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  transition: transform 0.3s ease;
  padding: 0;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }
  
  @media (max-width: 480px) {
    width: 95%;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 12px 12px 0 0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
`;

const ModalBody = styled.div`
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 15px;
  }
`;

const BuyerProfile = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
`;

const BuyerAvatar = styled.div`
  width: 60px;
  height: 60px;
  min-width: 60px;
  min-height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  font-weight: 600;
  margin-right: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.2);
  
  @media (max-width: 480px) {
    margin-right: 0;
    margin-bottom: 12px;
    width: 70px;
    height: 70px;
    min-width: 70px;
    min-height: 70px;
    font-size: 1.6rem;
  }
`;

const BuyerInfo = styled.div`
  flex: 1;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const BuyerName = styled.h4`
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const BuyerContact = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 6px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    justify-content: center;
  }
`;

const DetailCard = styled.div`
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 16px;
  }
`;

const DetailCardTitle = styled.h5`
  margin: 0 0 16px 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 14px;
  font-size: 0.9rem;
  align-items: center;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  width: 120px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const DetailValue = styled.div`
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
`;

const ActionButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(106, 17, 203, 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(106, 17, 203, 0.3);
  }
`;

const PaymentInfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const PaymentMethodContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaymentMethodIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  min-width: 28px;
  min-height: 28px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.04);
`;

const StatusTag = styled.span<{ $status: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  gap: 6px;
  
  ${({ $status }) => {
    if ($status === 'APPROVED') {
      return `
        background-color: rgba(16, 185, 129, 0.1);
        color: #10b981;
      `;
    } else if ($status === 'PENDING') {
      return `
        background-color: rgba(245, 158, 11, 0.1);
        color: #f59e0b;

        animation: blink 2s ease infinite;
  
        @keyframes blink {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }        
      `;
    } else if ($status === 'REFUNDED' || $status === 'FAILED' || $status === 'EXPIRED') {
      return `
        background-color: rgba(239, 68, 68, 0.1);
        color: #ef4444;
      `;
    } else {
      return `
        background-color: rgba(107, 114, 128, 0.1);
        color: #6b7280;
      `;
    }
  }}
`;

const DetailsButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
  }
`;

const StatusIconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  height: 28px;
  
  &:hover span {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
  }
`;

const Tooltip = styled.span`
  visibility: hidden;
  width: auto;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  text-align: center;
  border-radius: 6px;
  padding: 5px 10px;
  position: absolute;
  z-index: 20;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%) translateY(5px);
  opacity: 0;
  transition: opacity 0.3s, transform 0.3s;
  font-size: 0.75rem;
  font-weight: normal;
  white-space: nowrap;
  pointer-events: none;
`;

const UserCodeDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
  position: relative;
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const UserCodeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const UserCodeText = styled.span`
  flex: 1;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
`;

const UserCodeLabel = styled.span`
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CopyUserCodeButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background-color: rgba(106, 17, 203, 0.1);
  color: #6a11cb;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(106, 17, 203, 0.2);
    transform: scale(1.1);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CopyFeedback = styled.div<{ $show: boolean }>`
  position: absolute;
  top: -35px;
  right: 0;
  background-color: rgba(16, 185, 129, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
  opacity: ${props => props.$show ? 1 : 0};
  transform: translateY(${props => props.$show ? '0' : '10px'});
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 10;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    right: 10px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid rgba(16, 185, 129, 0.9);
  }
`;

const BuyerDetailsModal: React.FC<BuyerDetailsModalProps> = ({ isOpen, onClose, buyer }) => {
  const [copyFeedback, setCopyFeedback] = React.useState<string | null>(null);
  
  if (!buyer) return null;
  
  const formatPhoneForWhatsApp = (phone: string) => {
    // Remove não numéricos e garante formato internacional
    return phone.replace(/\D/g, '').replace(/^0/, '55');
  };
  
  const getPaymentIcon = (method: string) => {
    method = method.toLowerCase();
    if (method.includes('pix')) {
      return <SiPix size={16} />;
    } else if (method.includes('cartão') || method.includes('card') || method.includes('credito') || method.includes('débito')) {
      return <FaCreditCard size={16} />;
    } else {
      return <FaMoneyBillWave size={16} />;
    }
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'APPROVED') {
      return <FaCheckCircle size={16} />;
    } else if (status === 'PENDING') {
      return <FaExclamationCircle size={16} />;
    } else if (status === 'REFUNDED' || status === 'FAILED' || status === 'EXPIRED') {
      return <FaTimesCircle size={16} />;
    }
    return null;
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback('Copiado!');
      setTimeout(() => setCopyFeedback(null), 2000); // Exibe feedback por 2 segundos
    }).catch(() => {
      setCopyFeedback('Erro ao copiar!');
      setTimeout(() => setCopyFeedback(null), 2000); // Exibe feedback por 2 segundos
    });
  };
  
  const getMapUrl = (address: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };
  
  const handleDetailsClick = () => {
    // Aqui você pode implementar a ação para ver detalhes completos,
    // como navegar para uma página específica ou mostrar mais informações
    console.log("Ver detalhes completos da compra:", buyer);
  };
  
  return (
    <ModalOverlay $isOpen={isOpen} onClick={() => onClose()}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Detalhes da Compra</ModalTitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <BuyerProfile>
            <BuyerAvatar>
              {buyer.customerInfo?.name?.charAt(0)}
            </BuyerAvatar>
            <BuyerInfo>

              <BuyerName>{buyer.customerInfo?.name}</BuyerName>
              <BuyerContact>
                <FaEnvelope size={14} />
                {buyer.customerInfo?.email}
                <ActionButtonsContainer>
                  <TooltipWrapper>
                    <ActionButton href={`mailto:${buyer.customerInfo?.email}`} target="_blank" rel="noopener noreferrer">
                      <FaRegEnvelope size={12} />
                      <Tooltip>Enviar email</Tooltip>
                    </ActionButton>
                  </TooltipWrapper>
                  <TooltipWrapper>
                    <ActionButton onClick={() => copyToClipboard(buyer.customerInfo?.email || '')}>
                      <MdContentCopy size={12} />
                      <Tooltip>Copiar email</Tooltip>
                    </ActionButton>
                  </TooltipWrapper>
                </ActionButtonsContainer>
              </BuyerContact>
              {buyer.customerInfo?.phone && (
                <BuyerContact>
                  <FaPhone size={14} />
                  {buyer.customerInfo?.phone}
                  <ActionButtonsContainer>
                    <TooltipWrapper>
                      <ActionButton 
                        href={`https://wa.me/${formatPhoneForWhatsApp(buyer.customerInfo?.phone || '')}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <FaWhatsapp size={12} />
                        <Tooltip>WhatsApp</Tooltip>
                      </ActionButton>
                    </TooltipWrapper>
                    <TooltipWrapper>
                      <ActionButton href={`tel:${buyer.customerInfo?.phone}`}>
                        <FaPhone size={12} />
                        <Tooltip>Ligar</Tooltip>
                      </ActionButton>
                    </TooltipWrapper>
                  </ActionButtonsContainer>
                </BuyerContact>
              )}
            </BuyerInfo>
          </BuyerProfile>
                        <UserCodeDisplay>
                <UserCodeSection>
                  <UserCodeLabel>
                    <FaIdCard size={12} />
                    Código do Cliente:
                  </UserCodeLabel>
                  <UserCodeText>{buyer.customerId.userCode}</UserCodeText>
                </UserCodeSection>
                <CopyUserCodeButton onClick={() => copyToClipboard(buyer.customerId.userCode)}>
                  <MdContentCopy size={12} />
                </CopyUserCodeButton>
                <CopyFeedback $show={copyFeedback === 'Copiado!'}>
                  {copyFeedback}
                </CopyFeedback>
              </UserCodeDisplay>
          <DetailCard>
            <DetailCardTitle>Informações Pessoais</DetailCardTitle>
            {buyer.billingInfo?.address && (
              <DetailRow>
                <DetailLabel><FaMapMarkerAlt size={14} /> Endereço:</DetailLabel>
                <DetailValue>
                  {buyer.billingInfo?.address}, {buyer.billingInfo?.city}, {buyer.billingInfo?.zipCode} - {buyer.billingInfo?.state}
                  <TooltipWrapper>
                    <ActionButton 
                      href={getMapUrl(buyer.billingInfo || '')} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <IoMdOpen size={12} />
                      <Tooltip>Ver no mapa</Tooltip>
                    </ActionButton>
                  </TooltipWrapper>
                </DetailValue>
              </DetailRow>
            )}
          </DetailCard>
          
          <DetailCard>
            <DetailCardTitle>Detalhes da Compra</DetailCardTitle>
            <DetailRow>
              <DetailLabel>Campanha:</DetailLabel>
              <DetailValue>{buyer.campaignId.title}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Data:</DetailLabel>
              <DetailValue>
                {new Date(buyer.approvedAt || buyer.createdAt).toLocaleDateString('pt-BR')} às {' '}
                {new Date(buyer.approvedAt || buyer.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Números:</DetailLabel>
              <DetailValue>{buyer.numbersQuantity} números adquiridos</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Valor Total:</DetailLabel>
              <DetailValue>{formatCurrency(buyer.amount)}</DetailValue>
            </DetailRow>
            
            <PaymentInfoRow>
              <PaymentMethodContainer>
                <PaymentMethodIcon>
                  {getPaymentIcon(buyer.paymentMethod)}
                </PaymentMethodIcon>
                {buyer.paymentMethod}
              </PaymentMethodContainer>
              
              <StatusTag $status={buyer.status}>
                <StatusIconWrapper>
                  {getStatusIcon(buyer.status)}
                </StatusIconWrapper>
                {buyer.status === 'APPROVED' && 'Pago'}
                {buyer.status === 'PENDING' && 'Pendente'}
                {buyer.status === 'REFUNDED' && 'Estornado'}
                {buyer.status === 'FAILED' && 'Falhou'}
                {buyer.status === 'EXPIRED' && 'Expirado'}
              </StatusTag>
            </PaymentInfoRow>
          </DetailCard>
          
          <DetailsButton onClick={handleDetailsClick}>
            Ver Detalhes Completos
            <FaArrowRight size={14} />
          </DetailsButton>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BuyerDetailsModal; 