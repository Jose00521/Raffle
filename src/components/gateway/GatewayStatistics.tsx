'use client';

import React from 'react';
import styled from 'styled-components';
import { 
  FaChartLine, 
  FaArrowUp, 
  FaArrowDown, 
  FaCreditCard, 
  FaExchangeAlt,
  FaPercent,
  FaBell,
  FaCircle
} from 'react-icons/fa';
import { GatewayStatistics as GatewayStatsType, PaymentGatewayTemplateStatus } from '@/mocks/gatewayMocks';
import { formatCurrency, formatNumber, formatDate } from '@/utils/formatters';

interface GatewayStatisticsProps {
  statistics: GatewayStatsType;
}

const Container = styled.div`
  background-color: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Header = styled.div`
  padding: 1rem 1.25rem;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
`;

const Title = styled.h3`
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: #4f46e5;
  }
`;

const StatsGrid = styled.div`
  padding: 1.25rem;
`;

const StatItem = styled.div`
  padding-bottom: 0.875rem;
  margin-bottom: 0.875rem;
  border-bottom: 1px solid #f3f4f6;
  
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

const StatTitle = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
`;

const StatValue = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
`;

const TopGatewaysSection = styled.div`
  padding: 0 1.25rem;
  padding-bottom: 1.25rem;
`;

const TopGatewayTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.875rem;
`;

const TopGatewayItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #f3f4f6;
  }
`;

const GatewayIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 0.25rem;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex-shrink: 0;
`;

const GatewayInfo = styled.div`
  flex: 1;
`;

const GatewayName = styled.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a202c;
`;

const GatewayStats = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecentActivitySection = styled.div`
  padding: 1.25rem;
  background-color: #f8fafc;
  border-top: 1px solid #e2e8f0;
`;

const ActivityTitle = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #4b5563;
  margin-bottom: 0.875rem;
`;

const ActivityItem = styled.div`
  display: flex;
  gap: 0.625rem;
  padding: 0.5rem 0;
  
  &:not(:last-child) {
    border-bottom: 1px solid #e2e8f0;
  }
`;

const ActivityBullet = styled.div`
  width: 8px;
  height: 8px;
  background-color: #4f46e5;
  border-radius: 50%;
  margin-top: 0.375rem;
  flex-shrink: 0;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityText = styled.div`
  font-size: 0.75rem;
  color: #4b5563;
  
  span {
    font-weight: 600;
    color: #1a202c;
  }
`;

const ActivityTime = styled.div`
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 0.25rem;
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background-color: #f0f9ff;
  color: #0284c7;
  margin-right: 0.5rem;
`;

const GatewayStatistics: React.FC<GatewayStatisticsProps> = ({ statistics }) => {
  return (
    <Container>
      <Header>
        <Title>
          <FaChartLine />
          Estatísticas
        </Title>
      </Header>
      
      <StatsGrid>
        <StatItem>
          <StatHeader>
            <StatTitle>Total de Gateways</StatTitle>
            <CardIcon>
              <FaCreditCard />
            </CardIcon>
          </StatHeader>
          <StatValue>
            {statistics.totalGateways} 
            <span style={{ fontSize: '0.875rem', color: '#22c55e', marginLeft: '0.5rem' }}>
              {statistics.activeGateways} ativos
            </span>
          </StatValue>
        </StatItem>
        
        <StatItem>
          <StatHeader>
            <StatTitle>Volume de Transações</StatTitle>
            <CardIcon>
              <FaExchangeAlt />
            </CardIcon>
          </StatHeader>
          <StatValue>
            {formatCurrency(statistics.totalTransactionVolume)}
          </StatValue>
        </StatItem>
        
        <StatItem>
          <StatHeader>
            <StatTitle>Quantidade de Transações</StatTitle>
            <CardIcon>
              <FaChartLine />
            </CardIcon>
          </StatHeader>
          <StatValue>
            {formatNumber(statistics.totalTransactions)}
          </StatValue>
        </StatItem>
        
        <StatItem>
          <StatHeader>
            <StatTitle>Taxa Média de Sucesso</StatTitle>
            <CardIcon>
              <FaPercent />
            </CardIcon>
          </StatHeader>
          <StatValue>
            {statistics.averageSuccessRate.toFixed(1)}%
          </StatValue>
        </StatItem>
      </StatsGrid>
      
      <TopGatewaysSection>
        <TopGatewayTitle>Melhores Gateways</TopGatewayTitle>
        
        {statistics.topGateways.map((gateway) => (
          <TopGatewayItem key={gateway.templateCode}>
            <GatewayIcon>
              <FaCreditCard />
            </GatewayIcon>
            <GatewayInfo>
              <GatewayName>{gateway.name}</GatewayName>
              <GatewayStats>
                <span>{formatNumber(gateway.transactions)} transações</span>
                <FaCircle style={{ fontSize: '4px', opacity: 0.5 }} />
                <span>{formatCurrency(gateway.volume)}</span>
              </GatewayStats>
            </GatewayInfo>
          </TopGatewayItem>
        ))}
      </TopGatewaysSection>
      
      <RecentActivitySection>
        <ActivityTitle>Atividades Recentes</ActivityTitle>
        
        {statistics.recentActivity.map((activity) => (
          <ActivityItem key={activity.id}>
            <ActivityBullet />
            <ActivityContent>
              <ActivityText>
                <span>{activity.gatewayName}</span>: {activity.action}
              </ActivityText>
              <ActivityTime>
                {formatDate(activity.date, true)} - {activity.user}
              </ActivityTime>
            </ActivityContent>
          </ActivityItem>
        ))}
      </RecentActivitySection>
    </Container>
  );
};

export default GatewayStatistics; 