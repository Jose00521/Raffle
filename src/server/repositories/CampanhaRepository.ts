import dbConnect from '@/server/lib/dbConnect';
import Rifa from '@/models/Campaign';
import NumberStatus, { NumberStatusEnum } from '@/models/NumberStatus';
import mongoose from 'mongoose';

export class CampanhaRepository {
  /**
   * Busca todas as campanhas ativas
   */
  static async buscarCampanhasAtivas() {
    try {
      await dbConnect();
      const campaigns = await Rifa.find({ isActive: true }).exec();

      const campaingStats = campaigns.map(campaign=>{
        return {
          ...campaign.toObject(),
          stats: {
            available: 1000,
            reserved: 10,
            sold: 200,
            percentComplete: ((campaign.stats?.sold || 0) / campaign.totalNumbers) * 100  
          }
        }
      })

      return {
        success: true,
        data: campaingStats
      };
    } catch (error) {
      console.error('Erro ao buscar campanhas ativas:', error);
      throw error;
    }
  }

  /**
   * Busca uma campanha específica por ID
   */
  static async buscarCampanhaPorId(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await dbConnect();
    return Rifa.findById(id).lean();
  }

  /**
   * Conta o número de números por status para uma campanha
   */
  static async contarNumeroPorStatus(rifaId: string) {
    await dbConnect();
    
    return NumberStatus!.aggregate([
      { $match: { rifaId: new mongoose.Types.ObjectId(rifaId) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } }
    ]);
  }

  /**
   * Busca os últimos números vendidos de uma campanha
   */
  static async buscarUltimosNumerosVendidos(rifaId: string, limite: number = 10) {
    await dbConnect();
    
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