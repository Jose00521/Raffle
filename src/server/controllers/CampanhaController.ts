import { CampanhaService } from '@/server/services/CampanhaService';

export class CampanhaController {
  /**
   * Controller para listar todas as campanhas ativas
   */
  static async listarCampanhasAtivas() {
    return await CampanhaService.listarCampanhasAtivas();
  }

  /**
   * Controller para obter detalhes de uma campanha por ID
   */
  static async obterDetalhesCampanha(id: string) {
    return await CampanhaService.obterDetalhesCampanha(id);
  }
} 