'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaCheckCircle } from 'react-icons/fa';

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
  max-width: 600px;
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

const SuccessIcon = styled.div`
  color: #10b981;
  font-size: 5rem;
  margin-bottom: 1.5rem;
  animation: scaleIn 0.5s ease-in-out;
  
  @keyframes scaleIn {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    60% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2.5rem;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ActionButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  font-weight: 600;
  padding: 0.9rem 2rem;
  border-radius: 50px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(106, 17, 203, 0.2);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(106, 17, 203, 0.3);
  }
`;

const HomeLink = styled.a`
  color: #666;
  text-decoration: none;
  display: inline-block;
  margin-top: 1.5rem;
  transition: all 0.2s ease;
  
  &:hover {
    color: #6a11cb;
  }
`;

const RegistrationSuccess = () => {
  const router = useRouter();
  
  // Redirecionar para a página inicial após 5 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
  return (
    <PageContainer>
      <ContentBox>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>
        
        <Title>Cadastro Realizado com Sucesso!</Title>
        <Subtitle>
          Parabéns! Seu cadastro foi realizado com sucesso. Você já pode acessar
          sua conta e aproveitar todos os recursos da plataforma.
        </Subtitle>
        
        <ActionButton href="/login">
          Acessar Minha Conta
        </ActionButton>
        
        <div>
          <HomeLink href="/">Voltar para a página inicial</HomeLink>
        </div>
      </ContentBox>
    </PageContainer>
  );
};

export default RegistrationSuccess; 