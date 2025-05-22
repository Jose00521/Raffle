import * as dbConnect from '@/server/lib/dbConnect';
import Campaign from '@/models/Campaign';
import InstantPrize from '@/models/InstantPrize';
import NumberStatus from '@/models/NumberStatus';
import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import mongoose from 'mongoose';


export class InstantPrizeRepository {
    static async buscarPrêmiosInstantâneos(campaignId: string, page: number = 1, limit: number = 10) {
          // Versão otimizada para milhões de registros - limita dados antes do agrupamento principal
            const categoriasPremios = await InstantPrize.aggregate([
                // 1. Filtra por campanha
                { 
                    $match: { campaignId: new mongoose.Types.ObjectId(campaignId) }
                },
                // 2. Agrupa por categoria para contar e pré-selecionar documentos
                {
                    $group: { 
                        _id: '$categoryId', 
                        count: { $sum: 1 },
                        // Pega apenas os N documentos mais recentes por categoria
                        docs: { 
                            $push: { 
                                _id: '$_id', 
                                categoryId: '$categoryId',
                                number: '$number',
                                name: '$name',
                                description: '$description',
                                createdAt: '$createdAt',
                                // Inclua os outros campos necessários, mas evite campos grandes desnecessários
                            } 
                        }
                    }
                },
                // 3. Adiciona campo com os documentos limitados por categoria
                {
                    $project: {
                        _id: 1,
                        count: 1,
                        limitedDocs: { $slice: ['$docs', 0, limit] },
                    }
                },
                // 4. "Desmembra" para processar cada documento individualmente
                {
                    $unwind: '$limitedDocs'
                },
                // 5. Busca os IDs dos prêmios pré-selecionados para obter dados completos
                {
                    $lookup: {
                        from: 'instant_prizes',
                        localField: 'limitedDocs._id',
                        foreignField: '_id', 
                        as: 'premioCompleto'
                    }
                },
                // 6. Desmembra o resultado do lookup
                {
                    $unwind: '$premioCompleto'
                },
                // 7. Busca informações da categoria
                {
                    $lookup: {
                        from: 'instant_prize_categories',
                        localField: '_id', // categoryId do agrupamento
                        foreignField: '_id',
                        as: 'categoryInfo'
                    }
                },
                // 8. Desmembra as informações da categoria
                {
                    $unwind: '$categoryInfo'
                },
                // 9. Reagrupa tudo por categoria
                {
                    $group: {
                        _id: '$_id', // categoryId
                        categoryName: { $first: '$categoryInfo.nome' },
                        count: { $first: '$count' }, // total de prêmios nesta categoria
                        premios: { $push: '$premioCompleto' } // array com prêmios completos
                    }
                },
                // 10. Formata o resultado final
                {
                    $project: {
                        _id: 1,
                        categoryName: 1,
                        count: 1,
                        premios: 1,
                        hasMore: { $gt: ['$count', limit] }
                    }
                }
            ]);
            
            return {
                categorias: categoriasPremios.map(cat => ({
                    id: cat._id,
                    nome: cat.categoryName,
                    premios: cat.premios,
                    total: cat.count,
                    hasMore: cat.hasMore
                }))
            };
    }

    static async buscarPrêmiosInstantâneosPorCategoria(campaignId: string, categoryId: string, page: number = 1, limit: number = 10) {
        try {
            await dbConnect();
  
            if (!mongoose.Types.ObjectId.isValid(campaignId) || !mongoose.Types.ObjectId.isValid(categoryId)) {
              return { premios: [], paginacao: { total: 0, pagina: page, limite: limit, totalPaginas: 0 } };
            }
            
            // Busca apenas contagem e prêmios, sem tocar na campanha
            const [totalPremios, premios] = await Promise.all([
              InstantPrize.countDocuments({ campaignId, categoryId }),
              InstantPrize.find({ campaignId, categoryId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
            ]);
            
            return {
              premios,
              paginacao: {
                total: totalPremios,
                pagina: page,
                limite: limit,
                totalPaginas: Math.ceil(totalPremios / limit)
              }
            };
            
            
        } catch (error) {
            console.error('Erro ao buscar prêmios instantâneos:', error);
            throw error;
        }
    }
}