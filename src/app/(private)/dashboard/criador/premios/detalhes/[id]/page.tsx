'use client';

import React, { useState, useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { FaArrowLeft, FaTrophy, FaSpinner, FaEdit, FaTrash } from 'react-icons/fa';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import { IPrize } from '@/models/interfaces/IPrizeInterfces';

// Mock data for demonstration purposes
import { MOCK_PRIZES } from '../../page';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';

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

const Button = styled.button<{ $variant?: 'primary' | 'danger' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${({ $variant }) => 
    $variant === 'danger' 
      ? `
        background-color: #fee2e2;
        color: #ef4444;
        border: 1px solid #fecaca;
        
        &:hover {
          background-color: #fecaca;
        }
      `
      : `
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        border: none;
        box-shadow: 0 4px 6px rgba(106, 17, 203, 0.1);
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 10px rgba(106, 17, 203, 0.2);
        }
      `
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

const DetailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const ImageSection = styled.div`
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const MainImage = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (min-width: 768px) {
    height: 400px;
  }
`;

const AdditionalImages = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
`;

const ThumbnailImage = styled.div<{ $selected?: boolean }>`
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  border: 2px solid ${props => props.$selected ? '#6a11cb' : 'transparent'};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    opacity: 0.9;
  }
`;

const InfoSection = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

const PrizeName = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

const PrizeValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 24px;
  color: #6a11cb;
  display: inline-block;
  padding: 6px 16px;
  background-color: rgba(106, 17, 203, 0.1);
  border-radius: 50px;
`;

const PrizeDescription = styled.div`
  font-size: 1rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoLabel = styled.div`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
`;

interface DetailPageProps {
  params: {
    id: string;
  };
}

export default function PrizeDetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const { id } = useParams();
  
  const [prize, setPrize] = useState<IPrize | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
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
          setSelectedImage(foundPrize.image);
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
  
  const handleBack = () => {
    router.push('/dashboard/criador/premios');
  };
  
  const handleEdit = () => {
    router.push(`/dashboard/criador/premios/${id}`);
  };
  
  const handleDelete = () => {
    // In a real app, you would navigate to the edit page and open the delete confirmation
    // or implement the delete functionality directly here
    router.push(`/dashboard/criador/premios/${id}`);
  };
  
  const handleSelectImage = (image: string) => {
    setSelectedImage(image);
  };
  
  // Create a list of all images (main + additional)
  const allImages = prize ? [prize.image, ...(prize.images || [])] : [];
  
  return (
    <CreatorDashboard>
      <PageHeader>
        <BackButton onClick={handleBack}>
          <FaArrowLeft />
        </BackButton>
        <PageTitle>
          <FaTrophy style={{ color: '#f59e0b' }} />
          Detalhes do Prêmio
        </PageTitle>
        
        {prize && (
          <ActionButtons>
            <Button onClick={handleEdit}>
              <FaEdit />
              Editar
            </Button>
            <Button $variant="danger" onClick={handleDelete}>
              <FaTrash />
              Excluir
            </Button>
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
        <DetailContainer>
          <ImageSection>
            <MainImage>
              <img src={selectedImage || prize.image} alt={prize.name} />
            </MainImage>
            
            {allImages.length > 1 && (
              <AdditionalImages>
                {allImages.map((image, index) => (
                  <ThumbnailImage 
                    key={index}
                    $selected={image === selectedImage}
                    onClick={() => handleSelectImage(image)}
                  >
                    <img src={image} alt={`${prize.name} - imagem ${index + 1}`} />
                  </ThumbnailImage>
                ))}
              </AdditionalImages>
            )}
          </ImageSection>
          
          <InfoSection>
            <PrizeName>{prize.name}</PrizeName>
            <PrizeValue>{prize.value}</PrizeValue>
            
            {prize.description && (
              <PrizeDescription>
                {prize.description}
              </PrizeDescription>
            )}
            
            <InfoItem>
              <InfoLabel>ID do Prêmio</InfoLabel>
              <InfoValue>{prize._id}</InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Data de Cadastro</InfoLabel>
              <InfoValue>
                {prize.createdAt ? new Date(prize.createdAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : ''}
              </InfoValue>
            </InfoItem>
            
            <InfoItem>
              <InfoLabel>Última Atualização</InfoLabel>
              <InfoValue>
                {prize.updatedAt ? new Date(prize.updatedAt).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                }) : ''}
              </InfoValue>
            </InfoItem>
          </InfoSection>
        </DetailContainer>
      ) : (
        <div>Prêmio não encontrado</div>
      )}
    </CreatorDashboard>
  );
} 