'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy, FaSpinner, FaTrash } from 'react-icons/fa';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import PrizeForm from '@/components/dashboard/PrizeForm';
import { IPrize } from '@/models/Prize';

// Mock data for demonstration purposes
import { MOCK_PRIZES } from '../../premios/page';

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

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-left: auto;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #fee2e2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #fecaca;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const LoadingSpinner = styled.div`
  margin-bottom: 16px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ConfirmationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
`;

const ModalTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 16px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const ModalText = styled.p`
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 24px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ModalButton = styled.button<{ $variant?: 'danger' | 'secondary' }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant }) => 
    $variant === 'danger' 
      ? `
        background-color: #ef4444;
        color: white;
        border: none;
        
        &:hover {
          background-color: #dc2626;
        }
      `
      : `
        background-color: #f3f4f6;
        color: #374151;
        border: 1px solid #e5e7eb;
        
        &:hover {
          background-color: #e5e7eb;
        }
      `
  }
`;

interface EditPrizePageProps {
  params: {
    id: string;
  };
}

export default function EditPrizePage({ params }: EditPrizePageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [prize, setPrize] = useState<IPrize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch prize data
  useEffect(() => {
    const fetchPrize = async () => {
      try {
        setIsLoading(true);
        
        // In a real application, you would make an API call here
        // For demonstration, we'll use our mock data
        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
        
        const foundPrize = MOCK_PRIZES.find((p: IPrize) => p._id === id);
        
        if (foundPrize) {
          setPrize(foundPrize);
        } else {
          setError('Prêmio não encontrado');
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
  
  const handleSubmit = async (data: Partial<IPrize>) => {
    setIsSubmitting(true);
    
    try {
      // In a real application, you would make an API call here
      // to update the prize in your database
      console.log('Updating prize data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to prizes page on success
      router.push('/dashboard/premios');
      
    } catch (error) {
      console.error('Error updating prize:', error);
      setIsSubmitting(false);
      // In a real app, you would show an error notification
    }
  };
  
  const handleCancel = () => {
    router.push('/dashboard/premios');
  };
  
  const handleShowDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
  };
  
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      // In a real application, you would make an API call here
      // to delete the prize from your database
      console.log('Deleting prize:', id);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect back to prizes page on success
      router.push('/dashboard/premios');
      
    } catch (error) {
      console.error('Error deleting prize:', error);
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
      // In a real app, you would show an error notification
    }
  };
  
  return (
    <ParticipantDashboard>
      <PageHeader>
        <BackButton onClick={handleCancel}>
          <FaArrowLeft />
        </BackButton>
        <PageTitle>
          <FaTrophy style={{ color: '#f59e0b' }} />
          Editar Prêmio
        </PageTitle>
        
        {prize && (
          <ActionButtons>
            <DeleteButton 
              onClick={handleShowDeleteConfirmation}
              disabled={isSubmitting || isDeleting}
            >
              <FaTrash />
              Excluir
            </DeleteButton>
          </ActionButtons>
        )}
      </PageHeader>
      
      {isLoading ? (
        <LoadingContainer>
          <LoadingSpinner>
            <FaSpinner size={32} />
          </LoadingSpinner>
          <div>Carregando prêmio...</div>
        </LoadingContainer>
      ) : error ? (
        <div>{error}</div>
      ) : prize ? (
        <PrizeForm
          initialData={prize}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting || isDeleting}
        />
      ) : (
        <div>Prêmio não encontrado</div>
      )}
      
      {showDeleteConfirmation && (
        <ConfirmationModal>
          <ModalContent>
            <ModalTitle>Confirmar exclusão</ModalTitle>
            <ModalText>
              Tem certeza que deseja excluir o prêmio "{prize?.name}"? Esta ação não pode ser desfeita.
            </ModalText>
            <ModalButtons>
              <ModalButton 
                onClick={handleCancelDelete}
                disabled={isDeleting}
              >
                Cancelar
              </ModalButton>
              <ModalButton 
                $variant="danger"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Excluindo...' : 'Excluir Prêmio'}
              </ModalButton>
            </ModalButtons>
          </ModalContent>
        </ConfirmationModal>
      )}
    </ParticipantDashboard>
  );
} 