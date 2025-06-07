import React, { useEffect, useState } from 'react';

interface CampaignStatusDisplayProps {
  campaignId: string;
  initialStatus: string;
}

/**
 * Componente simples para exibir o status da campanha com atualizações em tempo real
 */
export function CampaignStatusDisplay({ campaignId, initialStatus }: CampaignStatusDisplayProps) {
  const [status, setStatus] = useState(initialStatus);
  
  // Escutar eventos globais de atualização de campanha
  useEffect(() => {
    const handleCampaignUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ campaignId: string; status: string }>;
      const { detail } = customEvent;
      
      // Atualizar apenas se for a campanha correta
      if (detail.campaignId === campaignId) {
        console.log(`Atualizando status da campanha ${campaignId} para ${detail.status}`);
        setStatus(detail.status);
      }
    };
    
    // Registrar para o evento personalizado que emitimos no hook
    window.addEventListener('campaign:updated', handleCampaignUpdated as EventListener);
    
    return () => {
      window.removeEventListener('campaign:updated', handleCampaignUpdated as EventListener);
    };
  }, [campaignId]);
  
  // Mapear status para cores e textos
  const getStatusDetails = () => {
    switch (status) {
      case 'ACTIVE':
        return { color: 'bg-green-500', text: 'ATIVA' };
      case 'SCHEDULED':
        return { color: 'bg-amber-500', text: 'AGENDADA' };
      case 'DRAFT':
        return { color: 'bg-gray-500', text: 'RASCUNHO' };
      case 'COMPLETED':
        return { color: 'bg-blue-500', text: 'FINALIZADA' };
      case 'CANCELED':
        return { color: 'bg-red-500', text: 'CANCELADA' };
      default:
        return { color: 'bg-gray-500', text: status };
    }
  };
  
  const { color, text } = getStatusDetails();
  
  return (
    <span 
      className={`${color} text-white px-2 py-1 rounded-full text-xs font-semibold transition-all duration-300`}
      data-campaign-id={campaignId}
      data-status={status}
    >
      {text}
    </span>
  );
} 