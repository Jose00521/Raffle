'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';

const SectionContainer = styled.section`
  padding: 5rem 2rem;
  background-color: ${({ theme }) => theme.colors.white};
`;

const SectionContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  margin-bottom: 4rem;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin: 0 auto;
`;

const StepsGrid = styled.div`
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

const StepCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background-color: ${({ theme }) => theme.colors.gray.light};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
  }
`;

const StepNumber = styled.div`
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 700;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  border-radius: 50%;
  margin-bottom: 1.5rem;
`;

const StepIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
`;

const StepTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const StepDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
`;

const CTAContainer = styled.div`
  text-align: center;
  margin-top: 4rem;
`;

const CTATitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1.5rem;
`;

const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.md};
  }
`;

const HowItWorks: React.FC = () => {
  return (
    <SectionContainer>
      <SectionContent>
        <SectionHeader>
          <SectionTitle>Como Funciona</SectionTitle>
          <SectionDescription>
            Participar das nossas rifas é muito simples e você pode ganhar prêmios incríveis em apenas 4 passos:
          </SectionDescription>
        </SectionHeader>
        
        <StepsGrid>
          <StepCard>
            <StepNumber>1</StepNumber>
            <StepIcon>
              <i className="fas fa-search"></i>
            </StepIcon>
            <StepTitle>Escolha uma Campanha</StepTitle>
            <StepDescription>
              Navegue pelas campanhas disponíveis e escolha aquela com o prêmio que mais lhe interessa.
            </StepDescription>
          </StepCard>
          
          <StepCard>
            <StepNumber>2</StepNumber>
            <StepIcon>
              <i className="fas fa-ticket-alt"></i>
            </StepIcon>
            <StepTitle>Selecione seus Números</StepTitle>
            <StepDescription>
              Escolha quantos números quiser para aumentar suas chances de ganhar. Quanto mais, melhor!
            </StepDescription>
          </StepCard>
          
          <StepCard>
            <StepNumber>3</StepNumber>
            <StepIcon>
              <i className="fas fa-credit-card"></i>
            </StepIcon>
            <StepTitle>Faça o Pagamento</StepTitle>
            <StepDescription>
              Realize o pagamento de forma rápida e segura utilizando Pix, cartão de crédito ou boleto.
            </StepDescription>
          </StepCard>
          
          <StepCard>
            <StepNumber>4</StepNumber>
            <StepIcon>
              <i className="fas fa-trophy"></i>
            </StepIcon>
            <StepTitle>Aguarde o Sorteio</StepTitle>
            <StepDescription>
              Fique atento à data do sorteio e torça para ser o grande ganhador do prêmio!
            </StepDescription>
          </StepCard>
        </StepsGrid>
        
        <CTAContainer>
          <CTATitle>Pronto para tentar a sorte?</CTATitle>
          <Link href="/campanhas" className="cta-button">
            Participar Agora
          </Link>
        </CTAContainer>
      </SectionContent>
    </SectionContainer>
  );
};

export default HowItWorks; 