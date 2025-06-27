'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Image from 'next/image';

// ============ CONTAINER PRINCIPAL ============
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  color: white;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,215,0,0.5), transparent);
  }
`;

// ============ SEÇÃO DE SEGURANÇA COMPACTA ============
const SecuritySection = styled.div`
  background: rgba(255,255,255,0.03);
  border-bottom: 1px solid rgba(255,215,0,0.15);
  padding: 0.75rem 0;
`;

const SecurityContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    justify-content: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
`;

const SecurityBadges = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
`;

const SecurityBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,215,0,0.2);
  border-radius: 16px;
  font-size: 0.7rem;
  font-weight: 600;
  transition: all 0.3s ease;
  white-space: nowrap;
  
  &:hover {
    background: rgba(255,215,0,0.1);
    border-color: rgba(255,215,0,0.4);
    transform: translateY(-1px);
  }
  
  .icon {
    font-size: 0.8rem;
    color: #FFD700;
  }
  
  @media (max-width: 768px) {
    padding: 0.3rem 0.6rem;
    font-size: 0.65rem;
    
    .icon {
      font-size: 0.75rem;
    }
  }
`;

const TrustLogos = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
  }
`;

const LogoItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
  
  .logo-image {
    filter: brightness(1.1);
    transition: all 0.3s ease;
  }
  
  .logo-text {
    font-size: 0.6rem;
    color: rgba(255,255,255,0.6);
    font-weight: 500;
    text-align: center;
    line-height: 1.1;
  }
  
  @media (max-width: 768px) {
    .logo-text {
      font-size: 0.55rem;
    }
  }
`;

// ============ CONTEÚDO PRINCIPAL HORIZONTAL ============
const MainContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  
  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

// Layout em 2 Colunas Organizado
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
`;

// ============ SEÇÃO DA MARCA COMPACTA ============
const BrandSection = styled.div`
  .brand-logo {
    font-size: 1.6rem;
    font-weight: 800;
    background: linear-gradient(45deg, #FFD700, #FFA500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.75rem;
  }
  
  .brand-description {
    color: rgba(255,255,255,0.75);
    line-height: 1.5;
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .security-indicators {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .security-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    color: rgba(255,255,255,0.65);
    font-size: 0.7rem;
    
    .security-icon {
      color: #4ade80;
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 768px) {
    .brand-logo {
      font-size: 1.4rem;
    }
    
    .brand-description {
      font-size: 0.75rem;
      margin-bottom: 0.75rem;
    }
    
    .security-indicators {
      align-items: center;
    }
  }
`;

// ============ CONTAINER DE LINKS ORGANIZADOS ============
const LinksContainer = styled.div`
  width: 100%;
`;

const LinksGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
  }
`;

// ============ SEÇÕES DE LINKS ESTILO APPLE ============
const LinkSection = styled.div`
  .section-title {
    color: #FFD700;
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .links-list {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  
  .footer-link {
    color: rgba(255,255,255,0.7);
  text-decoration: none;
    font-size: 0.75rem;
    font-weight: 400;
    transition: all 0.3s ease;
    padding: 0.2rem 0;
    
    &:hover {
      color: #FFD700;
      transform: translateX(2px);
    }
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 0.85rem;
      text-align: center;
      margin-bottom: 0.6rem;
    }
    
    .footer-link {
      text-align: center;
      font-size: 0.7rem;
      padding: 0.15rem 0;
  
  &:hover {
        transform: translateY(-1px);
      }
    }
  }
  
  @media (max-width: 480px) {
    .section-title {
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }
    
    .footer-link {
      font-size: 0.65rem;
      padding: 0.1rem 0;
    }
  }
`;

// ============ SEÇÃO DE CONTATO COMPACTA ============
const ContactSection = styled.div`
  .section-title {
    color: #FFD700;
    font-size: 0.9rem;
    font-weight: 700;
  margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .contact-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  
  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    
    .contact-icon {
      color: #FFD700;
      font-size: 0.8rem;
      width: 12px;
      text-align: center;
    }
    
    .contact-text {
      color: rgba(255,255,255,0.7);
      font-size: 0.7rem;
      line-height: 1.3;
    }
  }
  
  @media (max-width: 768px) {
    .section-title {
      font-size: 0.85rem;
      text-align: center;
      margin-bottom: 0.6rem;
    }
    
    .contact-list {
      gap: 0.4rem;
    }
    
    .contact-item {
      justify-content: center;
      
      .contact-text {
        font-size: 0.65rem;
      }
    }
  }
  
  @media (max-width: 480px) {
    .section-title {
      font-size: 0.8rem;
      margin-bottom: 0.5rem;
    }
    
    .contact-list {
      gap: 0.3rem;
    }
    
    .contact-item {
      .contact-text {
        font-size: 0.6rem;
      }
    }
  }
`;

// ============ BARRA INFERIOR ESTILO MICROSOFT ============
const BottomSection = styled.div`
  border-top: 1px solid rgba(255,215,0,0.15);
  background: rgba(0,0,0,0.2);
  padding: 1rem 0;
`;

const BottomContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    padding: 0 1rem;
  }
`;

const BottomLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    gap: 1.5rem;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
`;

const Copyright = styled.div`
  color: rgba(255,255,255,0.6);
  font-size: 0.7rem;
  font-weight: 400;
`;

const LegalLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  
  .legal-link {
    color: rgba(255,255,255,0.6);
    text-decoration: none;
    font-size: 0.7rem;
    transition: color 0.3s ease;
    
    &:hover {
      color: #FFD700;
    }
  }
  
  @media (max-width: 768px) {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const SocialSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  .social-label {
    color: rgba(255,255,255,0.6);
    font-size: 0.7rem;
    font-weight: 500;
  }
  
  .social-links {
    display: flex;
    gap: 0.5rem;
  }
  
  @media (max-width: 768px) {
    .social-label {
      display: none;
    }
  }
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,215,0,0.2);
  border-radius: 50%;
  color: rgba(255,255,255,0.7);
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    background: #FFD700;
    color: #1a1a2e;
    border-color: #FFD700;
    transform: translateY(-1px);
  }
  
  i {
    font-size: 0.8rem;
  }
`;

// ============ TEXTO LEGAL MINIMALISTA ============
const LegalText = styled.div`
  background: rgba(0,0,0,0.3);
  border-top: 1px solid rgba(255,215,0,0.1);
  padding: 0.6rem 2rem;
  
  p {
    max-width: 1400px;
    margin: 0 auto;
    color: rgba(255,255,255,0.45);
    font-size: 0.65rem;
    line-height: 1.4;
    text-align: center;
  }
  
  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    
    p {
      font-size: 0.6rem;
    }
  }
`;

// ============ COMPONENTE PRINCIPAL ============
const Footer: React.FC = () => {
  return (
    <FooterContainer>
      {/* SEÇÃO DE SEGURANÇA COMPACTA */}
      <SecuritySection>
        <SecurityContainer>
          <SecurityBadges>
            <SecurityBadge>
              <span className="icon">🛡️</span>
              <span>Ambiente Seguro</span>
            </SecurityBadge>
            
            <SecurityBadge>
              <span className="icon">🔒</span>
              <span>AES-256</span>
            </SecurityBadge>
            
            <SecurityBadge>
              <span className="icon">🔐</span>
              <span>SSL</span>
            </SecurityBadge>
            
            <SecurityBadge>
              <span className="icon">✅</span>
              <span>LGPD</span>
            </SecurityBadge>
          </SecurityBadges>
          
          <TrustLogos>
            <LogoItem>
              <Image 
                src="/icons/loterias-caixa-logo.svg" 
                alt="Loteria Federal" 
                width={40} 
                height={40}
                className="logo-image"
              />
              <div className="logo-text">Autorizado<br/>Loteria Federal</div>
            </LogoItem>
            
            <LogoItem>
              <Image 
                src="/icons/pix-banco-central.svg" 
                alt="PIX Banco Central" 
                width={40} 
                height={40}
                className="logo-image"
              />
              <div className="logo-text">Pagamento<br/>PIX Seguro</div>
            </LogoItem>
          </TrustLogos>
        </SecurityContainer>
      </SecuritySection>

      {/* CONTEÚDO PRINCIPAL HORIZONTAL */}
      <MainContent>
        <ContentGrid>
          {/* COLUNA ESQUERDA - MARCA */}
          <BrandSection>
            <div className="brand-logo">RifaApp</div>
            <p className="brand-description">
            Plataforma de rifas online com sorteios transparentes e prêmios incríveis.
              Auditados pela Loteria Federal.
            </p>
            
            <div className="security-indicators">
              <div className="security-item">
                <i className="fas fa-shield-alt security-icon"></i>
                <span>Proteção Bancária</span>
              </div>
              
              <div className="security-item">
                <i className="fas fa-certificate security-icon"></i>
                <span>Certificação Internacional</span>
              </div>
            </div>
          </BrandSection>
          
          {/* COLUNA DIREITA - LINKS ORGANIZADOS */}
          <LinksContainer>
            <LinksGrid>
              {/* NAVEGAÇÃO */}
              <LinkSection>
                <div className="section-title">Navegação</div>
                <div className="links-list">
                  <Link href="/" className="footer-link">Início</Link>
                  <Link href="/campanhas" className="footer-link">Campanhas</Link>
                  <Link href="/como-funciona" className="footer-link">Como Funciona</Link>
                  <Link href="/ganhadores" className="footer-link">Ganhadores</Link>
                  <Link href="/meus-numeros" className="footer-link">Meus Números</Link>
                </div>
              </LinkSection>
              
              {/* SUPORTE */}
              <LinkSection>
                <div className="section-title">Suporte</div>
                <div className="links-list">
                  <Link href="/faq" className="footer-link">FAQ</Link>
                  <Link href="/ajuda" className="footer-link">Central de Ajuda</Link>
                  <Link href="/tutorial" className="footer-link">Tutorial</Link>
                  <Link href="/status" className="footer-link">Status do Sistema</Link>
                </div>
              </LinkSection>
              
              {/* LEGAL */}
              <LinkSection>
                <div className="section-title">Legal</div>
                <div className="links-list">
                  <Link href="/termos-de-uso" className="footer-link">Termos de Uso</Link>
                  <Link href="/politica-de-privacidade" className="footer-link">Privacidade</Link>
                  <Link href="/politica-de-cookies" className="footer-link">Cookies</Link>
                  <Link href="/regulamento" className="footer-link">Regulamento</Link>
                </div>
              </LinkSection>
        
              {/* CONTATO */}
              <ContactSection>
                <div className="section-title">Contato</div>
                <div className="contact-list">
                  <div className="contact-item">
                    <i className="fas fa-envelope contact-icon"></i>
                    <div className="contact-text">contato@rifaapp.com.br</div>
                  </div>
                  
                  <div className="contact-item">
                    <i className="fab fa-whatsapp contact-icon"></i>
                    <div className="contact-text">(11) 95874-5236</div>
                  </div>
                  
                  <div className="contact-item">
                    <i className="fas fa-clock contact-icon"></i>
                    <div className="contact-text">Seg-Sex, 9h às 18h</div>
                  </div>
                </div>
              </ContactSection>
            </LinksGrid>
          </LinksContainer>
        </ContentGrid>
        
        {/* BARRA INFERIOR */}
        <BottomSection>
          <BottomContainer>
            <BottomLeft>
              <Copyright>
                © {new Date().getFullYear()} RifaApp. Todos os direitos reservados.
              </Copyright>
              
              <LegalLinks>
                <Link href="/termos" className="legal-link">Termos</Link>
                <Link href="/privacidade" className="legal-link">Privacidade</Link>
                <Link href="/cookies" className="legal-link">Cookies</Link>
              </LegalLinks>
            </BottomLeft>
        
            <SocialSection>
              <span className="social-label">Siga-nos:</span>
              <div className="social-links">
          <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </SocialLink>
          <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <i className="fab fa-facebook"></i>
          </SocialLink>
          <SocialLink href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </SocialLink>
          <SocialLink href="https://wa.me/5511958745236" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <i className="fab fa-whatsapp"></i>
          </SocialLink>
              </div>
            </SocialSection>
          </BottomContainer>
        </BottomSection>
      </MainContent>
      
      {/* TEXTO LEGAL MINIMALISTA */}
      <LegalText>
        <p>
        Título de Capitalização da Modalidade Filantropia Premiável de Contribuição Única. 
        É proibida a venda de título de capitalização a menores de dezesseis anos. 
        Antes de contratar consulte previamente as Condições Gerais. 
        Prêmios líquidos de imposto de renda. Imagens meramente ilustrativas.
        </p>
      </LegalText>
    </FooterContainer>
  );
};

export default Footer; 
