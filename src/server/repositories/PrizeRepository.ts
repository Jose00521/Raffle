import { inject, injectable } from "tsyringe";

import type { IDBConnection } from "@/server/lib/dbConnect";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { ApiError } from "@/server/utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import Prize from "@/models/Prize";
import { getServerSession } from "next-auth";
import { processImage } from '@/lib/upload-service/processImage'
import { uploadToS3 } from "@/lib/upload-service/client/uploadToS3";
import { Creator, User } from "@/models/User";
import { nextAuthOptions } from "@/lib/auth/nextAuthOptions";
import logger from "@/lib/logger/logger";
import PrizeCategory from "@/models/PrizeCategory";
import { deleteMultipleFromS3 } from "@/lib/upload-service/client/deleteFromS3";

export interface IPrizeRepository {
    getAllPrizes(userCode: string): Promise<ApiResponse<IPrize[]> | ApiResponse<null>>;
    getPrizeById(id: string, userCode: string): Promise<ApiResponse<IPrize | null>>;
    createPrize(prize: {
        name: string;
        description: string;
        categoryCode: string;
        value: string;
        image: string;
        images: string[];
        userCode: string;
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
    deletePrize(id: string, userCode: string): Promise<ApiResponse<null>>;
    updatePrize(id: string, updatedData: Record<string, any>, userCode?: string): Promise<ApiResponse<IPrize> | ApiResponse<null>>;
}

@injectable()
export class PrizeRepository implements IPrizeRepository {
    private db: IDBConnection;

    constructor(
        @inject('db') db: IDBConnection
    ) {
        this.db = db;
    }


    async getAllPrizes(userCode: string): Promise<ApiResponse<IPrize[]> | ApiResponse<null>> {
        try {

            await this.db.connect();

            const user = await User.findOne({ userCode: userCode });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            // Usar populate para incluir os dados completos do usuário e da categoria
            const prizes = await Prize.find({ createdBy: user?._id }, '-_id')
                .populate({
                    path: 'createdBy',
                    model: 'User',
                    select: 'name email userCode profileImage -_id' // Selecionar apenas os campos necessários
                })
                .populate({
                    path: 'categoryId',
                    model: 'PrizeCategory',
                    select: 'name categoryCode -_id' // Selecionar apenas os campos necessários
                });

            return createSuccessResponse(prizes, 'Prêmios encontrados com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar prêmios',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    async getPrizeById(id: string, userCode: string): Promise<ApiResponse<IPrize | null>> {
        try {
            await this.db.connect();

            const user = await User.findOne({ userCode: userCode });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }
            
            // Usar populate para incluir os dados do usuário e da categoria
            const prize = await Prize.findOne({ prizeCode: id, createdBy: user?._id }, '-_id')
                .populate({
                    path: 'createdBy',
                    model: 'User',
                    select: 'name email userCode -_id'
                })
                .populate({
                    path: 'categoryId',
                    model: 'PrizeCategory',
                    select: 'name categoryCode -_id'
                });
                
            return createSuccessResponse(prize, 'Prêmio encontrado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async updatePrize(id: string, updatedData: Record<string, any>, userCode?: string): Promise<ApiResponse<IPrize> | ApiResponse<null>> {
        try {
            await this.db.connect();
            
            // Find the prize
            const prize = await Prize.findOne({ prizeCode: id });
            
            if (!prize) {
                return createErrorResponse('Prêmio não encontrado', 404);
            }
            
            // If userCode is provided, verify that the user owns the prize
            if (userCode) {
                const user = await User.findOne({ userCode });
                
                if (!user) {
                    return createErrorResponse('Usuário não encontrado', 404);
                }
                
                // Check if the prize belongs to the user
                if (prize.createdBy && prize.createdBy.toString() !== user._id.toString()) {
                    return createErrorResponse('Você não tem permissão para atualizar este prêmio', 403);
                }
            }
            
            // Update the prize
            Object.keys(updatedData).forEach(key => {
                prize[key] = updatedData[key];
            });
            
            prize.updatedAt = new Date();
            
            await prize.save();
            
            return createSuccessResponse(prize, 'Prêmio atualizado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Repository: Erro ao atualizar prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: string;  
        images: string[];
        categoryCode: string;
        userCode: string;
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>> {
        try {
            await this.db.connect();
            console.log("prize repository",prize);
            const user = await User.findOne({ userCode: prize.userCode });
            const category = await PrizeCategory.findOne({ categoryCode: prize.categoryCode });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            console.log("user",user);


            const prizeData = await Prize.create(prize);

            prizeData.prizeCode = generateEntityCode(prizeData._id, 'PR');
            prizeData.createdBy = user?._id;
            prizeData.categoryId = category?._id;

            await prizeData.save();

            return createSuccessResponse(prizeData, 'Prêmio criado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    async deletePrize(id: string, userCode: string): Promise<ApiResponse<null>> {
        try {
            await this.db.connect();
            
            const user = await User.findOne({ userCode: userCode });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            const prize = await Prize.findOne({ prizeCode: id, createdBy: user?._id });
            if (!prize) {
                return createErrorResponse('Prêmio não encontrado', 404);       
            }

            // Excluir imagens do S3 antes de remover o prêmio
            const imagesToDelete: string[] = [];
            
            // Adicionar imagem principal (se existir)
            if (prize.image && typeof prize.image === 'string') {
                imagesToDelete.push(prize.image);
            }
            
            // Adicionar imagens adicionais (se existirem)
            if (prize.images && Array.isArray(prize.images)) {
                prize.images.forEach((img: string) => {
                    if (typeof img === 'string') {
                        imagesToDelete.push(img);
                    }
                });
            }
            
            // Excluir imagens do S3 se houver alguma para excluir
            if (imagesToDelete.length > 0) {
                try {
                    logger.info(`Iniciando exclusão de ${imagesToDelete.length} imagens do S3 para o prêmio ${id}`, {
                        prizeCode: id,
                        imageCount: imagesToDelete.length
                    });
                    
                    const deleteResult = await deleteMultipleFromS3(imagesToDelete);
                    
                    logger.info(`Resultado da exclusão de imagens do S3 para o prêmio ${id}`, {
                        prizeCode: id,
                        deletedCount: deleteResult.deletedCount,
                        errors: deleteResult.errors,
                        success: deleteResult.success
                    });
                } catch (error) {
                    logger.error(`Erro ao excluir imagens do S3 para o prêmio ${id}`, {
                        prizeCode: id,
                        error: error instanceof Error ? error.message : String(error),
                        stack: error instanceof Error ? error.stack : undefined
                    });
                    // Continuar com a exclusão do prêmio mesmo se a exclusão das imagens falhar
                }
            } else {
                logger.info(`Prêmio ${id} não possui imagens para excluir do S3`);
            }

            await Prize.deleteOne({ prizeCode: id, createdBy: user?._id });
            logger.info(`Prêmio ${id} excluído com sucesso do banco de dados`);

            return createSuccessResponse(null, 'Prêmio deletado com sucesso', 200);
        } catch (error) {
            logger.error(`Erro ao excluir prêmio ${id}`, {
                prizeCode: id,
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined
            });
            
            throw new ApiError({
                message: 'Repository: Erro ao deletar prêmio',
                success: false,
                statusCode: 500,
                cause: error as Error
            });
        }
    }   
}