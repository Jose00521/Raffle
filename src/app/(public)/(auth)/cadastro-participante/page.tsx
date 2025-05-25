'use client';

import React, { useEffect } from 'react';
import SteppedRegistrationForm from '../../../../components/cadastro/SteppedRegistrationForm';
import styled from 'styled-components';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

const PageContainer = styled.div`
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fc 0%, #dee6f3 100%);
  background-image: 
    linear-gradient(135deg, #f8f9fc 0%, #dee6f3 100%),
    url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%236a11cb' fill-opacity='0.03' fill-rule='evenodd'/%3E%3C/svg%3E");
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1000px;
  height: 100%;
  max-height: 95vh;
  max-height: calc(var(--vh, 1vh) * 90);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 1rem;
  position: relative;
  
  @media (max-width: 768px) {
    max-height: 100vh;
    max-height: calc(var(--vh, 1vh) * 100);
    padding: 0 0.5rem;
  }
  
  @media (max-width: 480px) {
    padding: 0;
  }
`;

const BackLinkContainer = styled.div`
  position: absolute;
  top: 1.25rem;
  left: 1.25rem;
  z-index: 50;
  border-radius: 50px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(106, 17, 203, 0.2);
  }
  
  @media (max-width: 768px) {
    top: 1rem;
    left: 1rem;
  }
  
  @media (max-width: 480px) {
    top: 0.75rem;
    left: 0.75rem;
  }
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: linear-gradient(135deg, #6a11cb 0%, #8e44ad 100%);
  color: white;
  padding: 0.7rem 1.2rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(106, 17, 203, 0.3);
  
  svg {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    background: linear-gradient(135deg, #7c21db 0%, #9d53bd 100%);
    color: white;
    
    svg {
      transform: translateX(-3px);
    }
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
    
    svg {
      font-size: 1rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 0.5rem 0.9rem;
    font-size: 0.85rem;
    gap: 0.4rem;
    
    svg {
      font-size: 0.95rem;
    }
  }
`;

const FormWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  max-height: calc(var(--vh, 1vh) * 90);
  width: 100%;
  
  @media (max-width: 768px) {
    max-height: 100vh;
    max-height: calc(var(--vh, 1vh) * 100);
  }

  @media (max-width: 480px) {
    max-height: 100vh;
    margin:0 !important;
  }
`;

export default function CadastroParticipante() {
  // useEffect(() => {
  //   // Viewport height fix for mobile browsers
  //   const setVH = () => {
  //     const vh = window.innerHeight * 0.01;
  //     document.documentElement.style.setProperty('--vh', `${vh}px`);
  //   };

  //   setVH();
  //   window.addEventListener('resize', setVH);
    
  //   return () => {
  //     window.removeEventListener('resize', setVH);
  //   };
  // }, []);
  
  return (

    <PageContainer>
      <ContentWrapper>
        <BackLinkContainer>
          <BackLink href="/cadastro-tipo">
            <FaArrowLeft /> Voltar
          </BackLink>
        </BackLinkContainer>
        
        <FormWrapper>
          <SteppedRegistrationForm />
        </FormWrapper>
      </ContentWrapper>
    </PageContainer>

  );
} 