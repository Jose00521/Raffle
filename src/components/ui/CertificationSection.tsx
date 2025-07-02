import React from 'react';
import styled from 'styled-components';

interface CertificationSectionProps {
  className?: string;
}

// ===== VERSÃO DESKTOP =====
const DesktopContainer = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 16px;
  padding: 2.25rem 2rem;
  margin: 1.75rem 0;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const DesktopTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  line-height: 1.2;

  i {
    color: #059669;
    flex-shrink: 0;
    font-size: 1.1em;
  }
`;

const DesktopLogos = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4rem;
  margin-bottom: 2rem;
`;

const DesktopLogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
  transition: transform 0.2s ease;
  position: relative;

  &:hover {
    transform: translateY(-3px);
  }

  img {
    width: 90px;
    height: 90px;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
  }
  
  /* Caixa muito maior */
  &:nth-child(2) {
    padding-top: 0;
    
    img {
      width: 140px;
      height: 140px;
      margin-top: -25px;
      margin-bottom: -25px;
    }
  }
`;

const DesktopSSLIcon = styled.div`
  width: 90px;
  height: 90px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(5, 150, 105, 0.35);
  }

  i {
    color: white;
  }
`;

const DesktopLogoLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  min-width: 0;

  .main-text {
    display: block;
    line-height: 1.2;
    font-weight: 700;
    margin-bottom: 0.3rem;
    letter-spacing: 0.03em;
  }

  .sub-text {
    color: #059669;
    font-size: 0.7rem;
    display: block;
    line-height: 1.2;
    font-weight: 500;
  }
`;

const DesktopDetails = styled.div`
  font-size: 0.8rem;
  color: #475569;
  line-height: 1.6;
  font-weight: 500;
  max-width: 800px;
  margin: 0 auto 1.5rem;

  .detail-item {
    margin-bottom: 0.75rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0.625rem;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    .check-icon {
      color: #059669;
      font-size: 0.9em;
      margin-top: 0.125rem;
      flex-shrink: 0;
    }
  }
`;

const DesktopTrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  padding: 0.625rem 1.25rem;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 1.25rem;
  border: 1px solid rgba(5, 150, 105, 0.2);
  box-shadow: 0 2px 6px rgba(5, 150, 105, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(5, 150, 105, 0.15);
  }
  
  i {
    font-size: 0.7rem;
    color: #10b981;
  }
`;

// ===== VERSÃO MOBILE =====
const MobileContainer = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: 14px;
  padding: 1.25rem 1rem;
  margin: 1.25rem 0;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const MobileTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  line-height: 1.3;

  i {
    color: #059669;
    flex-shrink: 0;
    font-size: 1.1em;
  }
`;

const MobileLogos = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding: 0 0.25rem;
`;

const MobileLogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
  flex: 1;
  max-width: 80px;
  position: relative;

  img {
    width: 54px;
    height: 54px;
    flex-shrink: 0;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
  
  /* Caixa muito maior no mobile */
  &:nth-child(2) {
    padding-top: 0;
    max-width: 100px;
    
    img {
      width: 90px;
      height: 90px;
      margin-top: -18px;
      margin-bottom: -18px;
    }
  }
`;

const MobileSSLIcon = styled.div`
  width: 54px;
  height: 54px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.3rem;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.25);

  i {
    color: white;
  }
`;

const MobileLogoLabel = styled.div`
  font-size: 0.6rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  min-width: 0;
  width: 100%;

  .main-text {
    display: block;
    line-height: 1.1;
    font-weight: 700;
    margin-bottom: 0.125rem;
    letter-spacing: 0.02em;
  }

  .sub-text {
    color: #059669;
    font-size: 0.5rem;
    display: block;
    line-height: 1.1;
    font-weight: 500;
  }
`;

const MobileDetails = styled.div`
  font-size: 0.6rem;
  color: #475569;
  line-height: 1.6;
  font-weight: 500;
  margin-bottom: 0.75rem;

  .detail-item {
    margin-bottom: 0.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;

    &:last-child {
      margin-bottom: 0;
    }

    strong {
      color: #1e293b;
      font-weight: 600;
    }
    
    .check-icon {
      color: #059669;
      font-size: 0.8em;
      margin-top: 0.0625rem;
      flex-shrink: 0;
    }
  }
`;

const MobileTrustBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(5, 150, 105, 0.1);
  color: #059669;
  padding: 0.3rem 0.5rem;
  border-radius: 8px;
  font-size: 0.575rem;
  font-weight: 600;
  margin-top: 0.5rem;
  border: 1px solid rgba(5, 150, 105, 0.2);
  box-shadow: 0 2px 4px rgba(5, 150, 105, 0.1);
  
  i {
    font-size: 0.5rem;
    color: #10b981;
  }
`;

// ===== VERSÃO COMPACT DESKTOP =====
const CompactDesktopContainer = styled.div`
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%);
  border: 1px solid rgba(5, 150, 105, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin: 1rem 0;
  text-align: center;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const CompactDesktopTitle = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  line-height: 1.2;

  i {
    color: #059669;
    flex-shrink: 0;
  }
`;

const CompactDesktopLogos = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem;
`;

const CompactDesktopLogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  position: relative;

  img {
    width: 60px;
    height: 60px;
    flex-shrink: 0;
  }
  
  /* Caixa muito maior */
  &:nth-child(2) {
    padding-top: 0;
    
    img {
      width: 100px;
      height: 100px;
      margin-top: -20px;
      margin-bottom: -20px;
    }
  }
`;

const CompactDesktopSSLIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);

  i {
    color: white;
  }
`;

const CompactDesktopLogoLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  min-width: 0;
  position: relative;

  .main-text {
    display: block;
    line-height: 1.1;
    font-weight: 700;
  }

  .sub-text {
    color: #059669;
    font-size: 0.55rem;
    display: block;
    line-height: 1.1;
    font-weight: 500;
    margin-top: 0.125rem;
  }
`;

// ===== VERSÃO COMPACT MOBILE =====
const CompactMobileContainer = styled.div`
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%);
  border: 1px solid rgba(5, 150, 105, 0.2);
  border-radius: 10px;
  padding: 0.75rem;
  margin: 0.75rem 0;
  text-align: center;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const CompactMobileTitle = styled.div`
  font-size: 0.6rem;
  font-weight: 700;
  color: #059669;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  line-height: 1.3;

  i {
    color: #059669;
    flex-shrink: 0;
  }
`;

const CompactMobileLogos = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  gap: 0.375rem;
  padding: 0 0.125rem;
`;

const CompactMobileLogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1875rem;
  min-width: 0;
  flex: 1;
  max-width: 65px;
  position: relative;

  img {
    width: 42px;
    height: 42px;
    flex-shrink: 0;
  }
  
  /* Caixa muito maior no mobile */
  &:nth-child(2) {
    padding-top: 0;
    max-width: 85px;
    
    img {
      width: 70px;
      height: 70px;
      margin-top: -15px;
      margin-bottom: -15px;
    }
  }
`;

const CompactMobileSSLIcon = styled.div`
  width: 42px;
  height: 42px;
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.2);

  i {
    color: white;
  }
`;

const CompactMobileLogoLabel = styled.div`
  font-size: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  text-align: center;
  min-width: 0;
  width: 100%;

  .main-text {
    display: block;
    line-height: 1;
    font-weight: 700;
    margin-bottom: 0.0625rem;
  }

  .sub-text {
    color: #059669;
    font-size: 0.4rem;
    display: block;
    line-height: 1;
    font-weight: 500;
  }
`;

// ===== COMPONENTE DESKTOP =====
export const CertificationSectionDesktop: React.FC<CertificationSectionProps> = ({ className }) => {
  return (
    <DesktopContainer className={className}>
      <DesktopTitle>
        <i className="fas fa-certificate"></i>
        PLATAFORMA CERTIFICADA E REGULAMENTADA
      </DesktopTitle>
      
      <DesktopLogos>
        <DesktopLogoItem>
          <img 
            src="/icons/pix-banco-central.svg" 
            alt="PIX Banco Central" 
          />
          <DesktopLogoLabel>
            <span className="main-text">PIX OFICIAL</span>
            <span className="sub-text">Banco Central</span>
          </DesktopLogoLabel>
        </DesktopLogoItem>
        
        <DesktopLogoItem>
          <img 
            src="/icons/loterias-caixa-logo.svg" 
            alt="Loterias Caixa" 
          />
          <DesktopLogoLabel>
            <span className="main-text">PARCERIA OFICIAL</span>
            <span className="sub-text">Loterias CAIXA</span>
          </DesktopLogoLabel>
        </DesktopLogoItem>
        
        <DesktopLogoItem>
          <DesktopSSLIcon>
            <i className="fas fa-shield-alt"></i>
          </DesktopSSLIcon>
          <DesktopLogoLabel>
            <span className="main-text">SSL 256-BIT</span>
            <span className="sub-text">Criptografia</span>
          </DesktopLogoLabel>
        </DesktopLogoItem>
      </DesktopLogos>
      
      <DesktopDetails>
        <div className="detail-item">
          <span className="check-icon">✅</span>
          <span><strong>Autorizada pelo Banco Central</strong> • Processo SUSEP nº 15414.901574/2024-11</span>
        </div>
        <div className="detail-item">
          <span className="check-icon">✅</span>
          <span><strong>Parceria Oficial Loterias CAIXA</strong> • Modalidade Filantropia Premiável</span>
        </div>
        <div className="detail-item">
          <span className="check-icon">✅</span>
          <span><strong>Auditoria Independente</strong> • Certificação ISO 27001 e PCI DSS</span>
        </div>
      </DesktopDetails>
      
      <DesktopTrustBadge>
        <i className="fas fa-award"></i>
        Certificação Nível AAA+ de Segurança
      </DesktopTrustBadge>
    </DesktopContainer>
  );
};

// ===== COMPONENTE MOBILE =====
export const CertificationSectionMobile: React.FC<CertificationSectionProps> = ({ className }) => {
  return (
    <MobileContainer className={className}>
      <MobileTitle>
        <i className="fas fa-certificate"></i>
        PLATAFORMA CERTIFICADA E REGULAMENTADA
      </MobileTitle>
      
      <MobileLogos>
        <MobileLogoItem>
          <img 
            src="/icons/pix-banco-central.svg" 
            alt="PIX Banco Central" 
          />
          <MobileLogoLabel>
            <span className="main-text">PIX OFICIAL</span>
            <span className="sub-text">Banco Central</span>
          </MobileLogoLabel>
        </MobileLogoItem>
        
        <MobileLogoItem>
          <img 
            src="/icons/loterias-caixa-logo.svg" 
            alt="Loterias Caixa" 
          />
          <MobileLogoLabel>
            <span className="main-text">PARCERIA OFICIAL</span>
            <span className="sub-text">Loterias CAIXA</span>
          </MobileLogoLabel>
        </MobileLogoItem>
        
        <MobileLogoItem>
          <MobileSSLIcon>
            <i className="fas fa-shield-alt"></i>
          </MobileSSLIcon>
          <MobileLogoLabel>
            <span className="main-text">SSL 256-BIT</span>
            <span className="sub-text">Criptografia</span>
          </MobileLogoLabel>
        </MobileLogoItem>
      </MobileLogos>
      
      <MobileDetails>
        <div className="detail-item">
          <span className="check-icon">✅</span>
          <span><strong>Autorizada pelo Banco Central</strong> • Processo SUSEP nº 15414.901574/2024-11</span>
        </div>
        <div className="detail-item">
          <span className="check-icon">✅</span>
          <span><strong>Parceria Oficial Loterias CAIXA</strong> • Modalidade Filantropia Premiável</span>
        </div>
        <div className="detail-item">
          <span className="check-icon">✅</span>
          <span><strong>Auditoria Independente</strong> • Certificação ISO 27001 e PCI DSS</span>
        </div>
      </MobileDetails>
      
      <MobileTrustBadge>
        <i className="fas fa-award"></i>
        Certificação Nível AAA+ de Segurança
      </MobileTrustBadge>
    </MobileContainer>
  );
};

// ===== COMPONENTE COMPACT DESKTOP =====
export const CertificationSectionCompactDesktop: React.FC<CertificationSectionProps> = ({ className }) => {
  return (
    <CompactDesktopContainer className={className}>
      <CompactDesktopTitle>
        <i className="fas fa-shield-check"></i>
        AMBIENTE CERTIFICADO E AUDITADO
      </CompactDesktopTitle>
      
      <CompactDesktopLogos>
        <CompactDesktopLogoItem>
          <img 
            src="/icons/pix-banco-central.svg" 
            alt="PIX Banco Central" 
          />
          <CompactDesktopLogoLabel>
            <span className="main-text">BACEN</span>
            <span className="sub-text">Autorizado</span>
          </CompactDesktopLogoLabel>
        </CompactDesktopLogoItem>
        
        <CompactDesktopLogoItem>
          <img 
            src="/icons/loterias-caixa-logo.svg" 
            alt="Loterias Caixa" 
          />
          <CompactDesktopLogoLabel>
            <span className="main-text">CAIXA</span>
            <span className="sub-text">Parceiro</span>
          </CompactDesktopLogoLabel>
        </CompactDesktopLogoItem>
        
        <CompactDesktopLogoItem>
          <CompactDesktopSSLIcon>
            <i className="fas fa-certificate"></i>
          </CompactDesktopSSLIcon>
          <CompactDesktopLogoLabel>
            <span className="main-text">SUSEP</span>
            <span className="sub-text">Regulado</span>
          </CompactDesktopLogoLabel>
        </CompactDesktopLogoItem>
      </CompactDesktopLogos>
    </CompactDesktopContainer>
  );
};

// ===== COMPONENTE COMPACT MOBILE =====
export const CertificationSectionCompactMobile: React.FC<CertificationSectionProps> = ({ className }) => {
  return (
    <CompactMobileContainer className={className}>
      <CompactMobileTitle>
        <i className="fas fa-shield-check"></i>
        AMBIENTE CERTIFICADO E AUDITADO
      </CompactMobileTitle>
      
      <CompactMobileLogos>
        <CompactMobileLogoItem>
          <img 
            src="/icons/pix-banco-central.svg" 
            alt="PIX Banco Central" 
          />
          <CompactMobileLogoLabel>
            <span className="main-text">BACEN</span>
            <span className="sub-text">Autorizado</span>
          </CompactMobileLogoLabel>
        </CompactMobileLogoItem>
        
        <CompactMobileLogoItem>
          <img 
            src="/icons/loterias-caixa-logo.svg" 
            alt="Loterias Caixa" 
          />
          <CompactMobileLogoLabel>
            <span className="main-text">CAIXA</span>
            <span className="sub-text">Parceiro</span>
          </CompactMobileLogoLabel>
        </CompactMobileLogoItem>
        
        <CompactMobileLogoItem>
          <CompactMobileSSLIcon>
            <i className="fas fa-certificate"></i>
          </CompactMobileSSLIcon>
          <CompactMobileLogoLabel>
            <span className="main-text">SUSEP</span>
            <span className="sub-text">Regulado</span>
          </CompactMobileLogoLabel>
        </CompactMobileLogoItem>
      </CompactMobileLogos>
    </CompactMobileContainer>
  );
};

// ===== COMPONENTE COMPACT UNIFICADO =====
export const CertificationSectionCompact: React.FC<CertificationSectionProps> = ({ className }) => {
  return (
    <>
      <CertificationSectionCompactDesktop className={className} />
      <CertificationSectionCompactMobile className={className} />
    </>
  );
};

// ===== COMPONENTE UNIFICADO =====
const CertificationSection: React.FC<CertificationSectionProps> = ({ className }) => {
  return (
    <>
      <CertificationSectionDesktop className={className} />
      <CertificationSectionMobile className={className} />
    </>
  );
};

export default CertificationSection; 