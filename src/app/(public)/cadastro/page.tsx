'use client';

import React from 'react';
import Layout from '@/components/layout/Layout';
import RegistrationForm from '@/components/cadastro/RegistrationForm';
import styled from 'styled-components';

const RegistrationPage = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 2rem;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 1.5rem;
  }
`;

export default function Cadastro() {
  return (
    <Layout>
      <RegistrationPage>
        <PageTitle>Cadastre-se</PageTitle>
        <RegistrationForm />
      </RegistrationPage>
    </Layout>
  );
} 