'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../../components/layout/Layout';
import CampanhaDetalhes from '@/components/campaign/CampanhaDetalhes';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { toast, ToastContainer } from 'react-toastify';
import creatorCampaignAPI from '@/API/creator/creatorCampaignAPIClient';
import { 
  ScheduledCampaignPage, 
  PendingCampaignPage, 
  CompletedCampaignPage, 
  CanceledCampaignPage 
} from '@/components/campaign/CampaignStatusPages';
import LoadingScreen from '@/components/common/LoadingScreen';
import CampanhaEmBreve from '@/components/campaign/CampanhaEmBreve';
import participantCampaignAPI from '@/API/participant/participantCampaignAPIClient';

// Dados de exemplo para a campanha

export default function CampanhaPage() {
  const params = useParams();
  const campanhaId = params?.id as string;
  const [campanha, setCampanha] = useState<ICampaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<React.ReactNode | null>(null);

  useEffect(() => {
    const fetchCampanha = async () => {
      try {
        setIsLoading(true);
      const response = await participantCampaignAPI.getCampaignByIdPublic(campanhaId);
        console.log("response campanha detalhes", response);
        
        if (response.success) {
          const campanhaData = response.data as ICampaign;
          setCampanha(campanhaData);
          
          // Determinar qual componente renderizar com base no status
          if (campanhaData.canceled) {
            setContent(
              <CanceledCampaignPage 
                campaignTitle={campanhaData.title}
                campaign={campanhaData}
              />
            );
          } else if (campanhaData.status === CampaignStatusEnum.SCHEDULED) {
            setContent(
              <CampanhaEmBreve campaign={campanhaData} />
            );
          } else if (campanhaData.status === CampaignStatusEnum.PENDING) {
            setContent(
              <PendingCampaignPage 
                campaignTitle={campanhaData.title}
                campaign={campanhaData}
              />
            );
          } else if (campanhaData.status === CampaignStatusEnum.COMPLETED) {
            setContent(
              <CompletedCampaignPage 
                campaignTitle={campanhaData.title}
                winnerNumber={campanhaData.winners?.[0]?.number}
                drawDate={campanhaData.drawDate.toISOString()}
              />
            );
          } else {
            // Status ACTIVE
            setContent(
              <Layout hideHeader={true}>
                <CampanhaDetalhes campanhaDetalhes={campanhaData} />
              </Layout>
            );
          }
        } else {
        toast.error(response.message || 'Erro ao carregar a campanha');
          setContent(
            <CanceledCampaignPage 
              campaignTitle="Esta Campanha"
            />
          );
        }
      } catch (error) {
        console.error('Erro ao buscar campanha:', error);
        toast.error('Erro ao carregar a campanha');
        setContent(
          <CanceledCampaignPage 
            campaignTitle="Esta Campanha"
          />
        );
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCampanha();
  }, [campanhaId]);
  
  // Loading state
  if (isLoading) {
  return (
      <LoadingScreen />
    );
  }

  // Renderizar o conteúdo determinado no useEffect
  return (
    <>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        content
      )}
      <ToastContainer />
    </>
  );
} 