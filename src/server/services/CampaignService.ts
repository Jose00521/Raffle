import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { injectable, inject } from 'tsyringe';
import type { ICampaignRepository } from '@/server/repositories/CampaignRepository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/errorHandler/api';
import { ApiError } from '../utils/errorHandler/ApiError';

// Interface atualizada para prêmios instantâneos no novo formato do frontend
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

// Interface para o formato de entrada do frontend
interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

export interface ICampaignService {
  listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]>>;
  obterDetalhesCampanha(id: string): Promise<ApiResponse<ICampaign | null>>;
  criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign>>;
}

@injectable()
export class CampaignService implements ICampaignService {
  private campaignRepository: ICampaignRepository;

  constructor(
    @inject('campaignRepository') campaignRepository: ICampaignRepository
  ) {
    this.campaignRepository = campaignRepository;
  }
  /**
   * Obtém todas as campanhas ativas com suas estatísticas
   */
  async listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]>> {
    try {
      const campanhas: ICampaign[] = await this.campaignRepository.buscarCampanhasAtivas();
    
      
      return createSuccessResponse(campanhas, 'Campanhas ativas carregadas com sucesso', 200);
    } catch (error) {
      console.error('Erro ao listar campanhas ativas:', error);
      throw new ApiError({
        success: false,
        message: 'Erro ao listar campanhas ativas',
        statusCode: 500,
        cause: error as Error
      });
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

  /**
   * 🚀 ATUALIZADO: Criar nova campanha com novo formato de prêmios instantâneos
   */
  async criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign>> {
    try {
      console.log(`🎯 Service: Criando nova campanha ${campaignData.title}`);
      
      if (instantPrizesData) {
        console.log(`📦 Service: Recebidos ${instantPrizesData.prizes?.length || 0} prêmios instantâneos`);
      }
      
      // Usar o método atualizado do repository
      const novaCampanha = await this.campaignRepository.criarNovaCampanha(
        campaignData, 
        instantPrizesData
      );
      
      console.log(`✅ Service: Campanha criada com sucesso - ID: ${novaCampanha._id}`);
      
      return createSuccessResponse(
        novaCampanha, 
        'Campanha criada com sucesso. Números, ranges, partições e estatísticas inicializados.', 
        201
      );
      
    } catch (error) {
      console.error('Erro no service ao criar nova campanha:', error);
      throw new ApiError({
        success: false,
        message: 'Erro ao criar nova campanha',
        statusCode: 500,
        cause: error as Error
      });
    }
  }
} 