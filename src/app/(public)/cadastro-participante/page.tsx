'use client';

import React from 'react';
import RegistrationForm from '../../../components/cadastro/RegistrationForm';
import styled from 'styled-components';
import Link from 'next/link';

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ee 100%);
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  width: 100%;
`;

const Logo = styled.div`
  font-size: 1.8rem;
  font-weight: 800;
  color: #6a11cb;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LogoIcon = styled.div`
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
`;

const BackLink = styled(Link)`
  color: #666;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(5px);
  
  &:hover {
    color: #6a11cb;
    background: rgba(255, 255, 255, 0.8);
  }
`;

const PageTitle = styled.h1`
  font-size: 2.2rem;
  color: #333;
  margin-bottom: 1.5rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1rem;
  }
`;

export default function CadastroParticipante() {
  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Logo>
            <LogoIcon>R</LogoIcon>
            Rifa.com
          </Logo>
          <BackLink href="/cadastro-tipo">
            ← Voltar
          </BackLink>
        </Header>
        
        <PageTitle>Cadastro de Participante</PageTitle>
        <RegistrationForm />
      </ContentWrapper>
    </PageContainer>
  );
} 