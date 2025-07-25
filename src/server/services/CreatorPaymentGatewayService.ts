import { inject, injectable } from "tsyringe";
import type { ICreatorPaymentGatewayRepository } from "@/server/repositories/CreatorPaymentGatewayRepository";
import { IUserPaymentGateway } from "@/models/interfaces/IPaymentGatewayInterfaces";
import { ApiResponse } from "../utils/errorHandler/api";


export interface ICreatorPaymentGatewayService {
    integrateGateway(data: Partial<IUserPaymentGateway>, userCode: string): Promise<ApiResponse<null> | ApiResponse<IUserPaymentGateway>>;
    getDefaultPaymentGateway(userCode: string): Promise<ApiResponse<IUserPaymentGateway>>;
    getMyGateways(userCode: string): Promise<ApiResponse<IUserPaymentGateway[] | null>>;
    setAsDefaultGateway(userCode: string, gatewayCode: string): Promise<ApiResponse<null>>;
}


@injectable()
export class CreatorPaymentGatewayService {

    constructor(
        @inject('creatorPaymentGatewayRepository')  private creatorPaymentGatewayRepository: ICreatorPaymentGatewayRepository
    ) {}


    async integrateGateway(data: Partial<IUserPaymentGateway>, userCode: string) {
        return await this.creatorPaymentGatewayRepository.integrateGateway(data, userCode);
    }

    async getDefaultPaymentGateway(userCode: string) {
        return await this.creatorPaymentGatewayRepository.getDefaultPaymentGateway(userCode);
    }

    async getMyGateways(userCode: string): Promise<ApiResponse<IUserPaymentGateway[] | null>> {
        return await this.creatorPaymentGatewayRepository.getMyGateways(userCode);
    }

    async setAsDefaultGateway(userCode: string, gatewayCode: string) {
        return await this.creatorPaymentGatewayRepository.setAsDefaultGateway(userCode, gatewayCode);
    }
}