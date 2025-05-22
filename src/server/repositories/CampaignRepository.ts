import * as dbConnect from '@/server/lib/dbConnect';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { IInstantPrize } from '@/models/interfaces/IInstantPrizeInterfaces';
import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import mongoose from 'mongoose';
import Campaign from '@/models/Campaign';
import NumberStatus from '@/models/NumberStatus';
import InstantPrize from '@/models/InstantPrize';

import { injectable, inject } from 'tsyringe';

export interface ICampaignRepository {
  buscarCampanhasAtivas(): Promise<ICampaign[]>;
  buscarCampanhaPorId(id: string): Promise<ICampaign | null>;
  createCampaignWithInstantPrizes(campaignData: ICampaign, instantPrizesData: IInstantPrize[]): Promise<ICampaign | Error>;
  contarNumeroPorStatus(rifaId: string): Promise<any[]>;
  buscarUltimosNumerosVendidos(rifaId: string, limite: number): Promise<any[]>;
}

@injectable()
export class CampaignRepository	implements ICampaignRepository  {
  private db: dbConnect.IDBConnection;

  constructor(@inject('db') db: dbConnect.IDBConnection) {
    this.db = db;
  }
  /**
   * Busca todas as campanhas ativas
   */
   async buscarCampanhasAtivas(): Promise<ICampaign[]> {
    try {
      await this.db.connect();
      const campaigns = await Campaign.find({ status: 'ACTIVE' }).exec();

      const campaingStats = campaigns.map(campaign=>{
        return {
          ...campaign.toObject(),
        }
      })

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

   async createCampaignWithInstantPrizes(campaignData:ICampaign, instantPrizesData:IInstantPrize[]): Promise<ICampaign | Error> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // Criar campanha
      const campaign = await Campaign.create([campaignData], { session });
      const campaignId = campaign[0]._id;
      
      // Criar prêmios instantâneos
      const instantPrizes = await InstantPrize.insertMany(
        instantPrizesData.map(prize => ({
          ...prize, 
          campaignId
        })),
        { session }
      );
      
      // Atualizar campanha e inicializar números
      const instantPrizeIds = instantPrizes.map(prize => prize._id);
      const instantPrizeNumbers = instantPrizes.map(prize => prize.number);
      
      await Campaign.findByIdAndUpdate(
        campaignId,
        { instantPrizes: instantPrizeIds },
        { session }
      );
      
      // Inicializar números com a mesma sessão
      await NumberStatus!.initializeForRifa(
        campaignId.toString(),
        campaignData.totalNumbers,
        instantPrizeNumbers,
        session
      );
      
      await session.commitTransaction();
      const campaignFind = await Campaign.findById(campaignId).populate('instantPrizes'); 
      return campaignFind;
      
    } catch (error) {
      await session.abortTransaction();
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