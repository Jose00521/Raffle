// API client para operações com rifas e números
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { ApiResponse, createErrorResponse } from '@/server/utils/errorHandler/api';

/**
 * Interface para estatísticas de números
 */
export interface RifaStats {
  totalNumbers: number;
  available: number;
  reserved: number;
  sold: number;
  percentComplete: number;
}

interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;      // Para money prizes
  number?: string;        // Para item prizes (número temporário)
  value: number;
  prizeId?: string;       // Para item prizes
  name?: string;          // Para item prizes
  image?: string;         // Para item prizes
}


interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

/**
 * Funções da API para interagir com rifas e seus números
 */
const participantCampaignAPI = {
    /**
   * Obtém todas as campanhas ativas
   */
    getCampanhasAtivas: async () => {
      try {
        const response = await fetch('/api/campanhas');
        const result = await response.json();
        
        console.log("API response:", result);
        
        return result;

      } catch (error) {
        return createErrorResponse('Erro ao conectar com o servidor:', 500);
      }
    },


    getCampaignByIdPublic: async (campaignId: string) => {
      try {
        const response = await fetch(`/api/participant/campanhas/${campaignId}`);
        const result = await response.json();
        return result;
      } catch (error) {
        return createErrorResponse('Erro ao conectar com o servidor:', 500);
      }
    },




  }

export default participantCampaignAPI; 