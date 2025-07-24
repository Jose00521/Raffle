import { inject, injectable } from "tsyringe";
import type { ICreatorPaymentGatewayRepository } from "@/server/repositories/CreatorPaymentGatewayRepository";
import { IUserPaymentGateway } from "@/models/interfaces/IPaymentGatewayInterfaces";
import { ApiResponse } from "../utils/errorHandler/api";


export interface ICreatorPaymentGatewayService {
    integrateGateway(data: Partial<IUserPaymentGateway>, userCode: string): Promise<ApiResponse<null> | ApiResponse<IUserPaymentGateway>>;
    getDefaultPaymentGateway(userCode: string): Promise<ApiResponse<IUserPaymentGateway>>;
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
}