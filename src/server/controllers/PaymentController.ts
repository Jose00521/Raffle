import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiResponse } from "../utils/errorHandler/api";
import type { IPaymentService } from "../services/PaymentService";
import { IPayment, IPaymentGhostResponse, IPaymentGhostWebhookPost, IPaymentPaginationRequestServer, IPaymentPaginationResponse, IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";
import { ICampaign } from "@/models/interfaces/ICampaignInterfaces";
import { IUser } from "@/models/interfaces/IUserInterfaces";

export interface IPaymentController {
    getMyNumbers(cpf: string, campaignCode: string): Promise<ApiResponse<{
        cpf: string;
        campaign: Partial<ICampaign>;
        user: Partial<IUser>;
        paymentCurrentCampaign: IPayment[];
        otherPayments: IPayment[];
    } | null>>;

    getPaymentsByCreatorId(pagination: IPaymentPaginationRequestServer): Promise<ApiResponse<IPaymentPaginationResponse | null>>;
    getLatestPaymentsByCreatorId(pagination: Partial<IPaymentPaginationRequestServer>): Promise<ApiResponse<Partial<IPaymentPaginationResponse> | null>>;

    createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
        idempotencyKey?: string;
    }): Promise<ApiResponse<IPayment> | ApiResponse<null>>;

    updatePixPaymentToPending(data: {
        paymentCode: string;
        gatewayResponse: IPaymentGhostResponse;
    }): Promise<ApiResponse<{
        paymentCode: string;
        pixCode: string;
        pixQrCode: string;
        expiresAt: string | Date | undefined;
    }> | ApiResponse<null>>;

    updatePixPaymentToFailed(data: {
        paymentCode: string;
        gatewayResponse: Partial<IPaymentGhostResponse>;
    }): Promise<ApiResponse<null>>;

    confirmPixPayment(data:IPaymentGhostWebhookPost): Promise<ApiResponse<IPayment> | ApiResponse<null>>;
}


@injectable()
export class PaymentController implements IPaymentController {
    private paymentService: IPaymentService;

    constructor(
        @inject("paymentService") paymentService: IPaymentService
    ) {
        this.paymentService = paymentService;
    }

    async getMyNumbers(cpf: string, campaignCode: string): Promise<ApiResponse<{
        cpf: string;
        campaign: Partial<ICampaign>;
        user: Partial<IUser>;
        paymentCurrentCampaign: IPayment[];
        otherPayments: IPayment[];
    } | null>> {
        return this.paymentService.getMyNumbers(cpf, campaignCode);
    }

    async getPaymentsByCreatorId(pagination: IPaymentPaginationRequestServer): Promise<ApiResponse<IPaymentPaginationResponse | null>> {
        return this.paymentService.getPaymentsByCreatorId(pagination);
    }

    async getLatestPaymentsByCreatorId(pagination: Partial<IPaymentPaginationRequestServer>): Promise<ApiResponse<Partial<IPaymentPaginationResponse> | null>> {
        return this.paymentService.getLatestPaymentsByCreatorId(pagination);
    }

    async createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
        idempotencyKey?: string;
    }): Promise<ApiResponse<IPayment> | ApiResponse<null>> {
        return this.paymentService.createInitialPixPaymentAttempt(data);
    }

    async confirmPixPayment(data: IPaymentGhostWebhookPost): Promise<ApiResponse<IPayment> | ApiResponse<null>> {
        return this.paymentService.confirmPixPayment(data);
    }


    async updatePixPaymentToPending(data: {
        paymentCode: string;
        gatewayResponse: IPaymentGhostResponse;
    }): Promise<ApiResponse<{
        paymentCode: string;
        pixCode: string;
        pixQrCode: string;
        expiresAt: string | Date | undefined;
    }> | ApiResponse<null>> {
        return this.paymentService.updatePixPaymentToPending(data);
    }

    async updatePixPaymentToFailed(data: {
        paymentCode: string;
        gatewayResponse: Partial<IPaymentGhostResponse>;
    }): Promise<ApiResponse<null>> {
        return this.paymentService.updatePixPaymentToFailed(data);
    }
}