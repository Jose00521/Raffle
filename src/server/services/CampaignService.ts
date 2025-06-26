import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { injectable, inject } from 'tsyringe';
import type { ICampaignRepository } from '@/server/repositories/CampaignRepository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/errorHandler/api';
import { ApiError } from '../utils/errorHandler/ApiError';
import { getServerSession, Session } from 'next-auth';
import { nextAuthOptions } from '@/lib/auth/nextAuthOptions';
import logger from '@/lib/logger/logger';
import { rateLimit } from '@/lib/rateLimit';
import { processImage } from '@/lib/upload-service/processImage';
import { uploadToS3 } from '@/lib/upload-service/client/uploadToS3';

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

interface IFile {
  type: string
  name:string
  size:number
}

// Interface para o formato de entrada do frontend
interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

export interface ICampaignService {
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
export class CampaignService implements ICampaignService {
  private campaignRepository: ICampaignRepository;

  constructor(
    @inject('campaignRepository') campaignRepository: ICampaignRepository
  ) {
    this.campaignRepository = campaignRepository;
  }
  /**
   * Obtém todas as campanhas ativas com suas estatísticas
   */
  async listActiveCampaignsPublic(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>> {
    try {


      const campanhas: ICampaign[] | ApiResponse<null> = await this.campaignRepository.listActiveCampaignsPublic();
    
      
      return createSuccessResponse(campanhas as ICampaign[], 'Campanhas ativas carregadas com sucesso', 200);
    } catch (error) {
      console.error('Erro ao listar campanhas ativas:', error);
      throw new ApiError({
        success: false,
        message: 'Erro ao listar campanhas ativas',
        statusCode: 500,
        cause: error as Error
      });
    }
  }

  async listActiveCampaigns(session: Session): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>> {
    const userCode = session.user.id;
    return await this.campaignRepository.listActiveCampaigns(userCode);
  }

  async getCampaignById(id: string, userCode: string): Promise<ApiResponse<ICampaign | null>> {
    try {
      return await this.campaignRepository.getCampaignById(id, userCode as string);
    } catch (error) {
      return createErrorResponse('Erro ao buscar campanha por ID:', 500);
    }
  }

  async getCampaignByIdPublic(id: string): Promise<ApiResponse<ICampaign | null>> {
    return await this.campaignRepository.getCampaignByIdPublic(id);
  }

  async toggleCampaignStatus(id: string): Promise<ApiResponse<ICampaign | null>> {
    try {
      return await this.campaignRepository.toggleCampaignStatus(id);
    } catch (error) {
      return createErrorResponse('Erro ao ativar/desativar campanha:', 500);
    }
  }

  async deleteCampaign(id: string, session: Session): Promise<ApiResponse<ICampaign | null>> {
    try {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
        tokensPerInterval: 10
      });


    console.log("campaignId delete", id);

    // Aplicar rate limiting
    try {
        await limiter.check(10, `${session.user.id}:campaign-delete`);
    } catch {
        return createErrorResponse('Muitas requisições, tente novamente mais tarde', 429);

    }

    logger.info("Sessão válida", session);

    return await this.campaignRepository.deleteCampaign(id, session.user.id);
  } catch (error) {
    console.error('Erro ao excluir campanha:', error);
    throw new ApiError({
      success: false,
      message: 'Erro ao excluir campanha',
      statusCode: 500,
      cause: error as Error
    });
  }
}

  /**
   * Método privado para calcular estatísticas de uma campanha
   */
  private async obterEstatisticasCampanha(rifaId: string) {
    const statusCountArray = await this.campaignRepository.contarNumeroPorStatus(rifaId);
    
    // Inicializar estatísticas
    const stats = {
      totalNumbers: 0,
      available: 0,
      reserved: 0,
      sold: 0,
      percentComplete: 0
    };
    
    // Processar contagens por status
    statusCountArray.forEach(item => {
      if (item.status === NumberStatusEnum.AVAILABLE) {
        stats.available = item.count;
      } else if (item.status === NumberStatusEnum.RESERVED) {
        stats.reserved = item.count;
      } else if (item.status === NumberStatusEnum.PAID) {
        stats.sold = item.count;
      }
    });
    
    // Calcular totais
    stats.totalNumbers = stats.available + stats.reserved + stats.sold;
    stats.percentComplete = stats.totalNumbers > 0 
      ? Math.round((stats.sold / stats.totalNumbers) * 100) 
      : 0;
    
    return stats;
  }

  /**
   * 🚀 ATUALIZADO: Criar nova campanha com novo formato de prêmios instantâneos
   */
  async criarNovaCampanha(campaignData: ICampaign, session: Session, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>> {
    try {
      const limiter = rateLimit({
        interval: 60 * 1000,
        uniqueTokenPerInterval: 500,
        tokensPerInterval: 10
      });

    console.log("campaignData", campaignData);

    // Aplicar rate limiting
    try {
        await limiter.check(10, `${session.user.id}:premio-create`);
    } catch {
        return createErrorResponse('Muitas requisições, tente novamente mais tarde', 429);

    }

    logger.info("Sessão válida", session);
            
    // Log para debugging - verificar entradas
    logger.info("Objeto Campaign recebido:", {
      campaignData,
      instantPrizesData
    });

    if (!campaignData.coverImage) {
      return createErrorResponse('A imagem de capa é obrigatória', 400);
    }

    logger.info("Processando imagens");
    const processedImages = await Promise.all(
        [campaignData.coverImage, ...campaignData.images].map(async (image: any | string, index: number) => {
            logger.info(`Processando imagem ${index}`, {
                type: image && typeof image !== 'string'  ? image.type : 'string',
                size: image && typeof image !== 'string'? image.size : 0
            });
            return processImage(image as any);
        })
    );

    const validImages = processedImages.filter(Boolean) as { buffer: Buffer, originalName: string }[];
    logger.info("Número de imagens válidas:", validImages.length);

    if (!validImages.length) {
      return createErrorResponse('Nenhuma imagem válida para upload', 400);
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
            
            const url = await uploadToS3(img.buffer, session.user.id, "rifas/campaigns", img.originalName);
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

    console.log("campaignData", campaignData);
      // Usar o método atualizado do repository
      const novaCampanha = await this.campaignRepository.criarNovaCampanha(
        {
          ...campaignData,
          coverImage: mainImageUrl,
          images: otherImagesUrls
        }, 
        instantPrizesData
      );
      
      console.log(`✅ Service: Campanha criada com sucesso - ID: ${novaCampanha._id}`);

      return createSuccessResponse(
        novaCampanha, 
        'Campanha criada com sucesso', 
        201
      );
} catch (error) {
    logger.error({
      error: error as Error,
      message: 'Falha no processo de upload das imagens. O prêmio não foi criado.',
      statusCode: 500
    });
    return createErrorResponse('Falha no processo de upload das imagens. O prêmio não foi criado.', 500);
}


      
    } catch (error) {
      console.error('Erro no service ao criar nova campanha:', error);
      throw new ApiError({
        success: false,
        message: 'Erro ao criar nova campanha',
        statusCode: 500,
        cause: error as Error
      });
    }
  }

  async updateCampaign(id: string, session: Session, updatedCampaign: Partial<ICampaign>): Promise<ApiResponse<ICampaign> | ApiResponse<null>> {
    try {
      const userCode = session?.user?.id;

      console.log("updatedData",updatedCampaign);
      console.log("id",id);

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

      const existingCampaignResponse = await this.campaignRepository.getCampaignById(id, userCode);

      if (!existingCampaignResponse.success) {
        return createErrorResponse('Campanha não encontrada', 404);
      }

            // Processar imagens se foram atualizadas
      const processedUpdates: Record<string, any> = { ...updatedCampaign };
      delete processedUpdates.coverImage; // Remover temporariamente para processamento separado
      delete processedUpdates.images; // Remover temporariamente para processamento separado

                  // Processar imagem principal se foi atualizada
                  if (updatedCampaign.coverImage && typeof updatedCampaign.coverImage !== 'string') {
                    logger.info("Processando nova imagem principal");
                    try {
                        const processedImage = await processImage(updatedCampaign.coverImage);
                        
                        if (processedImage) {
                            const imageUrl = await uploadToS3(
                                processedImage.buffer, 
                                userCode, 
                                "rifas/campaigns",
                                processedImage.originalName
                            );
                            processedUpdates.coverImage = imageUrl;
                            logger.info("Nova imagem principal processada com sucesso", { imageUrl });
                        } else {
                            return createErrorResponse('Falha ao processar a imagem principal', 400);
                        }
                    } catch (error) {
                        logger.error("Erro ao processar imagem principal:", error);
                        return createErrorResponse('Erro ao processar a imagem principal', 500);
                    }
                } else if (updatedCampaign.coverImage) {
                    // Se a imagem é uma string (URL), mantê-la como está
                    processedUpdates.coverImage = updatedCampaign.coverImage;
                }
    
                // Processar imagens adicionais se foram atualizadas
                if (updatedCampaign.images && Array.isArray(updatedCampaign.images)) {
                    logger.info("Processando novas imagens adicionais");
                    
                    const imagesToProcess = updatedCampaign.images.filter(img => 
                        img && typeof img !== 'string' && 'name' in img && 'type' in img && 'size' in img
                    );
                    
                    const existingImageUrls = updatedCampaign.images.filter(img => 
                        typeof img === 'string'
                    );
                    
                    if (imagesToProcess.length > 0) {
                        try {
                            const processedImages = await Promise.all(
                                imagesToProcess.map(async (image) => {
                                    return await processImage(image as any);
                                })
                            );
                            
                            const validImages = processedImages.filter(Boolean) as { buffer: Buffer, originalName: string }[];
                            
                            const uploadedImageUrls = await Promise.all(
                                validImages.map(async (img) => {
                                    return await uploadToS3(img.buffer, userCode, "rifas/campaigns", img.originalName);
                                })
                            );
                            
                            // Combinar URLs existentes com novas URLs
                            processedUpdates.images = [...existingImageUrls, ...uploadedImageUrls];
                            logger.info("Novas imagens adicionais processadas com sucesso", { 
                                count: processedUpdates.images.length 
                            });
                        } catch (error) {
                            logger.error("Erro ao processar imagens adicionais:", error);
                            throw new ApiError({
                              success: false,
                              message: 'Erro ao processar as imagens adicionais',
                              statusCode: 500,
                              cause: error as Error
                            });
                        }
                    } else {
                        // Se todas as imagens são strings (URLs), mantê-las como estão
                        processedUpdates.images = existingImageUrls;
                    }
                }

      const campaignUpdated = await this.campaignRepository.updateCampaign(id, userCode, processedUpdates);

      return campaignUpdated as ApiResponse<ICampaign> | ApiResponse<null>;



    } catch (error) {
      throw new ApiError({
        success: false,
        message: 'Erro ao atualizar campanha:',
        statusCode: 500,
        cause: error as Error
      });
    }
  }
} 