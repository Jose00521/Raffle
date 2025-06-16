'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { IPrize, IPrizeInitialData } from '@/models/interfaces/IPrizeInterfaces';
import creatorPrizeAPIClient from '@/API/creator/creatorPrizeAPIClient';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import PrizeUpdateForm from '@/components/dashboard/PrizeUpdateForm';

const Container = styled.div`
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
  
  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 0;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 120px;
    height: 2px;
    background: linear-gradient(to right, #6366f1, #818cf8);
  }
  
  @media (max-width: 768px) {
    padding: 20px 0;
    margin-bottom: 32px;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border: none;
  background-color: #f8fafc;
  color: #475569;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  
  &:hover {
    background-color: #f1f5f9;
    color: #4f46e5;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    width: 38px;
    height: 38px;
  }
`;

const HeaderContent = styled.div`
  margin-left: 18px;
`;

const HeaderTitle = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  letter-spacing: -0.01em;
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 0;
  color: #64748b;
`;

const LoadingSpinner = styled.div`
  margin-bottom: 16px;
  
  svg {
    animation: spin 1s linear infinite;
    color: #6366f1;
    filter: drop-shadow(0 4px 6px rgba(99, 102, 241, 0.1));
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function EditPrizePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  
  const [prize, setPrize] = useState<IPrizeInitialData | null>(null);
  const [originalPrize, setOriginalPrize] = useState<IPrize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPrize = async () => {
      try {
        const response = await creatorPrizeAPIClient.getPrizeById(id as string);

        console.log("response",response);
        if (response.success) {
          setPrize(response.data);
          setOriginalPrize(response.data);
        } else {
          setError(response.message || 'Erro ao carregar o prêmio');
        }
      } catch (err) {
        setError('Erro ao carregar o prêmio');
        console.error('Error loading prize:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPrize();
  }, [id]);
  
  const handleBack = () => {
    router.push('/dashboard/criador/premios');
  };
  
  const compareValues = (original: any, updated: any): boolean => {
    if (original === updated) return true;
    
    // Handle comparing arrays (like images)
    if (Array.isArray(original) && Array.isArray(updated)) {
      if (original.length !== updated.length) return false;
      
      // Simple string comparison for URLs
      if (typeof original[0] === 'string' && typeof updated[0] === 'string') {
        return original.every((val, idx) => val === updated[idx]);
      }
      
      // For File objects we consider them different since they're new uploads
      return false;
    }
    
    return false;
  };
  
  const detectChanges = (originalData: IPrize, updatedData: Partial<IPrize>): string[] => {
    const changedFields: string[] = [];
    
    // Compare each field to see if it's changed
    Object.keys(updatedData).forEach(key => {
      const typedKey = key as keyof IPrize;
      if (!compareValues(originalData[typedKey], updatedData[typedKey])) {
        changedFields.push(key);
      }
    });
    
    return changedFields;
  };
  
  const handleSubmit = async (updatedData: Partial<IPrize>) => {
    if (!originalPrize || !id) return;
    
    try {
      setIsSaving(true);
      
      // Detect which fields were actually changed
      const modifiedFields = detectChanges(originalPrize, updatedData);
      
      if (modifiedFields.length === 0) {
        toast.info('Nenhuma alteração detectada');
        router.push('/dashboard/criador/premios');
        return;
      }
      
      // Only send the modified fields
      const response = await creatorPrizeAPIClient.updatePrize(
        id as string, 
        updatedData, 
        modifiedFields
      );
      
      if (response.success) {
        toast.success('Prêmio atualizado com sucesso!');
        router.push('/dashboard/criador/premios');
      } else {
        toast.error(response.message || 'Erro ao atualizar o prêmio');
      }
    } catch (err) {
      console.error('Error updating prize:', err);
      toast.error('Erro ao atualizar o prêmio');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    router.push('/dashboard/criador/premios');
  };
  
  return (
    <CreatorDashboard>
      <Container>
        <Header>
          <BackButton onClick={handleBack}>
            <FaArrowLeft size={18} />
          </BackButton>
          
          <HeaderContent>
            <HeaderTitle>
              Editar Prêmio
            </HeaderTitle>
            <HeaderSubtitle>
              Atualize as informações do prêmio
            </HeaderSubtitle>
          </HeaderContent>
        </Header>
        
        {isLoading ? (
          <LoadingContainer>
            <LoadingSpinner>
              <FaSpinner size={36} />
            </LoadingSpinner>
            <div>Carregando dados do prêmio...</div>
          </LoadingContainer>
        ) : error ? (
          <div>{error}</div>
        ) : prize ? (
          <PrizeUpdateForm
            initialData={prize}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSaving}
          />
        ) : (
          <div>Prêmio não encontrado</div>
        )}
      </Container>
    </CreatorDashboard>
  );
} 