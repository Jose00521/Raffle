'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import CampaignGrid from '../campaign/CampaignGrid';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';

import { useSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';

const SectionContainer = styled.section`
  padding: 5rem 2rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SectionContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
`;

const SectionHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const SectionDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 700px;
  margin: 0 auto;
`;

const ViewAllLink = styled.div`
  text-align: center;
  margin-top: 3rem;
`;

const ViewAllButton = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 2px solid ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

interface FeaturedCampaignsProps {
  campaigns: ICampaign[];
}

const FeaturedCampaigns: React.FC<FeaturedCampaignsProps> = ({ campaigns }) => {
  // Only show up to 3 active campaigns in the featured section
  
  return (
    <SectionContainer>
      <SectionContent>
        <SectionHeader>
          <SectionTitle>Campanhas em Destaque</SectionTitle>
          <SectionDescription>
            Confira nossas campanhas mais populares do momento e não perca a oportunidade de concorrer a prêmios incríveis!
          </SectionDescription>
        </SectionHeader>
        
        <CampaignGrid campaigns={campaigns} emptyMessage="Não há campanhas em destaque no momento. Confira todas as campanhas disponíveis." />
        
        <ViewAllLink>
          <Link href="/campanhas" className="view-all-button">
            Ver Todas as Campanhas <i className="fas fa-arrow-right" style={{ marginLeft: '8px' }}></i>
          </Link>
        </ViewAllLink>
      </SectionContent>
    </SectionContainer>
  );
};

export default FeaturedCampaigns; 