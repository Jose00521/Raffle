import 'reflect-metadata';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import type { ICampaignService } from '@/server/services/CampaignService';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '../utils/errorHandler/api';

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

export interface ICampaignController {
  listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>>;
  obterDetalhesCampanha(campaignCode: string): Promise<ApiResponse<ICampaign | null>>;
  criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>>;
}

@injectable()
export class CampaignController implements ICampaignController {
  private campaignService: ICampaignService;

  constructor(
    @inject('campaignService') campaignService:ICampaignService
  ) {
    this.campaignService = campaignService;
  }

  /**
   * Controller para listar todas as campanhas ativas
   */
   async listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>> {
    return await this.campaignService.listarCampanhasAtivas();
  }

  /**
   * Controller para obter detalhes de uma campanha por ID
   */
   async obterDetalhesCampanha(campaignCode: string): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignService.obterDetalhesCampanha(campaignCode);
  }

  /**
   * 🚀 ATUALIZADO: Controller para criar nova campanha com novo formato de prêmios instantâneos
   */
  async criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>> {
    console.log(`🎯 Controller: Recebida solicitação para criar campanha ${campaignData.title}`);
    
    if (instantPrizesData) {
      console.log(`📦 Controller: Recebidos ${instantPrizesData.prizes?.length || 0} prêmios instantâneos`);
    }
    
    // Validações básicas podem ser adicionadas aqui
    if (!campaignData.title || !campaignData.totalNumbers || !campaignData.createdBy) {
      throw new Error('Dados obrigatórios da campanha estão faltando');
    }
    
    if (campaignData.totalNumbers < 1 || campaignData.totalNumbers > 50000000) {
      throw new Error('Número total de números deve estar entre 1 e 50.000.000');
    }
    
    // Delegar para o service
    const result = await this.campaignService.criarNovaCampanha(campaignData, instantPrizesData);
    
    console.log(`✅ Controller: Campanha criada com sucesso`);
    return result;
  }
} 