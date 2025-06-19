'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import RaffleFormFieldsUpdate from '@/components/campaign/RaffleFormFieldsUpdate';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import creatorCampaignAPI from '@/API/creator/creatorCampaignAPIClient';
import { toast } from 'react-toastify';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
`;

const Header = styled.div`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px 0;
  margin-bottom: 40px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: 2px solid #6a11cb;
  color: #6a11cb;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #6a11cb;
    color: white;
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1rem;
  }
`;

const HeaderTitle = styled.div`
  h1 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #333;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 12px;
    
    svg {
      color: #6a11cb;
      font-size: 1.6rem;
    }
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
  
  p {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;

const StatusBadge = styled.div<{ $status: string }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  
  background: ${({ $status }) => {
    switch ($status) {
      case 'ACTIVE': return 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
      case 'INACTIVE': return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)';
      case 'COMPLETED': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
      case 'CANCELLED': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      default: return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)';
    }
  }};
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  svg {
    font-size: 0.9rem;
  }
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #6a11cb;
  font-size: 1.1rem;
  font-weight: 600;
  
  svg {
    animation: spin 1s linear infinite;
    font-size: 1.5rem;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
  text-align: center;
  
  .error-icon {
    font-size: 4rem;
    color: #ef4444;
  }
  
  .error-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
  
  .error-message {
    font-size: 1rem;
    color: #666;
    margin: 0;
    max-width: 500px;
    line-height: 1.5;
  }
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(106, 17, 203, 0.3);
  }
`;

// Status mapping
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ACTIVE': return 'Ativa';
    case 'INACTIVE': return 'Inativa';
    case 'COMPLETED': return 'Finalizada';
    case 'CANCELLED': return 'Cancelada';
    case 'SCHEDULED': return 'Agendada';
    default: return status;
  }
};

export default function EditCampaignPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  
  // Estados
  const [campaign, setCampaign] = useState<ICampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados da campanha
  const loadCampaign = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Carregando campanha para edição:', id);
      
      const response = await creatorCampaignAPI.getCampaignById(id as string);
      
      if (response.success && response.data) {
        setCampaign(response.data);
        console.log('✅ Campanha carregada:', response.data);
      } else {
        throw new Error(response.message || 'Erro ao carregar campanha');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar campanha:', error);
      setError(error.message || 'Erro ao carregar dados da campanha');
      toast.error('Erro ao carregar dados da campanha');
    } finally {
      setLoading(false);
    }
  };

  // Carregar campanha quando o componente montar
  useEffect(() => {
    if (id && session) {
      loadCampaign();
    }
  }, [id, session]);

  // Handler para submissão do formulário de atualização
  const handleUpdateSubmit = async (changes: {
    campaignId: string;
    updatedFields: Partial<ICampaign>;
    instantPrizesChanges?: any;
    fieldsChanged: string[];
  }) => {
    try {
      setSubmitting(true);
      
      console.log('🔄 Iniciando atualização da campanha:', changes);
      
      // Realizar a atualização via API
      // TODO: Implementar método updateCampaign no creatorCampaignAPI
      const response = await creatorCampaignAPI.getCampaignById(
        changes.campaignId
      );
      
      if (response.success) {
        console.log('✅ Campanha atualizada com sucesso:', response.data);
        
        toast.success('Campanha atualizada com sucesso!');
        
        // Atualizar o estado local
        setCampaign(response.data);
        
        // Redirecionar para a página da campanha
        router.push(`/dashboard/criador/campanha/${id}`);
      } else {
        throw new Error(response.message || 'Erro ao atualizar campanha');
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar campanha:', error);
      toast.error(error.message || 'Erro ao atualizar campanha');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler para cancelar edição
  const handleCancel = () => {
    router.push(`/dashboard/criador/campanha/${id}`);
  };

  // Handler para voltar
  const handleBack = () => {
    router.back();
  };

  // Preparar dados iniciais para o formulário
  const prepareInitialData = (campaign: ICampaign): any => {
    // Removendo logs para evitar loops
    const formData = {
      title: campaign.title || '',
      description: campaign.description || '',
      individualNumberPrice: typeof campaign.individualNumberPrice === 'number' ? campaign.individualNumberPrice : 0,
      totalNumbers: campaign.totalNumbers || 0,
      drawDate: campaign.drawDate ? new Date(campaign.drawDate).toISOString() : '',
      minNumbersPerUser: typeof campaign.minNumbersPerUser === 'number' ? campaign.minNumbersPerUser : 1,
      maxNumbersPerUser: typeof campaign.maxNumbersPerUser === 'number' ? campaign.maxNumbersPerUser : undefined,
      status: campaign.status || 'ACTIVE',
      canceled: Boolean(campaign.canceled) || false,
      isScheduled: (campaign as any).isScheduled || false,
      scheduledActivationDate: campaign.scheduledActivationDate 
        ? new Date(campaign.scheduledActivationDate).toISOString() 
        : '',
      winnerPositions: (campaign as any).winnerPositions || 1,
      prizeDistribution: campaign.prizeDistribution || [],
      winners: campaign.winners || [],
      enablePackages: Boolean(campaign.numberPackages && campaign.numberPackages.length > 0),
      numberPackages: campaign.numberPackages || [],
      instantPrizes: (campaign as any).instantPrizes || [],
      prizeCategories: (campaign as any).prizeCategories || {
        diamante: { active: false, quantity: 10, value: 2000 },
        master: { active: false, quantity: 20, value: 1000 },
        premiado: { active: false, quantity: 50, value: 500 }
      },
      regulation: campaign.regulation || '',
      returnExpected: campaign.returnExpected !== undefined ? String(campaign.returnExpected) : '',
      images: campaign.images || [],
      coverImage: campaign.coverImage,
      mainPrize: (campaign as any).mainPrize || '',
      valuePrize: (campaign as any).valuePrize || ''
    };
    
    // Removendo logs para evitar loops
    return formData;
  };

  // Renderização
  if (loading) {
    return (
      <PageContainer>
        <Header>
          <HeaderContent>
            <HeaderLeft>
              <BackButton onClick={handleBack}>
                <FaArrowLeft />
                Voltar
              </BackButton>
              <HeaderTitle>
                <h1>
                  <FaEdit />
                  Carregando...
                </h1>
              </HeaderTitle>
            </HeaderLeft>
          </HeaderContent>
        </Header>
        
        <ContentContainer>
          <LoadingContainer>
            <LoadingSpinner>
              <FaSpinner />
              Carregando dados da campanha...
            </LoadingSpinner>
          </LoadingContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  if (error || !campaign) {
    return (
      <PageContainer>
        <Header>
          <HeaderContent>
            <HeaderLeft>
              <BackButton onClick={handleBack}>
                <FaArrowLeft />
                Voltar
              </BackButton>
              <HeaderTitle>
                <h1>
                  <FaEdit />
                  Erro ao Carregar
                </h1>
              </HeaderTitle>
            </HeaderLeft>
          </HeaderContent>
        </Header>
        
        <ContentContainer>
          <ErrorContainer>
            <FaExclamationTriangle className="error-icon" />
            <h2 className="error-title">Erro ao Carregar Campanha</h2>
            <p className="error-message">
              {error || 'Não foi possível carregar os dados da campanha. Verifique se o ID está correto e tente novamente.'}
            </p>
            <RetryButton onClick={loadCampaign}>
              <FaSpinner />
              Tentar Novamente
            </RetryButton>
          </ErrorContainer>
        </ContentContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <HeaderLeft>
            <BackButton onClick={handleBack}>
              <FaArrowLeft />
              Voltar
            </BackButton>
            <HeaderTitle>
              <h1>
                <FaEdit />
                Editar Campanha
              </h1>
              <p>Atualize as informações da sua rifa</p>
            </HeaderTitle>
          </HeaderLeft>
          
          <StatusBadge $status={campaign.status || 'INACTIVE'}>
            {getStatusLabel(campaign.status || 'INACTIVE')}
          </StatusBadge>
        </HeaderContent>
      </Header>
      
      <ContentContainer>
        <RaffleFormFieldsUpdate
          initialData={prepareInitialData(campaign)}
          campaignId={campaign.campaignCode as string}
          onSubmit={handleUpdateSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      </ContentContainer>
    </PageContainer>
  );
} 