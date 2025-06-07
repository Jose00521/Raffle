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
const rifaAPI = {
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

    getCampaignById: async (campaignId: string) => {
      try {
        const response = await fetch(`/api/campanha/${campaignId}`);
        const result = await response.json();
        return result;
      } catch (error) {
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
        const response = await fetch(`/api/campanha/${campaignId}`, {
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

    /** 
     * Cria uma nova campanha com prêmios instantâneos
     */
    criarNovaCampanha: async (formData: FormData): Promise<ApiResponse<ICampaign> | ApiResponse<null>> => {
      try {
        const response = await fetch('/api/campanhas', {
          method: 'POST',
          body: formData,
        });
        return await response.json();
      } catch (error) {
        return createErrorResponse('Erro ao conectar com o servidor:', 500);
      }
    },


    toggleCampaignStatus: async (campaignId: string): Promise<ApiResponse<ICampaign> | ApiResponse<null>> => {
      try {
        const response = await fetch(`/api/campanha/${campaignId}/toggle-status`, {
          method: 'POST',
        });
        return await response.json();
      } catch (error) {
        return createErrorResponse('Erro ao conectar com o servidor:', 500);
      }
    },


  /**
   * Obtém estatísticas dos números de uma rifa
   */
  getRifaStats: async (rifaId: string): Promise<RifaStats> => {
    try {
      const response = await fetch(`/api/rifas/${rifaId}/stats`);
      
      if (!response.ok) {
        throw new Error('Falha ao buscar estatísticas');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar estatísticas da rifa:', error);
      // Retornar dados padrão em caso de erro
      return {
        totalNumbers: 0,
        available: 0,
        reserved: 0,
        sold: 0,
        percentComplete: 0
      };
    }
  },
  
  /**
   * Reserva automaticamente números para um usuário
   */
  autoReserveNumbers: async (rifaId: string, quantity: number, userId: string): Promise<{
    success: boolean;
    reservedNumbers: number[];
    message?: string;
  }> => {
    try {
      const response = await fetch(`/api/rifas/${rifaId}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity, userId }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao reservar números:', error);
      return {
        success: false,
        reservedNumbers: [],
        message: 'Erro de conexão com o servidor'
      };
    }
  },
  
  /**
   * Confirma pagamento dos números reservados
   */
  confirmPayment: async (rifaId: string, userId: string): Promise<{
    success: boolean;
    paidCount: number;
    paidNumbers: number[];
  }> => {
    try {
      const response = await fetch(`/api/rifas/${rifaId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      return {
        success: false,
        paidCount: 0,
        paidNumbers: []
      };
    }
  }
};

export default rifaAPI; 