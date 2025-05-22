import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { injectable, inject } from 'tsyringe';
import * as CampaignRepository from '@/server/repositories/CampaignRepository';
export interface ICampaignService {
  listarCampanhasAtivas(): Promise<{statusCode: number, success: boolean, data: ICampaign[], error: string | null}>;
  obterDetalhesCampanha(id: string): Promise<{statusCode: number, success: boolean, data: ICampaign | null, error: string | null}>;
}

@injectable()
export class CampaignService implements ICampaignService {
  private campaignRepository: CampaignRepository.ICampaignRepository;

  constructor(
    @inject('campaignRepository') campaignRepository: CampaignRepository.ICampaignRepository
  ) {
    this.campaignRepository = campaignRepository;
  }
  /**
   * Obtém todas as campanhas ativas com suas estatísticas
   */
  async listarCampanhasAtivas(): Promise<{statusCode: number, success: boolean, data: ICampaign[], error: string | null}> {
    try {
      const campanhas: ICampaign[] = await this.campaignRepository.buscarCampanhasAtivas();
    
      
      return {
        statusCode: 200,
        success: true,
        error: null,
        data: campanhas
      };
    } catch (error) {
      console.error('Erro ao listar campanhas ativas:', error);
      return {
        statusCode: 500,
        success: false,
        data: [],
        error: 'Falha ao carregar as campanhas ativas'
      };
    }
  }

  /**
   * Obtém detalhes completos de uma campanha por ID
   */
  async obterDetalhesCampanha(campaignCode: string): Promise<{statusCode: number, success: boolean, data: ICampaign | null , error: string | null}> {
    try {
      const campanha: ICampaign | null = await this.campaignRepository.buscarCampanhaPorId(campaignCode);
      
      if (!campanha) {
        return {
          statusCode: 404,
          success: false,
          data: null,
          error: 'Campanha não encontrada',
        };
      }
      
      // Obter estatísticas
      // const stats = await this.obterEstatisticasCampanha(id);
      
      // // Obter últimos números vendidos
      // const recentSales = await CampaignRepository.buscarUltimosNumerosVendidos(id);
      
      // // Construir resposta completa
      // const campanhaCompleta = {
      //   ...campanha,
      //   stats,
      //   recentSales
      // };
      
      return {
        statusCode: 200,
        success: true,
        error: null,
        data: campanha
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da campanha:', error);
      return {
        statusCode: 500,
        success: false,
        data: null,
        error: 'Falha ao carregar os detalhes da campanha'
      };
    }
  }

  /**
   * Método privado para calcular estatísticas de uma campanha
   */
  private async obterEstatisticasCampanha(rifaId: string) {
    const statusCountArray = await this.campaignRepository.contarNumeroPorStatus(rifaId);
    
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