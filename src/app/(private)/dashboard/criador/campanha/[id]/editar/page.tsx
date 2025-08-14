'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import styled from 'styled-components';
import { FaArrowLeft, FaEdit, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import creatorCampaignAPI from '@/API/creator/creatorCampaignAPIClient';
import { toast } from 'react-toastify';
import RaffleFormFieldsUpdateOptimized from '@/components/campaign/RaffleFormFieldsUpdateOptimized';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import InstantPrize from '@/models/InstantPrize';

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 0;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  padding: 24px 20px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  position: relative;
  max-width: 1200px;
  margin: 0 auto 40px;
  
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
    padding: 20px;
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
  
  svg {
    color: #6366f1;
  }
`;

const HeaderSubtitle = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  svg {
    font-size: 12px;
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
  margin-left: auto;
  
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

export interface InstantPrizeCategory {
  id: string;
  name: string;
  prizes: typeof InstantPrize[];
  description: string;
  total: number;
  hasMore: boolean;
}

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

        console.log('############################### response.data.instantPrizes ###########################################', setInstantPrizesConfigFormFormat(response.data.instantPrizes.categories));

        setCampaign({...response.data, instantPrizes: setInstantPrizesConfigFormFormat(response.data.instantPrizes.categories)});
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

  const setInstantPrizesConfigFormFormat = (instantPrizes: InstantPrizeCategory[]) => {
    const prizeConfig = {};
    if(instantPrizes.length > 0){
      const diamante = instantPrizes.find(category => category.id === 'diamante');
      const master = instantPrizes.find(category => category.id === 'master');
      const premiado = instantPrizes.find(category => category.id === 'premiado');

      if(diamante){
        Object.assign(prizeConfig, {
          diamante: {
            active: true,
            quantity: diamante.total,
            value: null,
            individualPrizes: prizesFormatInstantPrizes(diamante.prizes)
          }
        });
      }else{
        Object.assign(prizeConfig, {
          diamante: {
            active: false,
            quantity: 0,
            value: null,
            individualPrizes: []
          }
        });
      }

      if(master){
        Object.assign(prizeConfig, {
          master: {
            active: true,
            quantity: master.total,
            value: null,
            individualPrizes: prizesFormatInstantPrizes(master.prizes)
          }
        });
      }else{
        Object.assign(prizeConfig, {
          master: {
            active: false,
            quantity: 0,
            value: null,
            individualPrizes: []
          }
        });
      }

      console.log('############################### premiado ###########################################', premiado);
      if(premiado){
        Object.assign(prizeConfig, {
          premiado: {
            active: true,
            quantity: premiado.total,
            value: null,
            individualPrizes: prizesFormatInstantPrizes(premiado.prizes)
          }
        });
      }else{
        Object.assign(prizeConfig, {
          premiado: {
            active: false,
            quantity: 0,
            value: null,
            individualPrizes: []
          }
        });
      }
    }

    console.log('############################### prizeConfig ###########################################', prizeConfig);

    return prizeConfig;
  }


  const prizesFormatInstantPrizes = (instantPrizes: any[]) => {
    // Verifica se há prêmios para agrupar
    if (!instantPrizes || instantPrizes.length === 0) {
      return [];
    }

    // Agrupa os prêmios em dinheiro por valor
    const moneyPrizes = instantPrizes
      .filter(prize => prize.type === 'money')
      .reduce((acc, prize) => {
        const value = prize.value;
        // Se já existe um grupo para este valor, incrementa a quantidade
        if (acc[value]) {
          acc[value].quantity += 1;
        } else {
          // Senão, cria um novo grupo
          acc[value] = {
            type: 'money',
            value: value,
            quantity: 1,
            items: [prize] // Mantém referência aos itens originais
          };
        }
        return acc;
      }, {});

    // Converte o objeto de grupos para um array
    const groupedMoneyPrizes = Object.values(moneyPrizes);

    // Mantém os prêmios físicos individuais
    const itemPrizes = instantPrizes
      .filter(prize => prize.type === 'item')
      .map(prize => ({
        type: 'item',
        quantity: 1,
        value: prize.value,
        prizeRef: prize.prizeRef,
        physicalPrize: prize.physicalPrize,
        items: [prize]
      }));

    // Combina os dois tipos de prêmios
    return [...itemPrizes,...groupedMoneyPrizes];
  }

  // Carregar campanha quando o componente montar
  useEffect(() => {

      loadCampaign();
 
  }, []);

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
      const response = await creatorCampaignAPI.updateCampaign(
        changes
      );
      
      if (response.success) {
        console.log('✅ Campanha atualizada com sucesso:', response.data);
        
        toast.success('Campanha atualizada com sucesso!');
        
        // Atualizar o estado local
        setCampaign(response.data as ICampaign);
        
        // Redirecionar para a página da campanha
        router.push(`/dashboard/criador/campanha/${id}`);
      } else {
        toast.info(response.message || 'Erro ao atualizar campanha');
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


  // Renderização
  if (loading) {
    return (
      <CreatorDashboard>
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <FaArrowLeft size={18} />
          </BackButton>
          
          <HeaderContent>
            <HeaderTitle>
              <FaEdit />
              Carregando...
            </HeaderTitle>
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
      </CreatorDashboard>
    );
  }

  if (error || !campaign) {
    return (
      <CreatorDashboard>  
      <PageContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <FaArrowLeft size={18} />
          </BackButton>
          
          <HeaderContent>
            <HeaderTitle>
              <FaEdit />
              Erro ao Carregar
            </HeaderTitle>
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
      </CreatorDashboard>
    );
  }

  return (
    <CreatorDashboard>
    <PageContainer>
      <Header>
        <BackButton onClick={handleBack}>
          <FaArrowLeft size={18} />
        </BackButton>
        
        <HeaderContent>
          <HeaderTitle>
            <FaEdit />
            Editar Campanha
          </HeaderTitle>
          <HeaderSubtitle>
            Atualize as informações da sua rifa
          </HeaderSubtitle>
        </HeaderContent>
        
        <StatusBadge $status={campaign.status || 'INACTIVE'}>
          {getStatusLabel(campaign.status || 'INACTIVE')}
        </StatusBadge>
      </Header>
      
      <ContentContainer>
        <RaffleFormFieldsUpdateOptimized
          initialData={campaign as any}
          campaignId={campaign.campaignCode as string}
          onSubmit={handleUpdateSubmit}
          onCancel={handleCancel}
          isSubmitting={submitting}
        />
      </ContentContainer>
    </PageContainer>
    </CreatorDashboard>
  );
} 