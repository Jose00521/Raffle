'use client';

import React, { useState , useEffect} from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../../components/layout/Layout';
import CampanhaDetalhes from '@/components/campaign/CampanhaDetalhes';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import campaignAPIClient from '@/API/campaignAPIClient';
import { toast, ToastContainer } from 'react-toastify';

// Dados de exemplo para a campanha

export default function CampanhaPage() {
  const params = useParams();
  const campanhaId = params.id as string;
  const [campanha, setCampanha] = useState<ICampaign | null>(null);

  useEffect(() => {
    const fetchCampanha = async () => {
      const response = await campaignAPIClient.getCampaignById(campanhaId);
      console.log("response campanha detalhes",response);
      if(response.success){
        setCampanha(response.data as ICampaign);
      }else{
        toast.error(response.message || 'Erro ao carregar a campanha');
      }
    };
    fetchCampanha();
  }, [campanhaId]);
  
  // Em uma aplicação real, aqui você buscaria os dados da campanha pelo ID
  // Esta é uma simulação com dados de exemplo
  
  return (
    <Layout hideHeader={true}>
      <ToastContainer />
      {
        campanha?(
          <CampanhaDetalhes campanhaDetalhes={campanha as ICampaign} />
        ):(
          <div>Carregando...</div>
        )
      }
    </Layout>
  );
} 