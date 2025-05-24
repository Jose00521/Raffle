'use client';

import React from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';

// Container principal com 100vh
const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ee 100%);
  padding: 1rem;
`;

const ContentBox = styled.div`
  max-width: 900px;
  width: 90%;
  background: white;
  border-radius: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
  padding: 3rem;
  text-align: center;
  
  @media (max-width: 768px) {
    width: 95%;
    padding: 2rem 1.5rem;
  }
`;

const Logo = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #6a11cb;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  box-shadow: 0 4px 10px rgba(106, 17, 203, 0.2);
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const ButtonsContainer = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const OptionButton = styled.div`
  flex: 1;
  max-width: 320px;
  height: 280px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(106, 17, 203, 0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 30px rgba(106, 17, 203, 0.2);
    border-color: #6a11cb;
  }
  
  @media (max-width: 768px) {
    max-width: 100%;
    height: 200px;
    padding: 1.5rem;
  }
`;

const ButtonIcon = styled.div<{ $type: 'participant' | 'creator' }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$type === 'participant' 
    ? 'linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%)' 
    : 'linear-gradient(135deg, #ff8f00 0%, #e53935 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const ButtonTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #333;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ButtonDescription = styled.p`
  font-size: 0.95rem;
  color: #666;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const BackLink = styled.a`
  color: #666;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #6a11cb;
  }
`;

const RegisterTypePage = () => {
  const router = useRouter();
  
  const handleParticipantClick = () => {
    router.push('/cadastro-participante');
  };
  
  const handleCreatorClick = () => {
    router.push('/cadastro-criador');
  };

  return (
    <PageContainer>
      <ContentBox>
        <Logo>
          <LogoIcon>R</LogoIcon>
          Rifa.com
        </Logo>
        
        <Title>Como deseja se cadastrar?</Title>
        <Subtitle>
          Escolha como você deseja participar da nossa plataforma. Você pode se cadastrar
          como participante para comprar números ou como criador para criar suas próprias campanhas.
        </Subtitle>
        
        <ButtonsContainer>
          <OptionButton onClick={handleParticipantClick}>
            <ButtonIcon $type="participant">👤</ButtonIcon>
            <ButtonTitle>Participante</ButtonTitle>
            <ButtonDescription>
              Participe de sorteios, compre bilhetes e concorra a prêmios
            </ButtonDescription>
          </OptionButton>
          
          <OptionButton onClick={handleCreatorClick}>
            <ButtonIcon $type="creator">✨</ButtonIcon>
            <ButtonTitle>Criador</ButtonTitle>
            <ButtonDescription>
              Crie suas próprias campanhas e sorteios para seus projetos
            </ButtonDescription>
          </OptionButton>
        </ButtonsContainer>
        
        <BackLink href="/">
          ← Voltar para a página inicial
        </BackLink>
      </ContentBox>
    </PageContainer>
  );
};

export default RegisterTypePage; 