import React from 'react';
import styled from 'styled-components';
import CampaignCard from './CampaignCard';
import { IRifa } from '../../models/Rifa';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: 3rem;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
  grid-column: 1 / -1;
`;

const EmptyTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const EmptyText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.gray.medium};
  margin-bottom: 1.5rem;
`;

interface CampaignGridProps {
  campaigns: IRifa[];
  emptyMessage?: string;
}

const CampaignGrid: React.FC<CampaignGridProps> = ({ 
  campaigns, 
  emptyMessage = "Nenhuma campanha encontrada no momento. Por favor, volte mais tarde."
}) => {
  if (campaigns.length === 0) {
    return (
      <Grid>
        <EmptyMessage>
          <EmptyIcon>
            <i className="fas fa-ticket-alt"></i>
          </EmptyIcon>
          <EmptyTitle>Nenhuma campanha disponível</EmptyTitle>
          <EmptyText>{emptyMessage}</EmptyText>
        </EmptyMessage>
      </Grid>
    );
  }

  return (
    <Grid>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign._id} campaign={campaign} />
      ))}
    </Grid>
  );
};

export default CampaignGrid; 