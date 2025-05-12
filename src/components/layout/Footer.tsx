'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: 4rem 2rem 2rem;
`;

const FooterContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
  }
`;

const FooterColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.text.gold};
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.gold};
  }
`;

const FooterText = styled.p`
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: 0.75rem;
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const FooterBottom = styled.div`
  max-width: 1280px;
  margin: 3rem auto 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
`;

const FooterCopyright = styled.p`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const SocialLink = styled.a`
  color: ${({ theme }) => theme.colors.white};
  font-size: 1.5rem;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.gold};
  }
`;

const LegalText = styled.p`
  color: ${({ theme }) => theme.colors.gray.light};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin-top: 2rem;
  max-width: 1280px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
`;

// Adicionando estilos para links no footer
const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.2s ease;
  display: block;
  
  &:hover {
    color: ${({ theme }) => theme.colors.text.gold};
  }
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterColumn>
          <FooterTitle>RifaApp</FooterTitle>
          <FooterText>
            Plataforma de rifas online com sorteios transparentes e prêmios incríveis.
            Todos os sorteios são auditados e vinculados à Loteria Federal.
          </FooterText>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>Links Rápidos</FooterTitle>
          <StyledLink href="/">
            Início
          </StyledLink>
          <StyledLink href="/campanhas">
            Campanhas
          </StyledLink>
          <StyledLink href="/como-funciona">
            Como Funciona
          </StyledLink>
          <StyledLink href="/ganhadores">
            Ganhadores
          </StyledLink>
          <StyledLink href="/meus-numeros">
            Meus Números
          </StyledLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>Informações</FooterTitle>
          <StyledLink href="/termos-de-uso">
            Termos de Uso
          </StyledLink>
          <StyledLink href="/politica-de-privacidade">
            Política de Privacidade
          </StyledLink>
          <StyledLink href="/politica-de-cookies">
            Política de Cookies
          </StyledLink>
          <StyledLink href="/faq">
            Perguntas Frequentes
          </StyledLink>
        </FooterColumn>
        
        <FooterColumn>
          <FooterTitle>Contato</FooterTitle>
          <FooterText>
            <strong>Email:</strong> contato@rifaapp.com.br
          </FooterText>
          <FooterText>
            <strong>WhatsApp:</strong> (00) 00000-0000
          </FooterText>
          <FooterText>
            <strong>Horário:</strong> Seg-Sex, 9h às 18h
          </FooterText>
        </FooterColumn>
      </FooterContent>
      
      <FooterBottom>
        <FooterCopyright>
          © {new Date().getFullYear()} RifaApp - Todos os direitos reservados
        </FooterCopyright>
        
        <SocialLinks>
          <SocialLink href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="fab fa-instagram"></i>
          </SocialLink>
          <SocialLink href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <i className="fab fa-facebook"></i>
          </SocialLink>
          <SocialLink href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <i className="fab fa-youtube"></i>
          </SocialLink>
          <SocialLink href="https://wa.me/5500000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <i className="fab fa-whatsapp"></i>
          </SocialLink>
        </SocialLinks>
      </FooterBottom>
      
      <LegalText>
        Título de Capitalização da Modalidade Filantropia Premiável de Contribuição Única. 
        É proibida a venda de título de capitalização a menores de dezesseis anos. 
        Antes de contratar consulte previamente as Condições Gerais. 
        Prêmios líquidos de imposto de renda. Imagens meramente ilustrativas.
      </LegalText>
    </FooterContainer>
  );
};

export default Footer; 