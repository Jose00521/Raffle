import mongoose from 'mongoose';
import logger from '@/lib/logger/logger';
import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import NumberStatus from '@/models/NumberStatus';
import { BitMapService } from '@/services/BitMapService';
import dbConnect from '@/server/lib/dbConnect';

// Constantes para configuração de performance
const BATCH_SIZE = 5000; // Tamanho do lote para processamento
const MAX_CONCURRENT_CAMPAIGNS = 5; // Número máximo de campanhas processadas em paralelo

export async function releaseExpireNumbers() {
    logger.info('Iniciando liberação de números expirados');

    try {
        // Garantir que estamos conectados ao banco de dados
        
        const now = new Date();
        
        // 1. Otimização: Usar agregação para agrupar números por campanha diretamente no MongoDB
        // Isso evita carregar todos os documentos na memória e fazer o agrupamento no Node.js
        const expiredNumbersByCampaign = await NumberStatus!.aggregate([
            { 
                $match: { 
                    expiresAt: { $lte: now },
                    status: NumberStatusEnum.RESERVED
                }
            },
            {
                $group: {
                    _id: "$campaignId",
                    numberIds: { $push: "$_id" },
                    numbers: { $push: { $toInt: "$number" } },
                    count: { $sum: 1 }
                }
            }
        ]);

        if (expiredNumbersByCampaign.length === 0) {
            logger.info('Nenhum número para liberar');
            return;
        }
        
        const totalExpired = expiredNumbersByCampaign.reduce((sum, group) => sum + group.count, 0);
        logger.info(`Encontrados ${totalExpired} números expirados em ${expiredNumbersByCampaign.length} campanhas`);

        // 2. Otimização: Processar campanhas em lotes para evitar sobrecarga de memória
        // Dividir as campanhas em lotes menores para processamento
        const campaignBatches = [];
        for (let i = 0; i < expiredNumbersByCampaign.length; i += MAX_CONCURRENT_CAMPAIGNS) {
            campaignBatches.push(expiredNumbersByCampaign.slice(i, i + MAX_CONCURRENT_CAMPAIGNS));
        }

        let totalProcessed = 0;
        
        // Criar uma única sessão para todo o job
        const session = await mongoose.connection.startSession();


        try {
            // 3. Processar cada lote de campanhas
            for (const campaignBatch of campaignBatches) {
                // Usar Promise.all para processar campanhas em paralelo dentro de cada lote
                await Promise.all(campaignBatch.map(async (campaignGroup) => {
                    const campaignId = campaignGroup._id.toString();
                    const numbers = campaignGroup.numbers;
                    const numberIds = campaignGroup.numberIds;
                    
                    logger.info(`Processando campanha ${campaignId}: ${numbers.length} números expirados`);
                    
                    // 4. Otimização: Processar números em lotes menores para cada campanha
                    // Isso evita operações muito grandes que podem causar timeout
                    for (let i = 0; i < numbers.length; i += BATCH_SIZE) {
                        const numbersBatch = numbers.slice(i, i + BATCH_SIZE);
                        const numberIdsBatch = numberIds.slice(i, i + BATCH_SIZE);
                        
                        // Iniciar transação para este lote usando a sessão compartilhada
                        session.startTransaction();
                        
                        try {
                            // 5. Atualizar bitmap para este lote
                            await BitMapService.releaseReservedNumbers(campaignId, numbersBatch, session);
                            
                            // 6. Deletar registros de números expirados para este lote
                            await NumberStatus!.deleteMany(
                                { _id: { $in: numberIdsBatch } },
                                { session }
                            );
                            
                            await session.commitTransaction();
                            totalProcessed += numbersBatch.length;
                            
                            // Log a cada lote para acompanhamento de progresso
                            if (numbers.length > BATCH_SIZE) {
                                logger.info(`Campanha ${campaignId}: processado lote de ${numbersBatch.length} números (${i + numbersBatch.length}/${numbers.length})`);
                            }
                        } catch (error) {
                            await session.abortTransaction();
                            logger.error({
                                message: `Erro ao processar lote da campanha ${campaignId}`,
                                error: error instanceof Error ? error.message : String(error),
                                stack: error instanceof Error ? error.stack : undefined
                            });
                        }
                    }
                }));
            }
        } finally {
            // Garantir que a sessão seja finalizada independentemente do resultado
            session.endSession();
        }

        logger.info(`Liberação de números expirados concluída: ${totalProcessed} números processados`);
    } catch (error) {
        logger.error({ 
            message: 'Erro ao processar job de liberação de números expirados',
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    }
}