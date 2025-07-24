import { IPaymentGatewayTemplate } from "@/models/interfaces/IPaymentGatewayTemplateInterfaces";
import { ApiResponse, createErrorResponse } from "../utils/errorHandler/api";
import { inject, injectable } from "tsyringe";
import type { IGatewayTemplateRepository } from "../repositories/GatewayTemplateRepository";
import { ApiError } from "../utils/errorHandler/ApiError";
import { rateLimit } from "@/lib/rateLimit";
import { Session } from "next-auth";
import logger from "@/lib/logger/logger";
import { processImage } from "@/lib/upload-service/processImage";
import { uploadToS3 } from "@/lib/upload-service/client/uploadToS3";

export interface IGatewayTemplateService {
    getAllGatewayTemplates(): Promise<ApiResponse<IPaymentGatewayTemplate[]>>;
    createGatewayTemplate(gatewayTemplate: Partial<IPaymentGatewayTemplate>, session: Session): Promise<ApiResponse<null> | ApiResponse<IPaymentGatewayTemplate>>;
    verifyIfAlreadyExists(templateCode: string, adminCode: string): Promise<ApiResponse<boolean> | ApiResponse<null>>;
}

@injectable()
export class GatewayTemplateService implements IGatewayTemplateService {
    constructor(
        @inject('gatewayTemplateRepository') private gatewayTemplateRepository: IGatewayTemplateRepository
    ){}

    async getAllGatewayTemplates(): Promise<ApiResponse<IPaymentGatewayTemplate[]>> {
        return await this.gatewayTemplateRepository.getAllGatewayTemplates();
    }

    async createGatewayTemplate(gatewayTemplate: Partial<IPaymentGatewayTemplate>, session: Session): Promise<ApiResponse<null> | ApiResponse<IPaymentGatewayTemplate>> {
        try{
            const limiter = rateLimit({
                interval: 60 * 1000,
                uniqueTokenPerInterval: 500,
                tokensPerInterval: 10
              });


              const adminCode = session?.user?.id;

              // Aplicar rate limiting
              try {
                  await limiter.check(10, `${adminCode}:premio-create`);
              } catch {
                  return createErrorResponse('Muitas requisições, tente novamente mais tarde', 429);
              }
  
              logger.info("Sessão válida", session);
              
              // Log para debugging - verificar entradas
              logger.info("Objeto gatewayTemplate recebido:", gatewayTemplate);

              if(!gatewayTemplate.logo){
                return createErrorResponse('Logo é obrigatório', 400);
              }
              
              const processedLogo = await processImage(gatewayTemplate.logo as any);

              if(!Boolean(processedLogo)){
                return createErrorResponse('Logo inválida', 400);
              }

              logger.info("Logo válida", processedLogo);

              logger.info("Realizando upload da logo");

              let imageUrl: string | null = null;

              try{
                logger.info(`Iniciando upload da logo`, {
                    originalName: processedLogo!.originalName,
                    bufferSize: processedLogo!.buffer.length
                });

                imageUrl = await uploadToS3(processedLogo!.buffer, session.user.id, "rifas/gateways/templates/logos", processedLogo!.originalName);

                logger.info(`Upload da logo concluído: ${imageUrl}`);

                if(!Boolean(imageUrl)){
                    return createErrorResponse('Logo não foi enviada com sucesso', 500);
                }
                
              }catch(error){
                logger.error("Erro ao fazer upload da logo", error);
                return createErrorResponse('Erro ao fazer upload da logo', 500);
              }

              logger.info("Criando template de gateway");
              return await this.gatewayTemplateRepository.createGatewayTemplate({
                  ...gatewayTemplate,
                  logo: imageUrl
              }, adminCode as string);


        }catch(error){
            throw new ApiError({
                success: false,
                message: 'Erro ao criar template de gateway',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async verifyIfAlreadyExists(templateCode: string, adminCode: string): Promise<ApiResponse<boolean> | ApiResponse<null>> {
        return await this.gatewayTemplateRepository.verifyIfAlreadyExists(templateCode, adminCode);
    }
}