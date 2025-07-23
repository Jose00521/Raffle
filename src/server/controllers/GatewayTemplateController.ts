import { inject, injectable } from "tsyringe";
import { ApiResponse } from "../utils/errorHandler/api";
import { IPaymentGatewayTemplate } from "@/models/interfaces/IPaymentGatewayTemplateInterfaces";
import type { IGatewayTemplateService } from "../services/GatewayTemplateService";
import { Session } from "next-auth";    

export interface IGatewayTemplateController {
    getAllGatewayTemplates(): Promise<ApiResponse<IPaymentGatewayTemplate[]>>;
    createGatewayTemplate(gatewayTemplate: Partial<IPaymentGatewayTemplate>, session: Session): Promise<ApiResponse<null> | ApiResponse<IPaymentGatewayTemplate>>;
}

@injectable()
export class GatewayTemplateController implements IGatewayTemplateController {

    constructor(
        @inject('gatewayTemplateService') private gatewayTemplateService: IGatewayTemplateService
    ){}

    async getAllGatewayTemplates(): Promise<ApiResponse<IPaymentGatewayTemplate[]>> {
        return await this.gatewayTemplateService.getAllGatewayTemplates();
    }

    async createGatewayTemplate(gatewayTemplate: Partial<IPaymentGatewayTemplate>, session: Session): Promise<ApiResponse<null> | ApiResponse<IPaymentGatewayTemplate>> {
        return await this.gatewayTemplateService.createGatewayTemplate(gatewayTemplate, session);
    }
}