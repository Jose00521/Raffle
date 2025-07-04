import React from 'react';
import styled, { keyframes } from 'styled-components';
import { INumberPackageCampaign } from '@/hooks/useCampaignSelection';
import { formatCurrency } from '@/utils/formatNumber';

interface PurchaseSummaryProps {
  selection: INumberPackageCampaign;
  className?: string;
  onClose?: () => void;
}

export const PurchaseSummary: React.FC<PurchaseSummaryProps> = ({ 
  selection, 
  className,
  onClose
}) => {
  const {
    totalPrice,
    isCombo,
    name,
    quantity,
    individualNumberPrice
  } = selection;

  const unitPrice = totalPrice! / quantity;
  const originalTotal = individualNumberPrice! * quantity;
  const discount = isCombo ? originalTotal - totalPrice! : 0;
  const discountPercentage = isCombo && originalTotal > 0 ? Math.round((discount / originalTotal) * 100) : 0;

  // Renderização para caso não seja combo (layout simples)
  if (!isCombo) {
    return (
      <SimpleContainer className={className}>
        <SimpleHeader>
          <SimpleTitle>Resumo da Compra</SimpleTitle>
          {onClose && (
            <SimpleCloseButton onClick={onClose}>
              <SimpleCloseIcon>×</SimpleCloseIcon>
            </SimpleCloseButton>
          )}
        </SimpleHeader>

        <SimpleContent>
          <SimpleInfoGrid>
            <SimpleInfoLabel>Quantidade:</SimpleInfoLabel>
            <SimpleInfoValue>{quantity} números</SimpleInfoValue>
            
            <SimpleInfoLabel>Preço unitário:</SimpleInfoLabel>
            <SimpleInfoValue>{formatCurrency(unitPrice)}</SimpleInfoValue>
            
            <SimpleTotalLabel>Total:</SimpleTotalLabel>
            <SimpleTotalValue>{formatCurrency(totalPrice!)}</SimpleTotalValue>
          </SimpleInfoGrid>
        </SimpleContent>
        
        <SimpleFooter>
          <SimplePixIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16px" height="16px" baseProfile="basic"><path fill="#4db6ac" d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76	l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z"/><path fill="#4db6ac" d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76	l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z"/><path fill="#4db6ac" d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0	l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17	l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26	C46.65,21.88,46.65,26.12,44.04,28.74z"/></svg>
          </SimplePixIcon>
          <SimplePaymentText>Pagamento via PIX</SimplePaymentText>
          <SimpleSecurityBadge>🔒 Seguro</SimpleSecurityBadge>
        </SimpleFooter>
      </SimpleContainer>
    );
  }

  // Renderização para combos
  return (
    <Container className={className} $isCombo={true}>
      <Header>
        <TitleSection>
          <Title>Resumo da Compra</Title>
          <ComboInfo>
            <ComboTag>
              <ComboIcon>🎯</ComboIcon>
              <ComboLabel>{name || 'Combo'}</ComboLabel>
            </ComboTag>
            {discount >= 0.01 && (
              <SavingsBadge>
                <SavingsIcon>💰</SavingsIcon>
                <SavingsText>Economize {discountPercentage}%</SavingsText>
              </SavingsBadge>
            )}
          </ComboInfo>
        </TitleSection>
        {onClose && (
          <CloseButton onClick={onClose}>
            <CloseIcon>×</CloseIcon>
          </CloseButton>
        )}
      </Header>

      <ComboAdvantages>
        <AdvantageItem>
          <AdvantageIcon>✨</AdvantageIcon>
          <AdvantageText>
            <AdvantageLabel>{name || 'Selecionado'}</AdvantageLabel>
            <AdvantageValue>{discount >= 0.01 ? `Economia de ${formatCurrency(discount)}` : 'Preço especial'}</AdvantageValue>
          </AdvantageText>
        </AdvantageItem>
        <AdvantageItem>
          <AdvantageIcon>🎁</AdvantageIcon>
          <AdvantageText>
            <AdvantageLabel>Desconto especial</AdvantageLabel>
            <AdvantageValue>{discountPercentage > 0 ? `${discountPercentage}% OFF no total` : 'Melhor preço'}</AdvantageValue>
          </AdvantageText>
        </AdvantageItem>
      </ComboAdvantages>

      <ComboValuesSection>
        <ComboInfoGrid>
          <ComboInfoLabel>Quantidade:</ComboInfoLabel>
          <ComboInfoValue>{quantity} números</ComboInfoValue>
          
          <ComboInfoLabel>Preço unitário:</ComboInfoLabel>
          <ComboInfoValue>{formatCurrency(unitPrice)}</ComboInfoValue>
          
          {discount > 0 && (
            <>
              <ComboInfoLabel>Desconto:</ComboInfoLabel>
              <ComboDiscountValue>-{formatCurrency(discount)}</ComboDiscountValue>
            </>
          )}
          
          <ComboTotalLabel>Total:</ComboTotalLabel>
          <ComboTotalValue>{formatCurrency(totalPrice!)}</ComboTotalValue>
        </ComboInfoGrid>
      </ComboValuesSection>
      
      <Footer>
        <PaymentInfo>
          <PixIcon>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px" baseProfile="basic"><path fill="#4db6ac" d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76	l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z"/><path fill="#4db6ac" d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76	l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z"/><path fill="#4db6ac" d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0	l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17	l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26	C46.65,21.88,46.65,26.12,44.04,28.74z"/></svg>
          </PixIcon>
          <PaymentText>Pagamento via <strong>PIX</strong></PaymentText>
        </PaymentInfo>
        
        <SecurityBadges>
          <SecurityBadge>
            <SecurityIcon>🔒</SecurityIcon>
            <SecurityText>Seguro</SecurityText>
          </SecurityBadge>
          
          <SecurityBadge>
            <SecurityIcon>⚡</SecurityIcon>
            <SecurityText>Instantâneo</SecurityText>
          </SecurityBadge>
        </SecurityBadges>
      </Footer>
    </Container>
  );
};

// Componentes para o layout simples (sem combo)
const SimpleContainer = styled.div`
  width: 100%;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
`;

const SimpleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px 10px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
`;

const SimpleTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.01em;
`;

const SimpleCloseButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  
  &:hover {
    color: #334155;
  }
`;

const SimpleCloseIcon = styled.span`
  font-size: 16px;
`;

const SimpleContent = styled.div`
  padding: 12px 16px;
`;

const SimpleInfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 12px;
  align-items: center;
`;

const SimpleInfoLabel = styled.span`
  font-size: 13px;
  color: #475569;
  font-weight: 500;
  text-align: left;
`;

const SimpleInfoValue = styled.span`
  font-size: 13px;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
`;

const SimpleTotalLabel = styled(SimpleInfoLabel)`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
`;

const SimpleTotalValue = styled(SimpleInfoValue)`
  font-size: 16px;
  font-weight: 800;
  color: #047857;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #e2e8f0;
`;

const SimpleFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-top: 1px solid rgba(226, 232, 240, 0.4);
  background: #f8fafc;
`;

const SimplePixIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SimplePaymentText = styled.span`
  font-size: 12px;
  color: #047857;
  font-weight: 600;
  flex-grow: 1;
  margin-left: 6px;
`;

const SimpleSecurityBadge = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
`;

// Componentes para a seção de valores do combo (igual à foto)
const ComboValuesSection = styled.div`
  padding: 16px;
  background: linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%);
`;

const ComboInfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 8px 16px;
  align-items: center;
`;

const ComboInfoLabel = styled.span`
  font-size: 13px;
  color: #1e293b;
  font-weight: 600;
  text-align: left;
`;

const ComboInfoValue = styled.span`
  font-size: 13px;
  color: #0f172a;
  font-weight: 600;
  text-align: right;
`;

const ComboTotalLabel = styled(ComboInfoLabel)`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
`;

const ComboTotalValue = styled(ComboInfoValue)`
  font-size: 16px;
  font-weight: 800;
  color: #047857;
`;

const ComboDiscountValue = styled(ComboInfoValue)`
  color: #047857;
  font-weight: 700;
`;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5); }
`;

const bounce = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
`;

// Styled Components para o layout com combo
const Container = styled.div<{ $isCombo: boolean }>`
  width: 100% !important;
  background: linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%);
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1), 0 1px 3px rgba(16, 185, 129, 0.1);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #10b981, #059669, #047857, #059669, #10b981);
    background-size: 200% 100%;
  }
  
  @media (max-width: 680px) {
    max-width: 100%;
    border-radius: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 14px 18px 12px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
  
  @media (max-width: 480px) {
    padding: 12px 16px 10px;
  }
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.01em;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ComboInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
`;

const ComboTag = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  padding: 3px 8px;
  animation: ${slideIn} 0.3s ease-out 0.1s both;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.2);
`;

const ComboIcon = styled.span`
  font-size: 10px;
`;

const ComboLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const SavingsBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 3px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 6px;
  padding: 2px 6px;
  animation: ${bounce} 2s ease-in-out infinite;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3);
`;

const SavingsIcon = styled.span`
  font-size: 8px;
`;

const SavingsText = styled.span`
  font-size: 9px;
  font-weight: 700;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.2px;
`;

const ComboAdvantages = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 18px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
  animation: ${slideIn} 0.4s ease-out 0.2s both;
  
  @media (max-width: 580px) {
    flex-direction: column;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
  }
`;

const AdvantageItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
`;

const AdvantageIcon = styled.span`
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const AdvantageText = styled.div`
  display: flex;
  flex-direction: column;
`;

const AdvantageLabel = styled.span`
  font-size: 10px;
  color: #065f46;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  line-height: 1;
  
  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const AdvantageValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #047857;
  margin-top: 1px;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const CloseButton = styled.button`
  background: rgba(248, 250, 252, 0.8);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 6px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(226, 232, 240, 0.8);
    border-color: rgba(148, 163, 184, 0.3);
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const CloseIcon = styled.span`
  font-size: 12px;
  color: #64748b;
  line-height: 1;
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px 14px;
  border-top: 1px solid rgba(226, 232, 240, 0.4);
  
  @media (max-width: 580px) {
    flex-direction: column;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const PaymentInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const PixIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  color: #10b981;
  
  svg {
    width: 100%;
    height: 100%;
  }
  
  @media (max-width: 480px) {
    width: 12px;
    height: 12px;
  }
`;

const PaymentText = styled.span`
  font-size: 11px;
  color: #065f46;
  font-weight: 500;
  
  strong {
    font-weight: 700;
    color: #047857;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
  }
`;

const SecurityBadges = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const SecurityIcon = styled.span`
  font-size: 9px;
  
  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

const SecurityText = styled.span`
  font-size: 9px;
  color: #64748b;
  font-weight: 500;
  
  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

const DiscountIcon = styled.span`
  font-size: 14px;
  color: #047857;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export default PurchaseSummary;
