'use client';

import React, { useState, useEffect } from 'react';
import Layout from '../../../components/layout/Layout';
import styled from 'styled-components';
import CampaignGrid from '../../../components/campaign/CampaignGrid';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import participantCampaignAPI from '../../../API/participant/participantCampaignAPIClient';
import LoadingScreen from '@/components/common/LoadingScreen';

// Dados de exemplo para as campanhas

const PageContainer = styled.div`
  padding: 3rem 2rem;
  max-width: 1280px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const PageDescription = styled.p`
  font-size: 1.125rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 800px;
  margin: 0 auto;
`;

export default function CampanhasPage() {
  const [campanhas, setCampanhas] = useState<ICampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampanhas = async () => {
      try {
        const data = await participantCampaignAPI.getCampanhasAtivas();
        setCampanhas(Array.isArray(data) ? data : []);
      } catch (error) {
        setCampanhas([]);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCampanhas();
  }, []);

  return (
    <>
      {loading ? (
        <LoadingScreen 
          title="Carregando campanhas"
          subtitle="Buscando as melhores oportunidades para você"
        />
      ) : (
        <Layout>
          <PageContainer>
            <PageHeader>
              <PageTitle>Campanhas Disponíveis</PageTitle>
              <PageDescription>
                Escolha uma de nossas campanhas e concorra a prêmios incríveis. Quanto mais números você adquirir, maiores são suas chances de ganhar!
              </PageDescription>
            </PageHeader>
            <CampaignGrid campaigns={campanhas} />
          </PageContainer>
        </Layout>
      )}
    </>
  );
} 