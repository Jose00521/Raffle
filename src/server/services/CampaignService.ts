import { CampaignRepository } from '@/server/repositories/CampaignRepository';
import { NumberStatusEnum } from '@/models/NumberStatus';

export class CampaignService {
  /**
   * Obtém todas as campanhas ativas com suas estatísticas
   */
  static async listarCampanhasAtivas() {
    try {
      const campanhas = await CampaignRepository.buscarCampanhasAtivas();
      
      // Para cada campanha, processar estatísticas
      // const campanhasComStats = await Promise.all(
      //   campanhas.map(async (campanha) => {
      //     const stats = await this.obterEstatisticasCampanha(campanha._id!.toString());

         
          
      //     return {
      //       ...campanha,
      //       stats
      //     };
      //   })
      // );
      
      return {
        success: true,
        data: campanhas
      };
    } catch (error) {
      console.error('Erro ao listar campanhas ativas:', error);
      return {
        success: false,
        error: 'Falha ao carregar as campanhas ativas'
      };
    }
  }

  /**
   * Obtém detalhes completos de uma campanha por ID
   */
  static async obterDetalhesCampanha(id: string) {
    try {
      const campanha = await CampaignRepository.buscarCampanhaPorId(id);
      
      if (!campanha) {
        return {
          success: false,
          error: 'Campanha não encontrada',
          statusCode: 404
        };
      }
      
      // Obter estatísticas
      const stats = await this.obterEstatisticasCampanha(id);
      
      // Obter últimos números vendidos
      const recentSales = await CampaignRepository.buscarUltimosNumerosVendidos(id);
      
      // Construir resposta completa
      const campanhaCompleta = {
        ...campanha,
        stats,
        recentSales
      };
      
      return {
        success: true,
        data: campanhaCompleta
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da campanha:', error);
      return {
        success: false,
        error: 'Falha ao carregar os detalhes da campanha'
      };
    }
  }

  /**
   * Método privado para calcular estatísticas de uma campanha
   */
  private static async obterEstatisticasCampanha(rifaId: string) {
    const statusCountArray = await CampaignRepository.contarNumeroPorStatus(rifaId);
    
    // Inicializar estatísticas
    const stats = {
      totalNumbers: 0,
      available: 0,
      reserved: 0,
      sold: 0,
      percentComplete: 0
    };
    
    // Processar contagens por status
    statusCountArray.forEach(item => {
      if (item.status === NumberStatusEnum.AVAILABLE) {
        stats.available = item.count;
      } else if (item.status === NumberStatusEnum.RESERVED) {
        stats.reserved = item.count;
      } else if (item.status === NumberStatusEnum.PAID) {
        stats.sold = item.count;
      }
    });
    
    // Calcular totais
    stats.totalNumbers = stats.available + stats.reserved + stats.sold;
    stats.percentComplete = stats.totalNumbers > 0 
      ? Math.round((stats.sold / stats.totalNumbers) * 100) 
      : 0;
    
    return stats;
  }
} 