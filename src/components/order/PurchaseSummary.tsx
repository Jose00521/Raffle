import React from 'react';
import styled, { keyframes } from 'styled-components';
import { INumberPackageCampaign } from '@/hooks/useCampaignSelection';

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

  return (
    <Container className={className} $isCombo={!!isCombo}>
      <Header>
        <TitleSection>
          <Title>Resumo da Compra</Title>
          {isCombo && (
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
          )}
        </TitleSection>
        {onClose && (
          <CloseButton onClick={onClose}>
            <CloseIcon>×</CloseIcon>
          </CloseButton>
        )}
      </Header>

      {isCombo && (
        <ComboAdvantages>
          <AdvantageItem>
            <AdvantageIcon>✨</AdvantageIcon>
            <AdvantageText>
              <AdvantageLabel>Combo {name || 'Selecionado'}</AdvantageLabel>
              <AdvantageValue>{discount >= 0.01 ? `Economia de R$ ${discount.toFixed(2)}` : 'Preço especial'}</AdvantageValue>
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
      )}

      <MainContent>
        <StatsSection>
          <StatItem>
            <StatIcon>🎫</StatIcon>
            <StatContent>
              <StatValue>{quantity}</StatValue>
              <StatLabel>números</StatLabel>
            </StatContent>
          </StatItem>
          
          <Divider />
          
          <StatItem>
            <StatContent>
              <StatValue>R$ {unitPrice.toFixed(2)}</StatValue>
              <StatLabel>/número</StatLabel>
            </StatContent>
          </StatItem>
          
          {isCombo && discount >= 0.01 && (
            <>
              <Divider />
              <DiscountItem>
                <DiscountIcon>💰</DiscountIcon>
                <StatContent>
                  <DiscountValue>-R$ {discount.toFixed(2)}</DiscountValue>
                  <StatLabel>desconto</StatLabel>
                </StatContent>
              </DiscountItem>
            </>
          )}
          
          <Divider />
          
          <TotalItem $isCombo={!!isCombo}>
            <StatContent>
              <TotalLabel>Total:</TotalLabel>
              <PriceWrapper>
                {isCombo && discount >= 0.01 && (
                  <OriginalPrice>R$ {originalTotal.toFixed(2)}</OriginalPrice>
                )}
                <FinalPrice>R$ {totalPrice!.toFixed(2)}</FinalPrice>
              </PriceWrapper>
            </StatContent>
          </TotalItem>
        </StatsSection>
      </MainContent>
      
      <Footer>
        <PaymentInfo>
          <PixIcon>
          <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="48px" height="48px" baseProfile="basic"><path fill="#4db6ac" d="M11.9,12h-0.68l8.04-8.04c2.62-2.61,6.86-2.61,9.48,0L36.78,12H36.1c-1.6,0-3.11,0.62-4.24,1.76	l-6.8,6.77c-0.59,0.59-1.53,0.59-2.12,0l-6.8-6.77C15.01,12.62,13.5,12,11.9,12z"/><path fill="#4db6ac" d="M36.1,36h0.68l-8.04,8.04c-2.62,2.61-6.86,2.61-9.48,0L11.22,36h0.68c1.6,0,3.11-0.62,4.24-1.76	l6.8-6.77c0.59-0.59,1.53-0.59,2.12,0l6.8,6.77C32.99,35.38,34.5,36,36.1,36z"/><path fill="#4db6ac" d="M44.04,28.74L38.78,34H36.1c-1.07,0-2.07-0.42-2.83-1.17l-6.8-6.78c-1.36-1.36-3.58-1.36-4.94,0	l-6.8,6.78C13.97,33.58,12.97,34,11.9,34H9.22l-5.26-5.26c-2.61-2.62-2.61-6.86,0-9.48L9.22,14h2.68c1.07,0,2.07,0.42,2.83,1.17	l6.8,6.78c0.68,0.68,1.58,1.02,2.47,1.02s1.79-0.34,2.47-1.02l6.8-6.78C34.03,14.42,35.03,14,36.1,14h2.68l5.26,5.26	C46.65,21.88,46.65,26.12,44.04,28.74z"/></svg>
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

// Styled Components
const Container = styled.div<{ $isCombo: boolean }>`
  width: 100%;
  max-width: 650px;
  background: ${props => props.$isCombo 
    ? 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)'
    : 'linear-gradient(145deg, #ffffff 0%, #fafbfc 100%)'
  };
  border-radius: 12px;
  border: 1px solid ${props => props.$isCombo 
    ? 'rgba(16, 185, 129, 0.2)'
    : 'rgba(226, 232, 240, 0.6)'
  };
  box-shadow: ${props => props.$isCombo 
    ? '0 4px 12px rgba(16, 185, 129, 0.1), 0 1px 3px rgba(16, 185, 129, 0.1)'
    : '0 3px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.08)'
  };
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
  animation: ${fadeIn} 0.3s ease-out;
  position: relative;
  overflow: hidden;
  
  ${props => props.$isCombo && `
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
  `}
  
  @media (max-width: 680px) {
    max-width: 100%;
    border-radius: 10px;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.4);
  
  @media (max-width: 480px) {
    padding: 10px 14px;
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
  padding: 10px 16px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
  animation: ${slideIn} 0.4s ease-out 0.2s both;
  
  @media (max-width: 580px) {
    flex-direction: column;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 14px;
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

const MainContent = styled.div`
  padding: 14px 16px;
  
  @media (max-width: 480px) {
    padding: 12px 14px;
  }
`;

const StatsSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 580px) {
    justify-content: center;
    gap: 8px;
  }
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 480px) {
    gap: 4px;
  }
`;

const DiscountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid rgba(16, 185, 129, 0.2);
  border-radius: 8px;
  padding: 6px 8px;
  animation: ${slideIn} 0.3s ease-out 0.2s both;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
  
  @media (max-width: 480px) {
    gap: 4px;
    padding: 4px 6px;
  }
`;

const TotalItem = styled.div<{ $isCombo: boolean }>`
  background: ${props => props.$isCombo 
    ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'
    : 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
  };
  border: 1px solid ${props => props.$isCombo 
    ? 'rgba(245, 158, 11, 0.2)'
    : 'rgba(14, 165, 233, 0.1)'
  };
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: ${props => props.$isCombo 
    ? '0 2px 4px rgba(245, 158, 11, 0.1)'
    : '0 2px 4px rgba(14, 165, 233, 0.05)'
  };
  
  @media (max-width: 480px) {
    padding: 6px 8px;
  }
`;

const StatIcon = styled.span`
  font-size: 16px;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const DiscountIcon = styled.span`
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const StatValue = styled.span`
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const DiscountValue = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: #047857;
  line-height: 1;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const StatLabel = styled.span`
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
  margin-top: 1px;
  
  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const TotalLabel = styled.span`
  font-size: 12px;
  color: #475569;
  font-weight: 600;
  line-height: 1;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const PriceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin-top: 2px;
`;

const OriginalPrice = styled.span`
  font-size: 9px;
  color: #64748b;
  font-weight: 500;
  text-decoration: line-through;
  
  @media (max-width: 480px) {
    font-size: 8px;
  }
`;

const FinalPrice = styled.span`
  font-size: 16px;
  font-weight: 900;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

const Divider = styled.div`
  width: 3px;
  height: 3px;
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 50%;
  opacity: 0.6;
  
  @media (max-width: 580px) {
    display: none;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px 12px;
  border-top: 1px solid rgba(226, 232, 240, 0.4);
  
  @media (max-width: 480px) {
    padding: 8px 14px 10px;
    gap: 8px;
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

export default PurchaseSummary;
