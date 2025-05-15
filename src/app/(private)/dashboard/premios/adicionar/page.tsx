'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import PrizeForm from '@/components/dashboard/PrizeForm';
import { IPrize } from '@/models/Prize';

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px;
  margin-left: -8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  }
`;

const PageTitle = styled.h1`
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0 0 0 16px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

export default function AddPrizePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (data: Partial<IPrize>) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, you would make an API call here
      // to create a new prize in your database
      console.log('Submitting prize data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to prizes page on success
      router.push('/dashboard/premios');
      
    } catch (error) {
      console.error('Error adding prize:', error);
      setIsSubmitting(false);
      // In a real app, you would show an error notification
    }
  };
  
  const handleCancel = () => {
    router.push('/dashboard/premios');
  };
  
  return (
    <ParticipantDashboard>
      <PageHeader>
        <BackButton onClick={handleCancel}>
          <FaArrowLeft />
        </BackButton>
        <PageTitle>
          <FaTrophy style={{ color: '#f59e0b' }} />
          Adicionar Novo Prêmio
        </PageTitle>
      </PageHeader>
      
      <PrizeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </ParticipantDashboard>
  );
} 