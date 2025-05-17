import { CampaignService } from '@/server/services/CampaignService';

export class CampaignController {
  /**
   * Controller para listar todas as campanhas ativas
   */
  static async listarCampanhasAtivas() {
    return await CampaignService.listarCampanhasAtivas();
  }

  /**
   * Controller para obter detalhes de uma campanha por ID
   */
  static async obterDetalhesCampanha(id: string) {
    return await CampaignService.obterDetalhesCampanha(id);
  }
} 