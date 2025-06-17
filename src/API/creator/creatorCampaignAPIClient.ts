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

/**
 * Funções da API para interagir com rifas e seus números
 */
const creatorCampaignAPI = {
    getCampaignById: async (campaignId: string) => {
        try {
          const response = await fetch(`/api/creator/campanhas/${campaignId}`);
          const result = await response.json();
          return result;
        } catch {
          return createErrorResponse('Erro ao conectar com o servidor:', 500);
        }
      },

          /** 
     * Cria uma nova campanha com prêmios instantâneos
     */
    createCampaign: async (formData: FormData): Promise<ApiResponse<ICampaign> | ApiResponse<null>> => {
        try {
          const response = await fetch('/api/creator/campanhas', {
            method: 'POST',
            body: formData,
          });
          return await response.json();
        } catch {
          return createErrorResponse('Erro ao conectar com o servidor:', 500);
        }
      },
  
  
      toggleCampaignStatus: async (campaignId: string): Promise<ApiResponse<ICampaign> | ApiResponse<null>> => {
        try {
          const response = await fetch(`/api/creator/campanhas/${campaignId}/toggle-status`, {
            method: 'POST',
          });
          return await response.json();
        } catch {
          return createErrorResponse('Erro ao conectar com o servidor:', 500);
        }
      },

          /**
     * Exclui uma campanha pelo ID
     * @param campaignId ID da campanha a ser excluída
     * @returns ApiResponse com o resultado da operação
     */
    deleteCampaign: async (campaignId: string): Promise<ApiResponse<null>> => {
        try {
          const response = await fetch(`/api/creator/campanhas/${campaignId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          return await response.json();
        } catch (error) {
          console.error('Erro ao excluir campanha:', error);
          return createErrorResponse('Erro ao conectar com o servidor', 500);
        }
      },
}

export default creatorCampaignAPI;