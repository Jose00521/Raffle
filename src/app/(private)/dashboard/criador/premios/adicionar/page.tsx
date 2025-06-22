'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy } from 'react-icons/fa';
import PrizeForm from '@/components/dashboard/PrizeForm';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import mongoose from 'mongoose';
import { toast, ToastContainer } from 'react-toastify';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import { parseCurrencyToNumber } from '@/utils/formatNumber';

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
  
  const handleSubmit = async (data: Partial<{
    name: string;
    description: string;
    value: string;
    image: File | string;
    images: Array<File | string>;
    categoryId: string;
  }>) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, you would make an API call here
      // to create a new prize in your database
      const formData = new FormData();
      
      // Log dos dados para debug
      console.log("Dados a serem enviados:", data);
      console.log("Image:", data.image);
      console.log("Images array:", data.images);
      console.log("Images length:", data.images?.length || 0);
      
      formData.append('data', JSON.stringify({
        name: data.name,
        description: data.description,
        value: parseCurrencyToNumber(data.value as string),
        categoryId: data.categoryId,
      }));

      // Verificando se a imagem principal existe
      if (data.image) {
        formData.append('image', data.image);
      } else {
        toast.error('É necessário pelo menos uma imagem principal');
      }
      
      // Verificando e adicionando imagens adicionais
      if (data.images && data.images.length > 0) {
        // Usar um nome de campo diferente para cada imagem
        data.images.forEach((image, index) => {
          formData.append('images', image);
          console.log(`Adicionando imagem ${index} ao FormData`);
        });
      }

      // Log do FormData para verificar o que estamos enviando
      console.log("FormData entries:");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      const result = await creatorPrizeAPIClient.createPrize(formData);
      console.log('result', result);
      
      if (result.success) {
        toast.success('Prêmio criado com sucesso!');
        router.push('/dashboard/criador/premios');
      } else {
        toast.error(result.message);
      }
      
    } catch (error) {
      console.error('Error adding prize:', error);
      toast.error('Erro ao adicionar prêmio: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/dashboard/criador/premios');
  };
  
  return (
    <CreatorDashboard>
      <ToastContainer />
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
    </CreatorDashboard>
  );
} 