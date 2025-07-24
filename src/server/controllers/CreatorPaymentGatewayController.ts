import { inject, injectable } from "tsyringe";
import type { ICreatorPaymentGatewayService } from "../services/CreatorPaymentGatewayService";
import { IUserPaymentGateway } from "@/models/interfaces/IPaymentGatewayInterfaces";
import { ApiResponse } from "../utils/errorHandler/api";

export interface ICreatorPaymentGatewayController {
    integrateGateway(data: Partial<IUserPaymentGateway>, userCode: string): Promise<ApiResponse<null> | ApiResponse<IUserPaymentGateway>>;
    getDefaultPaymentGateway(userCode: string): Promise<ApiResponse<IUserPaymentGateway>>;
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
}