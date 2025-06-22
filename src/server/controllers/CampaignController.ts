import 'reflect-metadata';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import type { ICampaignService } from '@/server/services/CampaignService';
import { injectable, inject } from 'tsyringe';
import { ApiResponse } from '../utils/errorHandler/api';
import { Session } from 'next-auth';

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
  listActiveCampaignsPublic(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>>;
  criarNovaCampanha(campaignData: ICampaign, session: Session, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>>;
  getCampaignById(id: string, userCode: string): Promise<ApiResponse<ICampaign | null>>;
  getCampaignByIdPublic(id: string): Promise<ApiResponse<ICampaign | null>>;
  deleteCampaign(id: string, session: Session): Promise<ApiResponse<ICampaign | null>>;
  toggleCampaignStatus(id: string): Promise<ApiResponse<ICampaign | null>>;
  updateCampaign(id: string, session: Session, updatedCampaign: Partial<ICampaign>): Promise<ApiResponse<ICampaign> | ApiResponse<null>>;
  listActiveCampaigns(session: Session): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>>;
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
   async listActiveCampaignsPublic(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>> {
    return await this.campaignService.listActiveCampaignsPublic();
  }

  async listActiveCampaigns(session: Session): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>> {
    return await this.campaignService.listActiveCampaigns(session);
  }

  async getCampaignById(id: string, userCode: string): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignService.getCampaignById(id, userCode);
  }

  async getCampaignByIdPublic(id: string): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignService.getCampaignByIdPublic(id);
  }

  async deleteCampaign(id: string, session: Session): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignService.deleteCampaign(id, session);
  }

  async toggleCampaignStatus(id: string): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignService.toggleCampaignStatus(id);
  }


  /**
   * 🚀 ATUALIZADO: Controller para criar nova campanha com novo formato de prêmios instantâneos
   */
  async criarNovaCampanha(campaignData: ICampaign, session: Session,instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>> {
    console.log(`🎯 Controller: Recebida solicitação para criar campanha ${campaignData.title}`);
    
    if (instantPrizesData) {
      console.log(`📦 Controller: Recebidos ${instantPrizesData.prizes?.length || 0} prêmios instantâneos`);
    }
    
    // Validações básicas podem ser adicionadas aqui
    if (!campaignData.title || !campaignData.totalNumbers || !campaignData.createdBy) {
      throw new Error('Dados obrigatórios da campanha estão faltando');
    }
    
    // Delegar para o service
    const result = await this.campaignService.criarNovaCampanha(campaignData, session ,instantPrizesData);
    
    console.log(`✅ Controller: Campanha criada com sucesso`);
    return result;
  }

  async updateCampaign(id: string, session: Session, updatedCampaign: Partial<ICampaign>): Promise<ApiResponse<ICampaign> | ApiResponse<null>> {
    return await this.campaignService.updateCampaign(id, session, updatedCampaign);
  }
} 