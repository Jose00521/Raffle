import { inject, injectable } from "tsyringe";
import type { ICreatorPaymentGatewayService } from "../services/CreatorPaymentGatewayService";
import { IUserPaymentGateway } from "@/models/interfaces/IPaymentGatewayInterfaces";
import { ApiResponse } from "../utils/errorHandler/api";
import { IPaymentGatewayTemplate } from "@/models/interfaces/IPaymentGatewayTemplateInterfaces";

export interface ICreatorPaymentGatewayController {
    integrateGateway(data: Partial<IUserPaymentGateway>, userCode: string): Promise<ApiResponse<null> | ApiResponse<IUserPaymentGateway>>;
    getDefaultPaymentGateway(userCode: string): Promise<ApiResponse<IUserPaymentGateway>>;
    getMyGateways(userCode: string): Promise<ApiResponse<IUserPaymentGateway[]>>;
    getAvailableGateways(): Promise<ApiResponse<IPaymentGatewayTemplate[]>>;
    setAsDefaultGateway(userCode: string, gatewayCode: string): Promise<ApiResponse<null>>;
    deleteGateway(userCode: string, gatewayCode: string): Promise<ApiResponse<null>>;
}


@injectable()
export class CreatorPaymentGatewayController {

    constructor(
        @inject('creatorPaymentGatewayService')  private creatorPaymentGatewayService: ICreatorPaymentGatewayService
    ) {}


    async integrateGateway(data: Partial<IUserPaymentGateway>, userCode: string) {
        return await this.creatorPaymentGatewayService.integrateGateway(data, userCode);
    }

    async getDefaultPaymentGateway(userCode: string) {
        return await this.creatorPaymentGatewayService.getDefaultPaymentGateway(userCode);
    }

    async getMyGateways(userCode: string): Promise<ApiResponse<IUserPaymentGateway[] | null>> {
        return await this.creatorPaymentGatewayService.getMyGateways(userCode);
    }

    async deleteGateway(userCode: string, gatewayCode: string) {
        return await this.creatorPaymentGatewayService.deleteGateway(userCode, gatewayCode);
    }

    async setAsDefaultGateway(userCode: string, gatewayCode: string) {
        return await this.creatorPaymentGatewayService.setAsDefaultGateway(userCode, gatewayCode);
    }
}