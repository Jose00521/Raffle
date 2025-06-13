import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiResponse } from "../utils/errorHandler/api";
import type { IPaymentRepository } from "../repositories/PaymentRepository";
import { IPayment, IPaymentGhostResponse, IPaymentPattern } from "@/models/interfaces/IPaymentInterfaces";

export interface IPaymentService {
    createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
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
}


@injectable()
export class PaymentService implements IPaymentService {
    private paymentRepository: IPaymentRepository;

    constructor(
        @inject("paymentRepository") paymentRepository: IPaymentRepository
    ) {
        this.paymentRepository = paymentRepository;
    }

    async createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
    }): Promise<ApiResponse<IPayment> | ApiResponse<null>> {
        return this.paymentRepository.createInitialPixPaymentAttempt(data);
    }

    async updatePixPaymentToPending(data: {
        paymentCode: string;
        gatewayResponse: IPaymentGhostResponse;
    }): Promise<ApiResponse<{
        pixCode: string;
        pixQrCode: string;
        expiresAt: string;
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