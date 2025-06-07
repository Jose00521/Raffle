'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import { FaTicketAlt, FaCalendarAlt, FaTrophy, FaChartLine } from 'react-icons/fa';
import { useSocket } from '@/context/SocketContext';

// Mobile-first grid layout
const PageContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.08);
  }
  
  @media (min-width: 768px) {
    padding: 18px;
    border-radius: 12px;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  
  @media (min-width: 768px) {
    margin-bottom: 16px;
  }
`;

const CardTitle = styled.h3`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 0.85rem;
  }
`;

const CardIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: ${props => props.$color || '#6a11cb'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  
  @media (min-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1rem;
    border-radius: 10px;
  }
`;

const CardValue = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  
  @media (min-width: 768px) {
    font-size: 1.5rem;
  }
`;

const CardTrend = styled.div<{ $positive?: boolean }>`
  display: flex;
  align-items: center;
  margin-top: 8px;
  font-size: 0.75rem;
  font-weight: 500;
  color: ${props => props.$positive ? '#10b981' : '#ef4444'};
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
    margin-top: 10px;
  }
`;

const Section = styled.section`
  margin-top: 24px;
  
  @media (min-width: 768px) {
    margin-top: 30px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  @media (min-width: 768px) {
    margin-bottom: 15px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors?.text?.primary || '#333'};
  margin: 0;
  
  @media (min-width: 768px) {
    font-size: 1.15rem;
  }
`;

const SectionLink = styled.a`
  color: ${({ theme }) => theme.colors?.primary || '#6a11cb'};
  font-size: 0.75rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 6px;
  margin: -6px;
  
  &:hover {
    text-decoration: underline;
  }
  
  @media (min-width: 768px) {
    font-size: 0.8rem;
  }
`;

const RecentList = styled.div`
  background: white;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  
  @media (min-width: 768px) {
    padding: 18px;
    border-radius: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 30px 16px;
  color: ${({ theme }) => theme.colors?.text?.secondary || '#666'};
  font-size: 0.85rem;
  
  @media (min-width: 768px) {
    padding: 35px 20px;
    font-size: 0.9rem;
  }
`;

export default function DashboardHome() {
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  const { notifications } = useSocket();
  
  // Check if this is the first visit in the session
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (hasSeenWelcome) {
      setShowWelcome(false);
    } else {
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);
  
  const handleAnimationComplete = () => {
    setShowWelcome(false);
  };
  
  return (
    <ParticipantDashboard>
      
      <PageContent>
        <StatCard>
          <CardHeader>
            <CardTitle>Total de Rifas</CardTitle>
            <CardIcon $color="#6a11cb">
              <FaTicketAlt />
            </CardIcon>
          </CardHeader>
          <CardValue>12</CardValue>
          <CardTrend $positive={true}>
            +3 desde o mês passado
          </CardTrend>
        </StatCard>
        
        <StatCard>
          <CardHeader>
            <CardTitle>Rifas Ativas</CardTitle>
            <CardIcon $color="#0ea5e9">
              <FaCalendarAlt />
            </CardIcon>
          </CardHeader>
          <CardValue>8</CardValue>
          <CardTrend $positive={true}>
            +2 desde o mês passado
          </CardTrend>
        </StatCard>
        
        <StatCard>
          <CardHeader>
            <CardTitle>Prêmios Ganhos</CardTitle>
            <CardIcon $color="#10b981">
              <FaTrophy />
            </CardIcon>
          </CardHeader>
          <CardValue>2</CardValue>
          <CardTrend $positive={true}>
            +1 desde o mês passado
          </CardTrend>
        </StatCard>
        
        <StatCard>
          <CardHeader>
            <CardTitle>Valor Investido</CardTitle>
            <CardIcon $color="#f59e0b">
              <FaChartLine />
            </CardIcon>
          </CardHeader>
          <CardValue>R$ 650</CardValue>
          <CardTrend $positive={false}>
            -R$ 50 desde o mês passado
          </CardTrend>
        </StatCard>
      </PageContent>
      
      <Section>
        <SectionHeader>
          <SectionTitle>Rifas Recentes</SectionTitle>
          <SectionLink href="/dashboard/rifas">
            Ver todas
          </SectionLink>
        </SectionHeader>
        
        <RecentList>
          {/* Aqui poderia ser um componente de lista de rifas recentes */}
          <EmptyState>
            Nenhuma rifa recente para mostrar. Explore as rifas disponíveis!
          </EmptyState>
        </RecentList>
      </Section>
      
      <Section>
        <SectionHeader>
          <SectionTitle>Próximos Sorteios</SectionTitle>
          <SectionLink href="/dashboard/rifas">
            Ver todos
          </SectionLink>
        </SectionHeader>
        
        <RecentList>
          {/* Aqui poderia ser um componente de lista de próximos sorteios */}
          <EmptyState>
            Nenhum sorteio programado para breve.
          </EmptyState>
        </RecentList>
      </Section>
    </ParticipantDashboard>
  );
} 