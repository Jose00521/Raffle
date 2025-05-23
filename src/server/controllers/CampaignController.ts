import 'reflect-metadata';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import type { ICampaignService } from '@/server/services/CampaignService';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '../utils/errorHandler/api';

export interface ICampaignController {
  listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]>>;
  obterDetalhesCampanha(campaignCode: string): Promise<ApiResponse<ICampaign | null>>;
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
   async listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]>> {
    return await this.campaignService.listarCampanhasAtivas();
  }

  /**
   * Controller para obter detalhes de uma campanha por ID
   */
   async obterDetalhesCampanha(campaignCode: string): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignService.obterDetalhesCampanha(campaignCode);
  }
} 