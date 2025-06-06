import type { IDBConnection } from '@/server/lib/dbConnect';
import { CampaignStatusEnum, ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import mongoose from 'mongoose';
import Campaign from '@/models/Campaign';
import NumberStatus from '@/models/NumberStatus';
import { CampaignDataProcessorService } from '@/server/services/CampaignDataProcessorService';
import { injectable, inject } from 'tsyringe';
import type { Logger } from 'pino';

import { getServerSession } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';
import { ApiResponse, createErrorResponse } from '../utils/errorHandler/api';
import { User } from '@/models/User';
import { generateEntityCode } from '@/models/utils/idGenerator';

// Interface atualizada para prêmios instantâneos no novo formato do frontend
interface InstantPrizeData {
  type: 'money' | 'item';
  categoryId: string;
  quantity?: number;      // Para money prizes
  number?: string;  
  numbers?: string[];      // Para item prizes (número temporário)
  value: number;
  prizeId?: string;       // Para item prizes (Snowflake ID)
  name?: string;          // Para item prizes
  image?: string;         // Para item prizes
}

// Interface para o formato de entrada do frontend
interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

// Interface legada para compatibilidade (será removida gradualmente)

export interface ICampaignRepository {
  buscarCampanhasAtivas(userCode: string): Promise<ICampaign[] | ApiResponse<null>>;
  buscarCampanhaPorId(id: string): Promise<ICampaign | null>;
  criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ICampaign>;
  contarNumeroPorStatus(rifaId: string): Promise<any[]>;
  buscarUltimosNumerosVendidos(rifaId: string, limite: number): Promise<any[]>;
}

@injectable()
export class CampaignRepository implements ICampaignRepository {
  constructor(
    @inject('db') private db: IDBConnection,
    @inject(CampaignDataProcessorService) private dataProcessor: CampaignDataProcessorService,
    @inject('logger') private logger: Logger
  ) {

  }

  /**
   * Busca todas as campanhas ativas
   */
   async buscarCampanhasAtivas(userCode: string): Promise<ICampaign[] | ApiResponse<null>> {
    try {
      await this.db.connect();

      const user = await User.findOne({ userCode: userCode });

      console.log("user for list prizes",user);

      if(!user){
          return createErrorResponse('Usuário não encontrado', 404);
      }

      const campaigns = await Campaign.find({createdBy: user?._id},'-_id').exec();

      return campaigns;
    } catch (error) {
      console.error('Erro ao buscar campanhas ativas:', error);
      throw error;
    }
  }

    /**
   * Busca uma campanha específica por ID
   */
   async buscarCampanhaPorId(id: string): Promise<ICampaign | null> {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
      }
      
      await this.db.connect();
      const campaign: ICampaign | null = await Campaign.findById(id).lean() as ICampaign | null;
      return campaign;
    }

  /**
   * 🚀 MÉTODO REFATORADO: Criar campanha usando o serviço especializado
   * 🔐 Conversão de Snowflake IDs delegada para CampaignDataProcessorService
   */
  async criarNovaCampanha(
    campaignData: ICampaign, 
    instantPrizesData?: InstantPrizesPayload
  ): Promise<ICampaign> {
    const session = await mongoose.startSession();
    
    try {
      await this.db.connect();
      session.startTransaction();
      
      this.logger.info(`🎯 [CampaignRepository] Criando campanha: ${campaignData.title} (${campaignData.totalNumbers} números)`);
      
      // 🔐 1. CONVERSÕES DE SNOWFLAKE IDS USANDO O SERVIÇO ESPECIALIZADO
      const campaignDataWithRealIds = await this.dataProcessor.convertCampaignSnowflakeIds(campaignData);
      const instantPrizesDataWithRealIds = await this.dataProcessor.convertInstantPrizesSnowflakeIds(instantPrizesData);
      
      // 2. CRIAR CAMPANHA COM OS IDS REAIS
      const campaign = await Campaign.create([campaignDataWithRealIds], { session });

      campaign[0].campaignCode = generateEntityCode(campaign[0]._id, 'CA');

      await campaign[0].save();

      const campaignId = campaign[0]._id;
      
      this.logger.info(`✅ [CampaignRepository] Campanha criada: ${campaignId}`);
      
      // 3. PROCESSAR PRÊMIOS INSTANTÂNEOS USANDO O SERVIÇO
      const instantPrizesConfig = this.dataProcessor.processInstantPrizesData(
        instantPrizesDataWithRealIds, 
        campaignDataWithRealIds.totalNumbers
      );
      
      // 4. INICIALIZAR NÚMEROS, RANGES E PARTIÇÕES
      await NumberStatus!.initializeForRifa(
        String(campaignId),
        String(campaignDataWithRealIds.createdBy),
        campaignDataWithRealIds.totalNumbers,
        instantPrizesConfig,
        session
      );
      
      this.logger.info(`✅ [CampaignRepository] Inicialização completa: ranges, partições e prêmios criados`);
      
      // 5. COMMIT E RETORNO
      await session.commitTransaction();
      
      const campaignCompleta = await Campaign.findById(campaignId)
        .populate('createdBy', 'name email userCode')
        .lean();
      
      this.logger.info(`🎉 [CampaignRepository] Campanha ${campaignId} criada com sucesso!`);
      
      return campaignCompleta as unknown as ICampaign;
      
    } catch (error) {
      await session.abortTransaction();
      this.logger.error('💥 [CampaignRepository] Erro ao criar campanha:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Conta o número de números por status para uma campanha
   */
   async contarNumeroPorStatus(rifaId: string) {
    await this.db.connect();
    
    return NumberStatus!.aggregate([
      { $match: { rifaId: new mongoose.Types.ObjectId(rifaId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
  }

  /**
   * Busca os últimos números vendidos de uma campanha
   */
   async buscarUltimosNumerosVendidos(rifaId: string, limite: number = 10) {
    this.db.connect();
    
    return NumberStatus!.find(
      { rifaId, status: NumberStatusEnum.PAID },
      { number: 1, paidAt: 1, userId: 1, _id: 0 }
    )
      .sort({ paidAt: -1 })
      .limit(limite)
      .populate('userId', 'name')
      .lean();
  }
} 