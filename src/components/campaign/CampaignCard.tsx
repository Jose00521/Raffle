'use client';

import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { formatCurrency } from '@/utils/formatters';

const Card = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 100%;
  
  &:hover {
    transform: translateY(-6px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 240px;
  overflow: hidden;
`;

const CardBadge = styled.div<{ $status: CampaignStatusEnum }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  text-transform: uppercase;
  z-index: 2;
  
  ${({ $status, theme }) => {
    if ($status === CampaignStatusEnum.ACTIVE) {
      return `
        background-color: ${theme.colors.success};
        color: white;
      `;
    } else if ($status === CampaignStatusEnum.COMPLETED) {
      return `
        background-color: ${theme.colors.gray.dark};
        color: white;
      `;
    } else {
      return `
        background-color: ${theme.colors.warning};
        color: white;
      `;
    }
  }}
`;

const CardCode = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.4rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  z-index: 2;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  flex-grow: 1;
`;

const CardCategory = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
`;

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: ${({ theme }) => theme.colors.text.primary};
  line-height: 1.3;
`;

const CardDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  flex-grow: 1;
`;

const ProgressContainer = styled.div`
  margin-bottom: 1.5rem;
`;

const ProgressBar = styled.div`
  height: 10px;
  background-color: ${({ theme }) => theme.colors.gray.light};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  overflow: hidden;
  margin-bottom: 0.75rem;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background-color: ${({ theme }) => theme.colors.primary};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  transition: width 0.5s ease;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ProgressPercentage = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
`;

const CardPrice = styled.div`
  display: flex;
  flex-direction: column;
`;

const PriceLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const Price = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Icon = styled.i`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const DateText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.text.secondary};
`;

interface CampaignCardProps {
  campaign: ICampaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  // Use default values for stats if not provided
  const soldCount = campaign.stats?.sold || 0;
  const progressPercentage = campaign.stats?.percentComplete || 0;
  
  // Determine campaign status
  const today = new Date();
  const drawDate = new Date(campaign.drawDate);
  const daysUntilDraw = Math.ceil((drawDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  
  // Format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  
  // Campaign code (for display)
  const campaignCode = campaign.campaignCode;
  
  return (
    <Card>
      <CardImageContainer>
        <CardBadge $status={campaign.status}>
          {campaign.status === CampaignStatusEnum.ACTIVE && 'Ativo'}
          {campaign.status === CampaignStatusEnum.COMPLETED && 'Concluído'}
          {campaign.status === CampaignStatusEnum.PENDING && 'Finalizando'}
        </CardBadge>
        <CardCode>{campaignCode}</CardCode>
        <img
          src={campaign.coverImage}
          alt={campaign.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </CardImageContainer>
      
      <CardContent>
        <CardCategory>
          {campaign.individualNumberPrice <= 10 ? 'Econômica' : campaign.individualNumberPrice <= 30 ? 'Premium' : 'Especial'}
        </CardCategory>
        <CardTitle>{campaign.title}</CardTitle>
        
        <DateInfo>
          <Icon className="fas fa-calendar-alt" />
          <DateText>Sorteio: {formatDate(drawDate)}</DateText>
        </DateInfo>
        
        <CardDescription>{campaign.description}</CardDescription>
        
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill $progress={progressPercentage} />
          </ProgressBar>
          <ProgressStats>
            <ProgressText>
              Vendidos: {soldCount}/{campaign.totalNumbers}
            </ProgressText>
            <ProgressPercentage>{progressPercentage.toFixed(0)}%</ProgressPercentage>
          </ProgressStats>
        </ProgressContainer>
        
        <CardFooter>
          <CardPrice>
            <PriceLabel>Valor por número</PriceLabel>
            <Price>{formatCurrency(campaign.individualNumberPrice)}</Price>
          </CardPrice>
          
          <Link href={`/campanhas/${campaign.campaignCode}`} className="card-button">
            Ver Campanha
          </Link>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default CampaignCard; 