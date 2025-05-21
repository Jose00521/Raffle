import { ICampaign } from '@/models/Campaign';
import * as CampaignService from '@/server/services/CampaignService';
import { injectable, inject } from 'tsyringe';

export interface ICampaignController {
  listarCampanhasAtivas(): Promise<{statusCode: number, success: boolean, data: ICampaign[], error: string | null}>;
  obterDetalhesCampanha(campaignCode: string): Promise<{statusCode: number, success: boolean, data: ICampaign | null, error: string | null}>;
}
@injectable()
export class CampaignController implements ICampaignController {
  private campaignService: CampaignService.ICampaignService;

  constructor(
    @inject('campaignService') 
    campaignService: CampaignService.ICampaignService
  ) {
    this.campaignService = campaignService;
  }

  /**
   * Controller para listar todas as campanhas ativas
   */
   async listarCampanhasAtivas(): Promise<{statusCode: number, success: boolean, data: ICampaign[], error: string | null}> {
    return await this.campaignService.listarCampanhasAtivas();
  }

  /**
   * Controller para obter detalhes de uma campanha por ID
   */
   async obterDetalhesCampanha(campaignCode: string): Promise<{statusCode: number, success: boolean, data: ICampaign | null, error: string | null}> {
    return await this.campaignService.obterDetalhesCampanha(campaignCode);
  }
} 