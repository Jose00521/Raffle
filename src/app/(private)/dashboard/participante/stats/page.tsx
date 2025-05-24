'use client';

import React, { useEffect, useState } from 'react';
import { RealTimeCampaignStats, RealTimeCreatorStats, RealTimeParticipantStats } from '@/components/dashboard/RealTimeStats';
import { useSession } from 'next-auth/react';

export default function StatsDashboardPage() {
  const { data: session } = useSession();
  const [campaignId, setCampaignId] = useState<string>('');
  const userId = session?.user?.id || '';
  
  useEffect(() => {
    // Exemplo: Buscar a primeira campanha do usuário para exemplo
    if (userId) {
      fetch(`/api/users/${userId}/campaigns?limit=1`)
        .then(res => res.json())
        .then(data => {
          if (data.campaigns && data.campaigns.length > 0) {
            setCampaignId(data.campaigns[0]._id);
          }
        })
        .catch(err => console.error('Erro ao buscar campanhas:', err));
    }
  }, [userId]);
  
  if (!userId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Estatísticas em Tempo Real</h1>
        <div className="bg-yellow-100 p-4 rounded">
          Faça login para visualizar suas estatísticas em tempo real.
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Estatísticas em Tempo Real</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Estatísticas do Criador - apenas visível para o próprio criador */}
        <div>
          <h2 className="text-xl font-semibold mb-3">Suas Estatísticas como Criador</h2>
          <RealTimeCreatorStats creatorId={userId} />
        </div>
        
        {/* Estatísticas do Participante - apenas visível para o próprio participante */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">Suas Estatísticas como Participante</h2>
          <RealTimeParticipantStats participantId={userId} />
        </div>
        
        {/* Estatísticas da Campanha - visível para qualquer usuário */}
        {campaignId && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Estatísticas da Campanha em Destaque</h2>
            <p className="text-sm text-gray-500 mb-3">ID da Campanha: {campaignId}</p>
            <RealTimeCampaignStats campaignId={campaignId} />
          </div>
        )}
      </div>
    </div>
  );
} 