import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';

const StyledCard = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
`;

const CardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 1rem;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
`;

const ProgressContainer = styled.div`
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div`
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => `${$progress}%`};
  background-color: #4CAF50;
  border-radius: 4px;
`;

const ProgressText = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #777;
`;

const PriceContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const Price = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #222;
`;

interface RifaCardProps {
  rifa: ICampaign;
}

const RifaCard: React.FC<RifaCardProps> = ({ rifa }) => {
  // Calculate progress
  const soldCount = rifa.totalNumbers - (rifa.stats?.available || 0);
  const progressPercentage = (soldCount / rifa.totalNumbers) * 100;
  
  return (
    <StyledCard>
      <ImageContainer>
        <img
          src={rifa.prizes[0].image}
          alt={rifa.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </ImageContainer>
      <CardContent>
        <Title>{rifa.title}</Title>
        <Description>{rifa.description}</Description>
        
        <ProgressContainer>
          <ProgressBar>
            <ProgressFill $progress={progressPercentage} />
          </ProgressBar>
          <ProgressText>
            <span>Vendidos: {soldCount}/{rifa.totalNumbers}</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </ProgressText>
        </ProgressContainer>
        
        <PriceContainer>
          <Price>R$ {rifa.price.toFixed(2)}</Price>
          <Link href={`/rifa/${rifa._id}`} className="card-button">
            Comprar
          </Link>
        </PriceContainer>
      </CardContent>
    </StyledCard>
  );
};

export default RifaCard; 