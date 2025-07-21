// src/app/admin/setup/[token]/page.tsx
'use client';

import adminAPIClient from '@/API/admin/adminAPIClient';
import SteppedAdminForm from '@/components/cadastro-admin/SteppedAdminForm';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import styled from 'styled-components';


const PageContainer = styled.div`

  width: 100%;
  min-height: 100vh;
  height: 100%;
  display: flex;
  justify-content: center;
  background: linear-gradient(135deg,rgb(236, 236, 236) 0%,rgb(255, 255, 255) 100%);
  background-size: cover;
  padding: 0;
  position: fixed;

`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 1100px;

  display: flex;
  flex-direction: column;
  position: relative;
`;


const FormWrapper = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;

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


export default function AdminSetupPage() {
  const { token } = useParams();
  const router = useRouter();
  const [isValidToken, setIsValidToken] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await adminAPIClient.validateInvite(token as string);
      if (!response.success) {
        router.push('/404');
        return;
      }
      setIsValidToken(true);
      setLoading(false);
    } catch (error) {
      router.push('/404');
    }
  };

  if (loading) return <div>Verificando acesso...</div>;
  if (!isValidToken) return null;

  return (
    <PageContainer>
    <ContentWrapper>
      
      <FormWrapper>
        <SteppedAdminForm token={token as string} />
      </FormWrapper>
    </ContentWrapper>
    <BrandOverlay>
      Rifa.com © {new Date().getFullYear()}
    </BrandOverlay>
  </PageContainer>
  );
}