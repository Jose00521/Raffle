'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';
import SteppedCreatorForm from '@/components/cadastro-criador/SteppedCreatorForm';

const PageContainer = styled.div`
  height: 100vh;
  height: calc(var(--vh, 1vh) * 100);
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fc 0%, #dee6f3 100%);
  background-image: 
    linear-gradient(135deg, rgba(248, 249, 252, 0.97) 0%, rgba(222, 230, 243, 0.97) 100%),
    url("/images/background-pattern.svg");
  background-size: cover;
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
  max-width: 1100px;
  height: 100%;
  max-height: 90vh;
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
    margin: 0 !important;
  }
`;

const BrandOverlay = styled.div`
  position: absolute;
  bottom: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(106, 17, 203, 0.3);
  font-size: 0.9rem;
  font-weight: 600;
  pointer-events: none;

  @media (max-width: 768px) {
    bottom: 1rem;
    right: 1rem;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    bottom: 0.75rem;
    right: 0.75rem;
    font-size: 0.75rem;
  }
`;

export default function CadastroCriador() {
  useEffect(() => {
    // Viewport height fix for mobile browsers
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    
    return () => {
      window.removeEventListener('resize', setVH);
    };
  }, []);
  
  return (

      <PageContainer>
        <ContentWrapper>
          <BackLinkContainer>
            <BackLink href="/cadastro-tipo">
              <FaArrowLeft /> Voltar
            </BackLink>
          </BackLinkContainer>
          
          <FormWrapper>
            <SteppedCreatorForm />
          </FormWrapper>
        </ContentWrapper>
        <BrandOverlay>
          Rifa.com © {new Date().getFullYear()}
        </BrandOverlay>
      </PageContainer>

  );
} 