import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animações
const securitySweep = keyframes`
  0% { left: -100%; }
  100% { left: 100%; }
`;

const shieldPulse = keyframes`
  0%, 100% { 
    transform: scale(1); 
    filter: drop-shadow(0 0 15px rgba(255,215,0,0.6)); 
  }
  50% { 
    transform: scale(1.08); 
    filter: drop-shadow(0 0 20px rgba(255,215,0,0.8)); 
  }
`;

const statusPulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
`;

// Componentes Styled
const HeaderContainer = styled.div`
  background: white;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  position: relative;
  overflow: hidden;
`;

const SecurityFortress = styled.div`
  display: flex;
  align-items: start;
  justify-content: center;
  padding: 8px 16px;
  gap: 6px;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 6px 12px;
    gap: 4px;
  }
`;

const ShieldSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
`;

const MegaShield = styled.div`
  font-size: 1.1rem;
  filter: drop-shadow(0 0 8px rgba(255,215,0,0.6));
  animation: ${shieldPulse} 3s infinite;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.45rem;
  color: #4ECDC4;
  font-weight: 700;
`;

const PulseDot = styled.div`
  width: 3px;
  height: 3px;
  background: #4ECDC4;
  border-radius: 50%;
  animation: ${statusPulse} 2s infinite;
`;

const MainContent = styled.div`
  flex: 1;
  color: white;
`;

const PrimaryLine = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
`;

const UltraSecureBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 900;
  color: #FFD700;
  text-shadow: 0 0 6px rgba(255,215,0,0.5);
  letter-spacing: 0.5px;
`;

const MilitaryBadge = styled.span`
  background: linear-gradient(45deg, #FF4757, #FF3838);
  color: white;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 0.45rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  box-shadow: 0 1px 6px rgba(255,71,87,0.4);
`;

const AuthorityMessage = styled.div`
  font-size: 0.6rem;
  color: #E8F4FD;
  margin-bottom: 3px;
  font-weight: 600;
  line-height: 1.1;
  opacity: 0.9;
`;

const SecurityLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 12px;
  
  @media (max-width: 768px) {
    margin-right: 8px;
    margin-bottom: 4px;
  }
`;

const SecurityIcon = styled.div`
  font-size: 1rem;
  filter: drop-shadow(0 0 6px rgba(255,215,0,0.4));
  animation: ${shieldPulse} 3s infinite;
`;

const SecurityText = styled.span`
  font-size: 0.75rem;
  font-weight: 700;
  color: #2c5530;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CryptographyStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  padding: 2px 6px;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(34, 197, 94, 0.2);
  
  span {
    font-size: 0.65rem;
    font-weight: 600;
    color: #16a34a;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  
  @media (max-width: 768px) {
    margin-left: 0;
    margin-top: 2px;
  }
`;

const ActiveDot = styled.div`
  width: 6px;
  height: 6px;
  background: #22c55e;
  border-radius: 50%;
  animation: ${statusPulse} 2s infinite;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  padding: 1px 4px;
  background: rgba(59, 130, 246, 0.08);
  border-radius: 6px;
  border: 1px solid rgba(59, 130, 246, 0.15);
  
  span {
    font-size: 0.6rem;
    font-weight: 600;
    color: #3b82f6;
    letter-spacing: 0.2px;
  }
  
  &.ssl {
    background: rgba(168, 85, 247, 0.08);
    border-color: rgba(168, 85, 247, 0.15);
    
    span {
      color: #a855f7;
    }
  }
  
  &.lgpd {
    background: rgba(34, 197, 94, 0.08);
    border-color: rgba(34, 197, 94, 0.15);
    
    span {
      color: #22c55e;
    }
  }
  
  @media (max-width: 768px) {
    margin-left: 4px;
  }
`;

const TrustIndicators = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const Indicator = styled.span`
  font-size: 0.7rem;
  color: #2c5530;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 600;
  padding: 4px 8px;
  background: linear-gradient(135deg, #f8fffe 0%, #f0f9f0 100%);
  border-radius: 12px;
  border: 1px solid rgba(46, 204, 113, 0.2);
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    border-color: rgba(46, 204, 113, 0.3);
  }
`;

const AuthoritySeal = styled.div`
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a1a;
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(255,215,0,0.6);
  border: 1px solid rgba(255,255,255,0.5);

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }
`;

const SealContent = styled.div`
  text-align: center;
`;

const SealIcon = styled.div`
  font-size: 0.7rem;
  margin-bottom: 0px;
`;

const SealText = styled.div`
  font-size: 0.32rem;
  font-weight: 900;
  line-height: 0.8;
  letter-spacing: 0.1px;
`;

// Componente Principal
const MaximumTrustHeader: React.FC = () => {
  return (
    <HeaderContainer>
      <SecurityFortress>
        <SecurityLabel>
          <CryptographyStatus>
            <ActiveDot />
            <span>Ambiente Seguro</span>
          </CryptographyStatus>
          <SecurityBadge>
            <span>🔒 AES-256</span>
          </SecurityBadge>
          <SecurityBadge className="ssl">
            <span>🔐 SSL</span>
          </SecurityBadge>
          <SecurityBadge className="lgpd">
            <span>✅ LGPD</span>
          </SecurityBadge>
        </SecurityLabel>
      </SecurityFortress>
    </HeaderContainer>
  );
};

export default MaximumTrustHeader; 