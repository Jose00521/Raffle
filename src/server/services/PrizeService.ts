import { inject, injectable } from "tsyringe";
import type {IPrizeRepository} from "../repositories/PrizeRepository";
import { ApiResponse, createErrorResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import { processImage } from "@/lib/upload-service/processImage";
import { uploadToS3 } from "@/lib/upload-service/client/uploadToS3";
import { getServerSession } from "next-auth";
import { ApiError } from "../utils/errorHandler/ApiError";
import { nextAuthOptions } from "@/lib/auth/nextAuthOptions";
import logger from "@/lib/logger/logger";
import { rateLimit } from "@/lib/rateLimit";
export interface IPrizeService {
    getAllPrizes(): Promise<ApiResponse<IPrize[]> | ApiResponse<null>>;
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
    getPrizeById(id: string): Promise<ApiResponse<IPrize>>;
    deletePrize(id: string): Promise<ApiResponse<null>>;
    updatePrize(id: string, updatedData: Record<string, any>): Promise<ApiResponse<IPrize> | ApiResponse<null>>;
}

@injectable()
export class PrizeService implements IPrizeService {
    private prizeRepository: IPrizeRepository;

    constructor(
        @inject('prizeRepository') prizeRepository: IPrizeRepository
    ) {
        this.prizeRepository = prizeRepository;
    }

    async getAllPrizes(): Promise<ApiResponse<IPrize[]> | ApiResponse<null>> {
        try {
            const session = await getServerSession(nextAuthOptions);
            logger.info("Verificando sessão", session);

            console.log("Session",session);

            if (!session?.user?.id) {
                return createErrorResponse('Não autorizado', 401);
            }

            const userCode = session?.user?.id;

            // Use type assertion to match our return type
            return await this.prizeRepository.getAllPrizes(userCode) as ApiResponse<IPrize[]>;
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Service: Erro ao buscar prêmios',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async getPrizeById(id: string): Promise<ApiResponse<IPrize>> {
        return await this.prizeRepository.getPrizeById(id);
    }

    async deletePrize(id: string): Promise<ApiResponse<null>> {
        return await this.prizeRepository.deletePrize(id);
    }

    async createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>> {
        try {
            const limiter = rateLimit({
                interval: 60 * 1000,
                uniqueTokenPerInterval: 500,
                tokensPerInterval: 10
              });

            const session = await getServerSession(nextAuthOptions);
            logger.info("Verificando sessão", session);

            console.log("Session",session);

            if (!session?.user?.id) {
                return createErrorResponse('Não autorizado', 401);
            }

            // Aplicar rate limiting
            try {
                await limiter.check(10, `${session.user.id}:premio-create`);
            } catch {
                return createErrorResponse('Muitas requisições, tente novamente mais tarde', 429);
 
            }

            logger.info("Sessão válida", session);
            
            // Log para debugging - verificar entradas
            logger.info("Objeto prize recebido:", {
                name: prize.name,
                description: prize.description,
                value: prize.value,
                hasImage: !!prize.image,
                imagesCount: prize.images?.length || 0
            });

            // Verificação inicial para garantir que pelo menos uma imagem principal foi fornecida
            if (!prize.image) {
                return createErrorResponse('A imagem principal é obrigatória', 400);
            }

            logger.info("Processando imagens");
            const processedImages = await Promise.all(
                [prize.image, ...prize.images].map(async (image, index) => {
                    logger.info(`Processando imagem ${index}`, {
                        type: image?.type,
                        size: image?.size
                    });
                    return processImage(image);
                })
            );

            console.log("processedImages",processedImages);
            console.log("processedImages.length", processedImages.length);

            logger.info("Imagens processadas", processedImages);

            const validImages = processedImages.filter(Boolean) as { buffer: Buffer, originalName: string }[];
            logger.info("Número de imagens válidas:", validImages.length);

            if (!validImages.length) {
                return createErrorResponse('Nenhuma imagem válida para upload', 400);
            }

            // Verificar se a imagem principal está entre as válidas
            if (!processedImages[0]) {
                return createErrorResponse('A imagem principal não é válida', 400);
            }

            logger.info("Imagens válidas", validImages);

            logger.info("Realizando upload das imagens");

            try {
                // Usando um array para coletar erros durante o upload
                const uploadErrors: Error[] = [];
                const imageUrls: string[] = [];

                // Upload de cada imagem individualmente para capturar erros específicos
                for (let i = 0; i < validImages.length; i++) {
                    const img = validImages[i];
                    try {
                        logger.info(`Iniciando upload da imagem ${i}`, {
                            originalName: img.originalName,
                            bufferSize: img.buffer.length
                        });
                        
                        const url = await uploadToS3(img.buffer, session.user.id, img.originalName);
                        imageUrls.push(url);
                        
                        logger.info(`Upload da imagem ${i} concluído: ${url}`);
                    } catch (error) {
                        logger.error(`Erro ao fazer upload da imagem ${i}:`, error);
                        uploadErrors.push(error as Error);
                    }
                }

                // Se houver qualquer erro de upload, não prosseguir com a criação do prêmio
                if (uploadErrors.length > 0) {
                    logger.error(`${uploadErrors.length} erros ocorreram durante o upload das imagens`);
                    return createErrorResponse(`Falha no upload de ${uploadErrors.length} imagens. O prêmio não foi criado.`, 500);
                }

                // Verificar se temos pelo menos a imagem principal
                if (imageUrls.length === 0) {
                    return createErrorResponse('Nenhuma imagem foi enviada com sucesso', 500);
                }

                console.log("imageUrls", imageUrls);
                console.log("imageUrls.length", imageUrls.length);

                logger.info("Upload das imagens realizado com sucesso", {
                    urlsCount: imageUrls.length,
                    urls: imageUrls
                });

                const mainImageUrl = imageUrls[0];
                const otherImagesUrls = imageUrls.slice(1);
                
                logger.info("URLs separadas", {
                    mainImageUrl,
                    otherImagesCount: otherImagesUrls.length
                });

                // Criar o prêmio apenas se todas as imagens foram enviadas com sucesso
                return await this.prizeRepository.createPrize({
                    name: prize.name,
                    description: prize.description,
                    value: prize.value,
                    userCode: session.user.id,
                    image: mainImageUrl,
                    images: otherImagesUrls
                });
            } catch (error) {
                logger.error("Erro durante o processo de upload:", error);
                return createErrorResponse('Falha no processo de upload das imagens. O prêmio não foi criado.', 500);
            }

        } catch (error) {
            logger.error("Erro ao processar requisição de criação de prêmio:", error);
            throw new ApiError({
                success: false,
                message: 'Service: Erro ao processar a criação do prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }       

    async updatePrize(id: string, updatedData: Record<string, any>): Promise<ApiResponse<IPrize> | ApiResponse<null>> {
        try {
            const session = await getServerSession(nextAuthOptions);
            logger.info("Verificando sessão para atualização de prêmio", session);

            if (!session?.user?.id) {
                return createErrorResponse('Não autorizado', 401);
            }

            const userCode = session.user.id;

            // Aplicar rate limiting
            const limiter = rateLimit({
                interval: 60 * 1000,
                uniqueTokenPerInterval: 500,
                tokensPerInterval: 15 // Permitir mais atualizações que criações
            });

            try {
                await limiter.check(15, `${userCode}:premio-update`);
            } catch {
                return createErrorResponse('Muitas requisições, tente novamente mais tarde', 429);
            }

            // Verificar se o prêmio existe e pertence ao usuário
            const existingPrizeResponse = await this.prizeRepository.getPrizeById(id);
            
            if (!existingPrizeResponse.success) {
                return createErrorResponse('Prêmio não encontrado', 404);
            }

            const existingPrize = existingPrizeResponse.data;
            
            // Processar imagens se foram atualizadas
            const processedUpdates: Record<string, any> = { ...updatedData };
            delete processedUpdates.image; // Remover temporariamente para processamento separado
            delete processedUpdates.images; // Remover temporariamente para processamento separado

            // Processar imagem principal se foi atualizada
            if (updatedData.image && typeof updatedData.image !== 'string') {
                logger.info("Processando nova imagem principal");
                try {
                    const processedImage = await processImage(updatedData.image);
                    
                    if (processedImage) {
                        const imageUrl = await uploadToS3(
                            processedImage.buffer, 
                            userCode, 
                            processedImage.originalName
                        );
                        processedUpdates.image = imageUrl;
                        logger.info("Nova imagem principal processada com sucesso", { imageUrl });
                    } else {
                        return createErrorResponse('Falha ao processar a imagem principal', 400);
                    }
                } catch (error) {
                    logger.error("Erro ao processar imagem principal:", error);
                    return createErrorResponse('Erro ao processar a imagem principal', 500);
                }
            } else if (updatedData.image) {
                // Se a imagem é uma string (URL), mantê-la como está
                processedUpdates.image = updatedData.image;
            }

            // Processar imagens adicionais se foram atualizadas
            if (updatedData.images && Array.isArray(updatedData.images)) {
                logger.info("Processando novas imagens adicionais");
                
                const imagesToProcess = updatedData.images.filter(img => 
                    img && typeof img !== 'string' && 'name' in img && 'type' in img && 'size' in img
                );
                
                const existingImageUrls = updatedData.images.filter(img => 
                    typeof img === 'string'
                );
                
                if (imagesToProcess.length > 0) {
                    try {
                        const processedImages = await Promise.all(
                            imagesToProcess.map(async (image) => {
                                return await processImage(image as File);
                            })
                        );
                        
                        const validImages = processedImages.filter(Boolean) as { buffer: Buffer, originalName: string }[];
                        
                        const uploadedImageUrls = await Promise.all(
                            validImages.map(async (img) => {
                                return await uploadToS3(img.buffer, userCode, img.originalName);
                            })
                        );
                        
                        // Combinar URLs existentes com novas URLs
                        processedUpdates.images = [...existingImageUrls, ...uploadedImageUrls];
                        logger.info("Novas imagens adicionais processadas com sucesso", { 
                            count: processedUpdates.images.length 
                        });
                    } catch (error) {
                        logger.error("Erro ao processar imagens adicionais:", error);
                        return createErrorResponse('Erro ao processar as imagens adicionais', 500);
                    }
                } else {
                    // Se todas as imagens são strings (URLs), mantê-las como estão
                    processedUpdates.images = existingImageUrls;
                }
            }
            
            // Atualizar o prêmio no banco de dados
            return await this.prizeRepository.updatePrize(id, processedUpdates, userCode);
        } catch (error) {
            logger.error("Erro ao processar atualização de prêmio:", error);
            throw new ApiError({
                success: false,
                message: 'Erro ao atualizar o prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }
}