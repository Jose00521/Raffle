'use client';

import React from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { FaCalendarAlt, FaClock, FaHeart, FaHome, FaSearch, FaLock, FaGift, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IPrize } from '@/models/interfaces/IPrizeInterfaces';

// Animações
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Container Base
const StatusContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const StatusContent = styled.div`
  max-width: 600px;
  text-align: center;
  animation: ${fadeInUp} 0.8s ease-out;
  position: relative;
  z-index: 2;
`;

// Componente Scheduled (Agendada)
const ScheduledContainer = styled(StatusContainer)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const ScheduledIconContainer = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  
  svg {
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.9);
  }
`;

const ScheduledTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0 0 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ScheduledSubtitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const ScheduledDateTime = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin: 2rem 0;
  backdrop-filter: blur(20px);
  
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  p {
    font-size: 1.8rem;
    font-weight: 700;
    color: white;
    margin: 0;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;

// Componente Pending (Pendente)
const PendingContainer = styled(StatusContainer)`
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const PendingIconContainer = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s ease-in-out infinite;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  svg {
    font-size: 3rem;
    color: #e67e22;
  }
`;

const PendingTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #d35400;
  margin: 0 0 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PendingDescription = styled.p`
  font-size: 1.2rem;
  color: #e67e22;
  margin: 0 0 2rem;
  line-height: 1.6;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Componente Completed (Finalizada)
const CompletedContainer = styled(StatusContainer)`
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.2) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const CompletedIconContainer = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 2rem;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${float} 3s ease-in-out infinite;
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.4);
  
  svg {
    font-size: 3rem;
    color: #27ae60;
  }
`;

const CompletedTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0 0 1rem;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const WinnerInfo = styled.div`
  background: rgba(255, 255, 255, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 2rem;
  margin: 2rem 0;
  backdrop-filter: blur(20px);
  
  h3 {
    font-size: 1.3rem;
    font-weight: 700;
    color: #27ae60;
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  p {
    font-size: 1.1rem;
    color: #2c3e50;
    margin: 0;
    font-weight: 600;
  }
`;

// Componente Canceled (Cancelada)
const CanceledContainer = styled(StatusContainer)`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
`;

const CanceledIconContainer = styled.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 4px solid #f8d7da;
  box-shadow: 0 8px 25px rgba(220, 53, 69, 0.1);
  animation: ${pulse} 2s infinite;

  svg {
    font-size: 2.5rem;
    color: #dc3545;
  }
`;

const CanceledTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #343a40;
  margin: 0 0 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CanceledReason = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0 auto 2.5rem;
  max-width: 500px;
  line-height: 1.6;

  strong {
    color: #495057;
  }
`;

// Botões de Ação
const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

const ActionButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
  
  @media (max-width: 480px) {
    padding: 0.8rem 1.5rem;
    font-size: 0.9rem;
  }
`;

const PrimaryActionButton = styled(ActionButton)`
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  
  &:hover {
    background: white;
    transform: translateY(-2px) scale(1.05);
  }
`;

const ActionButtonSecondary = styled(ActionButton)`
  background: transparent;
  color: #495057;
  border: 2px solid #dee2e6;

  &:hover {
    background: #f8f9fa;
    border-color: #ced4da;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }
`;

// Card de Resumo da Campanha
const SummaryCard = styled.div`
  background: rgba(255,255,255,0.95);
  border-radius: 18px;
  box-shadow: 0 8px 32px rgba(80, 0, 120, 0.10);
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  margin: 2rem auto 2.5rem auto;
  max-width: 420px;
  text-align: left;
  position: relative;
  z-index: 3;
  animation: ${fadeInUp} 0.7s cubic-bezier(.4,1.4,.6,1) 0.1s both;
`;

const CoverImage = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 14px;
  margin-bottom: 1.2rem;
  box-shadow: 0 2px 16px rgba(80,0,120,0.08);
`;

const CampaignTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #4f378b;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.5px;
`;

const CampaignInfo = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 1.5rem;
  margin-bottom: 1.2rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.05rem;
  color: #6b21a8;
  font-weight: 600;
`;

const PrizeList = styled.div`
  margin-top: 1.2rem;
`;

const PrizeItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-bottom: 0.5rem;
`;

const PrizeImage = styled.img`
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #a78bfa;
  background: #f3e8ff;
`;

const PrizeName = styled.span`
  font-weight: 700;
  color: #7c3aed;
  font-size: 1.08rem;
`;

const PrizeValue = styled.span`
  color: #6366f1;
  font-weight: 600;
  font-size: 1rem;
`;

const CtaText = styled.div`
  margin-top: 1.5rem;
  font-size: 1.13rem;
  color: #4f378b;
  font-weight: 600;
  text-align: center;
`;

interface CampaignSummaryCardProps {
  campaign: ICampaign;
}

const CampaignSummaryCard: React.FC<CampaignSummaryCardProps> = ({ campaign }) => {
  if (!campaign) return null;
  const mainPrize = campaign.prizes?.[0];
  const otherPrizes = campaign.prizes?.slice(1, 3) || [];
  return (
    <SummaryCard>
      {campaign.coverImage && (
        <CoverImage src={typeof campaign.coverImage === 'string' ? campaign.coverImage : ''} alt={campaign.title} />
      )}
      <CampaignTitle>{campaign.title}</CampaignTitle>
      <CampaignInfo>
        <InfoItem>
          <FaGift /> {campaign.prizes?.length || 1} prêmio{campaign.prizes?.length === 1 ? '' : 's'}
        </InfoItem>
        <InfoItem>
          <FaCalendarAlt /> Sorteio: {new Date(campaign.drawDate).toLocaleDateString('pt-BR')}
        </InfoItem>
        <InfoItem>
          <FaHeart /> R$ {campaign.individualNumberPrice?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / número
        </InfoItem>
      </CampaignInfo>
      <PrizeList>
        {mainPrize && (
          <PrizeItem>
            <PrizeImage src={typeof mainPrize.image === 'string' ? mainPrize.image : ''} alt={mainPrize.name} />
            <PrizeName>{mainPrize.name}</PrizeName>
            <PrizeValue>{mainPrize.value}</PrizeValue>
          </PrizeItem>
        )}
        {otherPrizes.map((prize, idx) => (
          <PrizeItem key={idx}>
            <PrizeImage src={typeof prize.image === 'string' ? prize.image : ''} alt={prize.name} />
            <PrizeName>{prize.name}</PrizeName>
            <PrizeValue>{prize.value}</PrizeValue>
          </PrizeItem>
        ))}
      </PrizeList>
      <CtaText>
        Não perca! Volte e participe para concorrer a prêmios incríveis!
      </CtaText>
    </SummaryCard>
  );
};

// Componentes de Status
interface CampaignStatusPageProps {
  campaignTitle?: string;
  scheduledDate?: string;
  winnerNumber?: string;
  drawDate?: string;
}

export const ScheduledCampaignPage: React.FC<CampaignStatusPageProps & { campaign?: ICampaign }> = ({ 
  campaignTitle = "Esta Campanha", 
  scheduledDate, 
  campaign
}) => (
  <ScheduledContainer>
    <StatusContent>
      <ScheduledIconContainer>
        <FaCalendarAlt />
      </ScheduledIconContainer>
      <ScheduledTitle>Campanha Agendada</ScheduledTitle>
      <ScheduledSubtitle>
        {campaignTitle} ainda não foi publicada
      </ScheduledSubtitle>
      {campaign && <CampaignSummaryCard campaign={campaign} />}
      {scheduledDate && (
        <ScheduledDateTime>
          <h3>Será publicada em</h3>
          <p>{new Date(scheduledDate).toLocaleDateString('pt-BR')} às {new Date(scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
        </ScheduledDateTime>
      )}
      <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem', margin: '2rem 0', lineHeight: 1.6 }}>
        Esta campanha foi agendada pelo criador e ainda não está disponível para participação. 
        Volte na data indicada para participar!
      </p>
      <ActionButtons>
        <PrimaryActionButton href="/">
          <FaHome /> Voltar ao Início
        </PrimaryActionButton>
        <ActionButton href="/campanhas">
          <FaSearch /> Ver Outras Campanhas
        </ActionButton>
      </ActionButtons>
    </StatusContent>
  </ScheduledContainer>
);

export const PendingCampaignPage: React.FC<CampaignStatusPageProps & { campaign?: ICampaign }> = ({ 
  campaignTitle = "Esta Campanha", 
  campaign
}) => (
  <PendingContainer>
    <StatusContent>
      <PendingIconContainer>
        <FaClock />
      </PendingIconContainer>
      <PendingTitle>Campanha Pendente</PendingTitle>
      <PendingDescription>
        {campaignTitle} está sendo revisada pela nossa equipe e ainda não está disponível para participação.
      </PendingDescription>
      {campaign && <CampaignSummaryCard campaign={campaign} />}
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.3)', 
        borderRadius: '16px', 
        padding: '1.5rem', 
        margin: '2rem 0',
        border: '2px solid rgba(255, 255, 255, 0.4)',
        backdropFilter: 'blur(20px)'
      }}>
        <h3 style={{ 
          color: '#d35400', 
          margin: '0 0 1rem', 
          fontSize: '1.2rem',
          fontWeight: '700'
        }}>
          Em Breve Disponível
        </h3>
        <p style={{ 
          color: '#e67e22', 
          margin: 0, 
          fontSize: '1rem',
          lineHeight: 1.5
        }}>
          Nossa equipe está verificando todos os detalhes para garantir a melhor experiência. 
          Em breve esta campanha estará disponível!
        </p>
      </div>
      <ActionButtons>
        <PrimaryActionButton href="/">
          <FaHome /> Voltar ao Início
        </PrimaryActionButton>
        <ActionButton href="/campanhas">
          <FaGift /> Explorar Campanhas Ativas
        </ActionButton>
      </ActionButtons>
    </StatusContent>
  </PendingContainer>
);

export const CompletedCampaignPage: React.FC<CampaignStatusPageProps> = ({ 
  campaignTitle = "Esta Campanha",
  winnerNumber,
  drawDate
}) => (
  <CompletedContainer>
    <StatusContent>
      <CompletedIconContainer>
        <FaCheckCircle />
      </CompletedIconContainer>
      
      <CompletedTitle>Campanha Finalizada</CompletedTitle>
      
      <WinnerInfo>
        <h3>
          <FaGift /> Sorteio Realizado
        </h3>
        {winnerNumber && (
          <p>Número ganhador: <strong>{winnerNumber}</strong></p>
        )}
        {drawDate && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem', opacity: 0.8 }}>
            Sorteado em {new Date(drawDate).toLocaleDateString('pt-BR')}
          </p>
        )}
      </WinnerInfo>
      
      <p style={{ 
        color: '#2c3e50', 
        fontSize: '1.1rem', 
        margin: '2rem 0', 
        lineHeight: 1.6,
        fontWeight: '500'
      }}>
        {campaignTitle} já foi finalizada e o ganhador foi sorteado. 
        Obrigado a todos que participaram!
      </p>
      
      <ActionButtons>
        <PrimaryActionButton href="/">
          <FaHome /> Voltar ao Início
        </PrimaryActionButton>
        <ActionButton href="/campanhas">
          <FaHeart /> Participar de Outras Campanhas
        </ActionButton>
      </ActionButtons>
    </StatusContent>
  </CompletedContainer>
);

export const CanceledCampaignPage: React.FC<CampaignStatusPageProps & { campaign?: ICampaign }> = ({ 
  campaignTitle = "Esta Campanha", 
  campaign
}) => (
  <CanceledContainer>
    <StatusContent>
      <CanceledIconContainer>
        <FaTimesCircle />
      </CanceledIconContainer>
      
      <CanceledTitle>Campanha Cancelada</CanceledTitle>
      
      <CanceledReason>
        A campanha <strong>&quot;{campaignTitle}&quot;</strong> foi cancelada pelo organizador e não está mais disponível.
      </CanceledReason>
      
      {campaign && <CampaignSummaryCard campaign={campaign} />}
      
      <p style={{ 
        color: '#6c757d', 
        fontSize: '1.1rem', 
        margin: '2rem 0 2rem', 
        lineHeight: 1.6 
      }}>
        Não se preocupe! Temos várias outras campanhas incríveis esperando por você.
      </p>
      
      <ActionButtons>
        <PrimaryActionButton href="/campanhas">
          <FaSearch /> Encontrar Novas Campanhas
        </PrimaryActionButton>
        <ActionButtonSecondary href="/">
          <FaHome /> Voltar ao Início
        </ActionButtonSecondary>
      </ActionButtons>
    </StatusContent>
  </CanceledContainer>
); 