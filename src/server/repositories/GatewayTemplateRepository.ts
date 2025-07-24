import { IPaymentGatewayTemplate, PaymentGatewayTemplateStatus } from "@/models/interfaces/IPaymentGatewayTemplateInterfaces";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import PaymentGatewayTemplate from "@/models/PaymentGatewayTemplate";
import { ApiError } from "../utils/errorHandler/ApiError";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { Admin } from "@/models/User";

export interface IGatewayTemplateRepository {
    getAllGatewayTemplates(): Promise<ApiResponse<IPaymentGatewayTemplate[]>>;
    createGatewayTemplate(gatewayTemplate: Partial<IPaymentGatewayTemplate>, adminCode: string): Promise<ApiResponse<null> | ApiResponse<IPaymentGatewayTemplate>>;
    verifyIfAlreadyExists(templateCode: string, adminCode: string): Promise<ApiResponse<boolean> | ApiResponse<null>>;
}

@injectable()
export class GatewayTemplateRepository implements IGatewayTemplateRepository {  
    
    constructor(
        @inject("db") private db: IDBConnection
    ){}

    async getAllGatewayTemplates(): Promise<ApiResponse<IPaymentGatewayTemplate[]>> {
        try {
            await this.db.connect();

            const gatewayTemplates = await PaymentGatewayTemplate!.find({
                status: PaymentGatewayTemplateStatus.ACTIVE,
                isPublic: true
            });

            console.log("gatewayTemplates", gatewayTemplates);

            return createSuccessResponse(gatewayTemplates, 'Templates de gateway encontrados com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar templates de gateway',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async createGatewayTemplate(gatewayTemplate: Partial<IPaymentGatewayTemplate>, adminCode: string): Promise<ApiResponse<null> | ApiResponse<IPaymentGatewayTemplate>> {
        try {
            await this.db.connect();

            const admin = await Admin!.findOne({
                userCode: adminCode
            });

            console.log("admin", admin);

            if(!admin){
                return createErrorResponse('Admin não encontrado', 404);
            }

            if(PaymentGatewayTemplate){
                const gatewayTemplateModel = new PaymentGatewayTemplate({
                    ...gatewayTemplate,
                    createdBy: admin._id,
                    updatedBy: admin._id
                });
    
                gatewayTemplateModel.templateUniqueCode = generateEntityCode(gatewayTemplateModel._id, 'GT');
    
                //salva o usuário
                await gatewayTemplateModel.save();
                return createSuccessResponse(gatewayTemplateModel, 'Template de gateway criado com sucesso', 200);
            }else{
                return createErrorResponse('Erro ao criar template de gateway', 500);
            }

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar criador',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async verifyIfAlreadyExists(templateCode: string, adminCode: string): Promise<ApiResponse<boolean> | ApiResponse<null>> {
        try {
            await this.db.connect();

            console.log('templateCode',templateCode);
            console.log('adminCode',adminCode);

            const admin = await Admin!.findOne({
                userCode: adminCode
            });

            if(!admin){
                return createErrorResponse('Admin não encontrado', 404);
            }

            const gatewayTemplate = await PaymentGatewayTemplate!.findOne({
                templateCode: templateCode,
                createdBy: admin._id
            });

            if(gatewayTemplate){
                return createSuccessResponse(true, 'Template de gateway encontrado com sucesso', 200);
            }else{
                return createSuccessResponse(false, 'Template de gateway não encontrado', 200);
            }
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao verificar se o template já existe',
                statusCode: 500,
                cause: error as Error
            });
        }
    }
}