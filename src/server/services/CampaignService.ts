import { NumberStatusEnum } from '@/models/interfaces/INumberStatusInterfaces';
import { ICampaign } from '@/models/interfaces/ICampaignInterfaces';
import { injectable, inject } from 'tsyringe';
import type { ICampaignRepository } from '@/server/repositories/CampaignRepository';
import { ApiResponse, createSuccessResponse, createErrorResponse } from '../utils/errorHandler/api';
import { ApiError } from '../utils/errorHandler/ApiError';
import { getServerSession } from 'next-auth';
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

// Interface para o formato de entrada do frontend
interface InstantPrizesPayload {
  prizes: InstantPrizeData[];
}

export interface ICampaignService {
  listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>>;
  obterDetalhesCampanha(id: string): Promise<ApiResponse<ICampaign | null>>;
  criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>>;
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
  async listarCampanhasAtivas(): Promise<ApiResponse<ICampaign[]> | ApiResponse<null>> {
    try {
      const session = await getServerSession(nextAuthOptions);

      if(!session){
        return createErrorResponse('Não autorizado', 401);
      }

      const userCode = session.user.id;

      const campanhas: ICampaign[] | ApiResponse<null> = await this.campaignRepository.buscarCampanhasAtivas(userCode);
    
      
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

  /**
   * Obtém detalhes completos de uma campanha por ID
   */
  async obterDetalhesCampanha(campaignCode: string): Promise<{statusCode: number, success: boolean, data: ICampaign | null , error: string | null}> {
    try {
      const campanha: ICampaign | null = await this.campaignRepository.buscarCampanhaPorId(campaignCode);
      
      if (!campanha) {
        return {
          statusCode: 404,
          success: false,
          data: null,
          error: 'Campanha não encontrada',
        };
      }
      
      // Obter estatísticas
      // const stats = await this.obterEstatisticasCampanha(id);
      
      // // Obter últimos números vendidos
      // const recentSales = await CampaignRepository.buscarUltimosNumerosVendidos(id);
      
      // // Construir resposta completa
      // const campanhaCompleta = {
      //   ...campanha,
      //   stats,
      //   recentSales
      // };
      
      return {
        statusCode: 200,
        success: true,
        error: null,
        data: campanha
      };
    } catch (error) {
      console.error('Erro ao obter detalhes da campanha:', error);
      return {
        statusCode: 500,
        success: false,
        data: null,
        error: 'Falha ao carregar os detalhes da campanha'
      };
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
  async criarNovaCampanha(campaignData: ICampaign, instantPrizesData?: InstantPrizesPayload): Promise<ApiResponse<ICampaign> | ApiResponse<null>> {
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
        [campaignData.coverImage, ...campaignData.images].map(async (image: File | string, index: number) => {
            logger.info(`Processando imagem ${index}`, {
                type: image instanceof File ? image.type : 'string',
                size: image instanceof File ? image.size : 0
            });
            return processImage(image as File);
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
        'Campanha criada com sucesso. Números, ranges, partições e estatísticas inicializados.', 
        201
      );
} catch (error) {
    logger.error("Erro durante o processo de upload:", error);
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
} 