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
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
}

@injectable()
export class PrizeService implements IPrizeService {
    private prizeRepository: IPrizeRepository;

    constructor(
        @inject('prizeRepository') prizeRepository: IPrizeRepository
    ) {
        this.prizeRepository = prizeRepository;
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

            logger.info("Imagens válidas", validImages);

            logger.info("Realizando upload das imagens");

            const uploadPromises = validImages.map((img, index) => {
                logger.info(`Iniciando upload da imagem ${index}`, {
                    originalName: img.originalName,
                    bufferSize: img.buffer.length
                });
                return uploadToS3(img.buffer, session.user.id, img.originalName);
            });

            const imageUrls = await Promise.all(uploadPromises);

            console.log("imageUrls",imageUrls);
            console.log("imageUrls.length", imageUrls.length);

            logger.info("Upload das imagens realizado", {
                urlsCount: imageUrls.length,
                urls: imageUrls
            });

            const mainImageUrl = imageUrls[0];
            const otherImagesUrls = imageUrls.slice(1);
            
            logger.info("URLs separadas", {
                mainImageUrl,
                otherImagesCount: otherImagesUrls.length
            });

            return await this.prizeRepository.createPrize({
                name: prize.name,
                description: prize.description,
                value: prize.value,
                image: mainImageUrl,
                images: otherImagesUrls
            });

        } catch (error) {
            logger.error("Erro ao salvar imagens:", error);
            throw new ApiError({
                success: false,
                message: 'Service: Erro ao Salvar as imagens',
                statusCode: 500,
                cause: error as Error
            });
        }
    }       
}