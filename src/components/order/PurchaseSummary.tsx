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
  const discountPercentage = isCombo ? Math.round((discount / originalTotal) * 100) : 0;

  return (
    <PremiumContainer className={className}>
      <HeaderSection>
        <TitleWrapper>
          <PremiumTitle>Resumo da Compra</PremiumTitle>
          {isCombo && (
            <ComboTag>
              <ComboIcon>🎯</ComboIcon>
              <ComboName>{name}</ComboName>
            </ComboTag>
          )}
        </TitleWrapper>
        {onClose && (
          <CloseButton onClick={onClose}>
            <CloseIcon>×</CloseIcon>
          </CloseButton>
        )}
      </HeaderSection>

      {isCombo && discount > 0 && (
        <DiscountSection>
          <DiscountBadge>
            <DiscountIcon>💰</DiscountIcon>
            <DiscountInfo>
              <DiscountLabel>Economia no combo</DiscountLabel>
              <DiscountAmount>R$ {discount.toFixed(2)} ({discountPercentage}% OFF)</DiscountAmount>
            </DiscountInfo>
          </DiscountBadge>
        </DiscountSection>
      )}
      
      <ContentSection>
        <StatsRow>
          <StatItem>
            <TicketIconWrapper>
              <TicketIcon>🎫</TicketIcon>
            </TicketIconWrapper>
            <StatContent>
              <StatNumber>{quantity}</StatNumber>
              <StatLabel>números</StatLabel>
            </StatContent>
          </StatItem>
          
          <Divider />
          
          <StatItem>
            <StatContent>
              <StatPrice>R$ {unitPrice.toFixed(2)}</StatPrice>
              <StatLabel>/número</StatLabel>
            </StatContent>
          </StatItem>
          
          <Divider />
          
          <StatItem>
            <StatContent>
              <TotalLabel>Total:</TotalLabel>
              <TotalAmount>R$ {totalPrice!.toFixed(2)}</TotalAmount>
            </StatContent>
          </StatItem>
        </StatsRow>
      </ContentSection>
      
      <FooterSection>
        <PaymentGroup>
          <PixBadge>
            <PixIconWrapper>
              <PixSymbol>
                <svg width="20" height="20" viewBox="0 0 512 512" fill="none">
                  <path d="M242.4 391.5h27.2c26.7 0 49.5-7.8 68.4-23.4c18.9-15.6 28.4-36.7 28.4-63.3c0-26.6-9.5-47.7-28.4-63.3c-18.9-15.6-41.7-23.4-68.4-23.4h-27.2v173.4zM269.6 242.1c38.4 0 67.8 9.5 88.2 28.4c20.4 18.9 30.6 45.5 30.6 79.8c0 34.3-10.2 60.9-30.6 79.8c-20.4 18.9-49.8 28.4-88.2 28.4h-60.1V242.1h60.1z" fill="currentColor"/>
                  <path d="M153.6 391.5h102.8v-33.9H196.8V242.1h-43.2v149.4z" fill="currentColor"/>
                  <path d="M256 512c141.4 0 256-114.6 256-256S397.4 0 256 0S0 114.6 0 256s114.6 256 256 256z" fill="currentColor"/>
                </svg>
              </PixSymbol>
            </PixIconWrapper>
            <PaymentLabel>Pagamento via <PaymentHighlight>PIX</PaymentHighlight></PaymentLabel>
          </PixBadge>
        </PaymentGroup>
        
        <SecurityGroup>
          <SecurityBadge>
            <SecurityIconWrapper secure>
              <SecurityIcon>🛡️</SecurityIcon>
            </SecurityIconWrapper>
            <SecurityLabel>Seguro</SecurityLabel>
          </SecurityBadge>
          
          <SecurityBadge>
            <SecurityIconWrapper instant>
              <SecurityIcon>⚡</SecurityIcon>
            </SecurityIconWrapper>
            <SecurityLabel>Instantâneo</SecurityLabel>
          </SecurityBadge>
        </SecurityGroup>
      </FooterSection>
    </PremiumContainer>
  );
};

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const PremiumContainer = styled.div`
  width: 100%;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
  border-radius: 20px;
  padding: 24px 28px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', system-ui, sans-serif;
  border: 1px solid rgba(148, 163, 184, 0.08);
  box-shadow: 
    0 8px 25px -5px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.4s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -200px;
    width: 200px;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.15),
      transparent
    );
    animation: ${shimmer} 4s infinite;
  }
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const TitleWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PremiumTitle = styled.h3`
  font-size: 18px;
  font-weight: 800;
  background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  letter-spacing: -0.03em;
  line-height: 1.2;
`;

const ComboTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 12px;
  padding: 4px 10px;
  animation: ${slideDown} 0.3s ease-out;
`;

const ComboIcon = styled.span`
  font-size: 12px;
`;

const ComboName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: #92400e;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DiscountSection = styled.div`
  margin-bottom: 16px;
  animation: ${slideDown} 0.4s ease-out 0.1s both;
`;

const DiscountBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);
`;

const DiscountIcon = styled.span`
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const DiscountInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const DiscountLabel = styled.span`
  font-size: 12px;
  color: #065f46;
  font-weight: 500;
  line-height: 1;
`;

const DiscountAmount = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #047857;
  margin-top: 2px;
`;

const CloseButton = styled.button`
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 10px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
  
  &:hover {
    background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
    border-color: rgba(148, 163, 184, 0.25);
    transform: translateY(-1px) scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0) scale(0.98);
  }
`;

const CloseIcon = styled.span`
  font-size: 16px;
  color: #64748b;
  line-height: 1;
  font-weight: 500;
`;

const ContentSection = styled.div`
  margin-bottom: 18px;
  position: relative;
  z-index: 1;
`;

const StatsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const TicketIconWrapper = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(251, 191, 36, 0.25);
  animation: ${pulse} 2s infinite;
`;

const TicketIcon = styled.span`
  font-size: 18px;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const StatNumber = styled.span`
  font-size: 20px;
  font-weight: 900;
  color: #0f172a;
  line-height: 1;
  letter-spacing: -0.03em;
`;

const StatPrice = styled.span`
  font-size: 17px;
  font-weight: 800;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

const StatLabel = styled.span`
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
  margin-top: 2px;
`;

const TotalLabel = styled.span`
  font-size: 14px;
  color: #475569;
  font-weight: 700;
  line-height: 1;
`;

const TotalAmount = styled.span`
  font-size: 22px;
  font-weight: 900;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  text-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
`;

const Divider = styled.div`
  width: 5px;
  height: 5px;
  background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
  border-radius: 50%;
  opacity: 0.5;
`;

const FooterSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  position: relative;
  z-index: 1;
`;

const PaymentGroup = styled.div`
  display: flex;
  align-items: center;
`;

const PixBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 24px;
  padding: 8px 14px;
  box-shadow: 0 3px 6px rgba(16, 185, 129, 0.08);
`;

const PixIconWrapper = styled.div`
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
`;

const PixSymbol = styled.div`
  color: #ffffff;
  width: 14px;
  height: 14px;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const PaymentLabel = styled.span`
  font-size: 13px;
  color: #065f46;
  font-weight: 600;
`;

const PaymentHighlight = styled.strong`
  color: #047857;
  font-weight: 800;
`;

const SecurityGroup = styled.div`
  display: flex;
  gap: 14px;
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const SecurityIconWrapper = styled.div<{ secure?: boolean; instant?: boolean }>`
  width: 18px;
  height: 18px;
  background: ${props => 
    props.secure 
      ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
      : props.instant
      ? 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)'
      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  };
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${props => 
    props.secure 
      ? '0 2px 4px rgba(251, 191, 36, 0.25)'
      : props.instant
      ? '0 2px 4px rgba(168, 85, 247, 0.25)'
      : '0 2px 4px rgba(16, 185, 129, 0.25)'
  };
`;

const SecurityIcon = styled.span`
  font-size: 9px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
`;

const SecurityLabel = styled.span`
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
`;

export default PurchaseSummary;
