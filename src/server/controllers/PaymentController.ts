import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiResponse } from "../utils/errorHandler/api";
import type { IPaymentService } from "../services/PaymentService";
import { IPayment, IPaymentGhostResponse, IPaymentGhostWebhookPost, IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";

export interface IPaymentController {
    createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
        idempotencyKey?: string;
    }): Promise<ApiResponse<IPayment> | ApiResponse<null>>;

    updatePixPaymentToPending(data: {
        paymentCode: string;
        gatewayResponse: IPaymentGhostResponse;
    }): Promise<ApiResponse<{
        pixCode: string;
        pixQrCode: string;
        expiresAt: string;
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
        pixCode: string;
        pixQrCode: string;
        expiresAt: string;
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