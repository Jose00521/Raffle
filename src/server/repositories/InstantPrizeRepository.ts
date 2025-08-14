import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import Campaign from '@/models/Campaign';
import InstantPrize from '@/models/InstantPrize';
import NumberStatus from '@/models/NumberStatus';
import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import mongoose from 'mongoose';


export interface GroupedInstantPrize {
    id: string;
    type: 'money' | 'item';
    quantity: number;
    value: number;
    prizeId?: string; // Para prêmios físicos
}

export interface CategorySummary {
    active: boolean;
    quantity: number;
    value: number;
    individualPrizes: GroupedInstantPrize[];
}

export interface GroupedInstantPrizesResponse {
    [categoryName: string]: CategorySummary;
}

export interface InstantPrizeRepositoryInterface {
    buscarPremiosInstantaneos(campaignId: string, page: number, limit: number): Promise<InstantPrizeResponse>;
    buscarPremiosInstantaneosPorCategoria(campaignId: string, categoryId: string, page: number, limit: number): Promise<InstantPrizeCategoryResponse>;
}
export interface InstantPrizeResponse {
    categories: Array<InstantPrizeCategory>;
}

export interface InstantPrizeCategory {
    id: string;
    name: string;
    prizes: typeof InstantPrize[];
    description: string;
    total: number;
    hasMore: boolean;
}


export interface InstantPrizeCategoryResponse {
    premios: typeof InstantPrize[];
    paginacao: {
        total: number;
        pagina: number;
        limite: number;
        totalPaginas: number;
    };
}



@injectable()
export class InstantPrizeRepository implements InstantPrizeRepositoryInterface {
    private db: IDBConnection;

    constructor(
        @inject("db") db: IDBConnection
    ) {
        this.db = db;
    }


    async buscarPremiosInstantaneos(campaignId: string, page: number = 1, limit: number = 10): Promise<InstantPrizeResponse> {
          // Versão otimizada para milhões de registros - limita dados antes do agrupamento principal
          await this.db.connect();
          
          console.log("buscarPremiosInstantaneos chamado com ID:", campaignId);
          
          if (!mongoose.Types.ObjectId.isValid(campaignId)) {
            console.log("ID de campanha inválido:", campaignId);
            return { categories: [] };
          }
          
          try {
            // Simplificando a consulta para maior eficiência
            const categoriasPremios = await InstantPrize.aggregate([
                // 1. Filtra por campanha
                { 
                    $match: { campaignId: new mongoose.Types.ObjectId(campaignId) }
                },
                // 2. Lookup para buscar informações dos prêmios físicos quando type=item
                {
                    $lookup: {
                        from: 'prizes',
                        let: { prizeRef: "$prizeRef", tipo: "$type" },
                        pipeline: [
                            { 
                                $match: { 
                                    $expr: { 
                                        $and: [
                                            { $eq: ["$$tipo", "item"] },
                                            { $eq: ["$_id", { $toObjectId: "$$prizeRef" }] }
                                        ]
                                    } 
                                }
                            }
                        ],
                        as: 'physicalPrize'
                    }
                },
                // 3. Adiciona o prêmio físico diretamente como um campo
                {
                    $addFields: {
                        physicalPrize: { $arrayElemAt: ["$physicalPrize", 0] }
                    }
                },
                // 4. Lookup para categoria
                {
                    $lookup: {
                        from: 'instant_prize_categories',
                        localField: 'categoryId',
                        foreignField: '_id',
                        as: 'categoryInfo'
                    }
                },
                // 5. Desfaz array da categoria
                {
                    $unwind: {
                        path: '$categoryInfo',
                        preserveNullAndEmptyArrays: true
                    }
                },
                // 6. Agrupa por categoria
                {
                    $group: {
                        _id: '$categoryId',
                        name: { $first: '$categoryInfo.name' },
                        description: { $first: '$categoryInfo.description' },
                        count: { $sum: 1 },
                        prizes: { $push: '$$ROOT' }
                    }
                },
                // 7. Formata resultado final
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        description: { $ifNull: ['$description', ''] },
                        count: 1,
                        prizes: 1,
                        hasMore: { $gt: ['$count', limit] }
                    }
                }
            ]);
            
            console.log("Categorias encontradas:", categoriasPremios.length);

            const categories = categoriasPremios.map(cat => ({
                id: cat._id,
                name: cat.name,
                description: cat.description,
                prizes: cat.prizes,
                total: cat.count,
                hasMore: cat.hasMore
            }));

            console.log("############################### categories ###########################################", categories);
            
            return { categories };
          } catch (error) {
            console.error("Erro ao buscar prêmios instantâneos:", error);
            return { categories: [] };
          }
    }

    async buscarPremiosInstantaneosPorCategoria(campaignId: string, categoryId: string, page: number = 1, limit: number = 10): Promise<InstantPrizeCategoryResponse> {
        try {
            await this.db.connect();
  
            if (!mongoose.Types.ObjectId.isValid(campaignId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
              return { premios: [], paginacao: { total: 0, pagina: page, limite: limit, totalPaginas: 0 } };
            }
            
            // Busca apenas contagem e prêmios, sem tocar na campanha
            const [totalPremios, premios] = await Promise.all([
              InstantPrize.countDocuments({ campaignId, categoryId }),
              InstantPrize.aggregate([
                { $match: { campaignId: new mongoose.Types.ObjectId(campaignId), categoryId } },
                // Lookup para popular referências de prêmios físicos
                {
                    $lookup: {
                        from: 'prizes',
                        let: { prizeRef: "$prizeRef", tipo: "$type" },
                        pipeline: [
                            { 
                                $match: { 
                                    $expr: { 
                                        $and: [
                                            { $eq: ["$$tipo", "item"] },
                                            { $eq: ["$_id", { $toObjectId: "$$prizeRef" }] }
                                        ]
                                    } 
                                }
                            }
                        ],
                        as: 'physicalPrize'
                    }
                },
                // Adiciona o prêmio físico diretamente como um campo
                {
                    $addFields: {
                        physicalPrize: { $arrayElemAt: ["$physicalPrize", 0] }
                    }
                },
                { $sort: { createdAt: -1 } },
                { $skip: (page - 1) * limit },
                { $limit: limit }
              ])
            ]);
            
            return {
              premios: premios as unknown as typeof InstantPrize[],
              paginacao: {
                total: totalPremios,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(totalPremios / limit)
              }
            };
            
            
        } catch (error) {
            console.error('Erro ao buscar prêmios instantâneos por categoria:', error);
            throw error;
        }
    }
}