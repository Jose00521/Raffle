import React from 'react';
import { useCampaignStats, useCreatorStats, useParticipantStats } from '@/hooks/useStatsSocket';

interface RealTimeCampaignStatsProps {
  campaignId: string;
}

export function RealTimeCampaignStats({ campaignId }: RealTimeCampaignStatsProps) {
  const { data, loading, error } = useCampaignStats(campaignId);
  
  if (loading) return <div>Carregando estatísticas em tempo real...</div>;
  if (error) return <div>Erro ao carregar estatísticas: {error.message}</div>;
  if (!data) return <div>Nenhum dado disponível</div>;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Estatísticas da Campanha (Tempo Real)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Números Vendidos" value={data.soldNumbers} total={data.totalNumbers} />
        <StatCard title="Receita Total" value={`R$ ${data.totalRevenue.toFixed(2)}`} />
        <StatCard title="Participantes" value={data.uniqueParticipants} />
        <StatCard title="% Completo" value={`${data.percentComplete.toFixed(1)}%`} />
      </div>
      
      <h3 className="text-md font-medium mt-6 mb-2">Desempenho Diário</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Números Vendidos Hoje" value={data.periodNumbersSold} />
        <StatCard title="Receita Hoje" value={`R$ ${data.periodRevenue.toFixed(2)}`} />
        <StatCard title="Novos Participantes" value={data.periodNewParticipants} />
      </div>
    </div>
  );
}

interface RealTimeCreatorStatsProps {
  creatorId: string;
}

export function RealTimeCreatorStats({ creatorId }: RealTimeCreatorStatsProps) {
  const { data, loading, error } = useCreatorStats(creatorId);
  
  if (loading) return <div>Carregando estatísticas em tempo real...</div>;
  if (error) return <div>Erro ao carregar estatísticas: {error.message}</div>;
  if (!data) return <div>Nenhum dado disponível</div>;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Estatísticas do Criador (Tempo Real)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Campanhas Ativas" value={data.activeCampaigns} />
        <StatCard title="Receita Total" value={`R$ ${data.totalRevenue.toFixed(2)}`} />
        <StatCard title="Números Vendidos" value={data.totalNumbersSold} />
        <StatCard title="Participantes" value={data.totalParticipants} />
      </div>
      
      <h3 className="text-md font-medium mt-6 mb-2">Desempenho Diário</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Receita Hoje" value={`R$ ${data.periodRevenue.toFixed(2)}`} />
        <StatCard title="Números Vendidos Hoje" value={data.periodNumbersSold} />
        <StatCard title="Taxa de Conversão" value={`${data.conversionRate.toFixed(1)}%`} />
      </div>
    </div>
  );
}

interface RealTimeParticipantStatsProps {
  participantId: string;
}

export function RealTimeParticipantStats({ participantId }: RealTimeParticipantStatsProps) {
  const { data, loading, error } = useParticipantStats(participantId);
  
  if (loading) return <div>Carregando estatísticas em tempo real...</div>;
  if (error) return <div>Erro ao carregar estatísticas: {error.message}</div>;
  if (!data) return <div>Nenhum dado disponível</div>;
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4">Estatísticas do Participante (Tempo Real)</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Campanhas Ativas" value={data.activeCampaigns} />
        <StatCard title="Total Gasto" value={`R$ ${data.totalSpent.toFixed(2)}`} />
        <StatCard title="Números Adquiridos" value={data.totalNumbersOwned} />
      </div>
      
      <h3 className="text-md font-medium mt-6 mb-2">Atividade Recente</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Gasto Hoje" value={`R$ ${data.periodSpent.toFixed(2)}`} />
        <StatCard title="Números Comprados Hoje" value={data.periodNumbersPurchased} />
        <StatCard title="Sorteios Ganhos" value={data.rafflesWon} />
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  total?: number;
}

function StatCard({ title, value, total }: StatCardProps) {
  return (
    <div className="bg-gray-50 p-3 rounded">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <p className="text-xl font-bold">
        {value}
        {total ? <span className="text-xs text-gray-500 ml-1">/ {total}</span> : null}
      </p>
    </div>
  );
} 