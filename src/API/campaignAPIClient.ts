// API client para operações com rifas e números
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';

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
        console.error('Erro ao buscar campanhas ativas:', error);
        return [];
      }
    },

    /** 
     * Cria uma nova campanha com prêmios instantâneos
     */
    criarNovaCampanha: async (formData: FormData): Promise<ICampaign> => {
      const response = await fetch('/api/campanhas', {
        method: 'POST',
        body: formData,
      });
      return await response.json();
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