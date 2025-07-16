import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiResponse } from "../utils/errorHandler/api";
import type { IPaymentRepository } from "../repositories/PaymentRepository";
import { IPayment, IPaymentGhostResponse, IPaymentGhostWebhookPost, IPaymentPaginationRequestServer, IPaymentPaginationResponse, IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import { ICampaign } from "@/models/interfaces/ICampaignInterfaces";

export interface IPaymentService {
    getMyNumbers(cpf: string, campaignCode: string): Promise<ApiResponse<{
        cpf: string;
        campaign: Partial<ICampaign>;
        user: Partial<IUser>;
        paymentCurrentCampaign: IPayment[];
        otherPayments: IPayment[];
    } | null>>;

    getPaymentsByCreatorId(pagination: IPaymentPaginationRequestServer): Promise<ApiResponse<IPaymentPaginationResponse | null>>;

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

    confirmPixPayment(data: IPaymentGhostWebhookPost): Promise<ApiResponse<IPayment> | ApiResponse<null>>;
}


@injectable()
export class PaymentService implements IPaymentService {
    private paymentRepository: IPaymentRepository;

    constructor(
        @inject("paymentRepository") paymentRepository: IPaymentRepository
    ) {
        this.paymentRepository = paymentRepository;
    }

    async getMyNumbers(cpf: string, campaignCode: string): Promise<ApiResponse<{
        cpf: string;
        campaign: Partial<ICampaign>;
        user: Partial<IUser>;
        paymentCurrentCampaign: IPayment[];
        otherPayments: IPayment[];
    } | null>> {
        return this.paymentRepository.getMyNumbers(cpf, campaignCode);
    }

    async getPaymentsByCreatorId(pagination: IPaymentPaginationRequestServer): Promise<ApiResponse<IPaymentPaginationResponse | null>> {
        return this.paymentRepository.getPaymentsByCreatorId(pagination);
    }

    async createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
        idempotencyKey?: string;
    }): Promise<ApiResponse<IPayment> | ApiResponse<null>> {
        return this.paymentRepository.createInitialPixPaymentAttempt(data);
    }

    async confirmPixPayment(data: IPaymentGhostWebhookPost): Promise<ApiResponse<IPayment> | ApiResponse<null>> {
        return this.paymentRepository.confirmPixPayment(data);
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
        return this.paymentRepository.updatePixPaymentToPending(data);
    }

    async updatePixPaymentToFailed(data: {
        paymentCode: string;
        gatewayResponse: Partial<IPaymentGhostResponse>;
    }): Promise<ApiResponse<null>> {
        return this.paymentRepository.updatePixPaymentToFailed(data);
    }
}