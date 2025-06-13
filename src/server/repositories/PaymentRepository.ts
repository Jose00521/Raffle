import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { IPayment, IPaymentGhostResponse, IPaymentPattern, PaymentStatusEnum } from "@/models/interfaces/IPaymentInterfaces";
import { ApiError } from "../utils/errorHandler/ApiError";
import Payment from "@/models/Payment";
import Campaign from "@/models/Campaign";
import { User } from "@/models/User";
import { CampaignStatusEnum } from "@/models/interfaces/ICampaignInterfaces";
import { generateEntityCode } from "@/models/utils/idGenerator";

export interface IPaymentRepository {
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
export class PaymentRepository implements IPaymentRepository {
    private db: IDBConnection;

    constructor(
        @inject("db") db: IDBConnection
    ) {
        this.db = db;
    }

    async createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
    }) {
        const { gateway, body } = data;
        const paymentCode = generateEntityCode('PG');

        try {
            this.db.connect();

            const campaign = await Campaign.findOne({
                campaignCode: body.campanha.campaignCode,
                status: CampaignStatusEnum.ACTIVE,
            });

            const user = await User.findOne({
                userCode: body.userCode,
            });
            
            if(!campaign){
                return createErrorResponse('Campanha não esta disponível', 404);
            }

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            const paymentData = {
                amount: body.amount,
                campaignId: campaign._id,
                userId: user._id,
                paymentMethod: body.paymentMethod,
                status: PaymentStatusEnum.INITIALIZED,
                paymentProcessor: gateway,
                paymentCode: paymentCode,
                customerInfo: {
                    name: body.name,
                    email: body.email,
                    document: body.cpf,
                    phone: body.phone,
                },
                billingInfo: {
                    address: body.address.street,
                    city: body.address.city,
                    state: body.address.state,
                    zipCode: body.address.zipCode,
                },
                installments: body.creditCard?.installments,
            };

            const payment = await Payment!.create(paymentData);

            return createSuccessResponse(payment as IPayment, 'Pagamento criado com sucesso no banco de dados', 200);

        } catch (error: any) {
            if (error.code === 11000 && error.keyPattern?.paymentCode === 1) {
                console.warn(`Condição de corrida detectada para paymentCode: ${paymentCode}. Buscando pagamento existente.`);
                const existingPayment = await Payment!.findOne({ paymentCode: paymentCode });
                if (existingPayment) {
                    return createSuccessResponse(existingPayment as IPayment, 'Pagamento recuperado com sucesso após condição de corrida.', 200);
                }
            }

            throw new ApiError({
                success: false,
                message: 'Erro ao criar pagamento',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    async updatePixPaymentToPending(data: {
        paymentCode: string;
        gatewayResponse: IPaymentGhostResponse;
    }): Promise<ApiResponse<{
        pixCode: string;
        pixQrCode: string;
        expiresAt: string;
    }> | ApiResponse<null>> {
        try {
            const { gatewayResponse, paymentCode } = data;

            this.db.connect();

                   // 1. Monta o objeto de atualização
        const updateData = {
            pixCode: gatewayResponse.pixCode,
            status: PaymentStatusEnum.PENDING,
            processorTransactionId: gatewayResponse.id,
            amountReceived: gatewayResponse.amountSeller || 0,
            taxSeller: gatewayResponse.taxSeller || 0,
            taxPlatform: gatewayResponse.taxPlatform || 0,
            approvedDate: gatewayResponse.approvedAt ? new Date(gatewayResponse.approvedAt) : undefined,
            expireDate: gatewayResponse.expiresAt ? new Date(gatewayResponse.expiresAt) : undefined,
        };

        // 2. Adiciona os campos de data condicionalmente
        if (gatewayResponse.approvedAt) {
            updateData.approvedDate = new Date(gatewayResponse.approvedAt);
        }
        if (gatewayResponse.expiresAt) {
            updateData.expireDate = new Date(gatewayResponse.expiresAt);
        }

        // 3. Executa a busca e atualização em uma única chamada atômica
        const updatedPayment = await Payment!.findOneAndUpdate(
            { paymentCode: paymentCode }, // Critério de busca
            { $set: updateData },        // O que atualizar
            { new: true }                // Opção para retornar o documento já atualizado
        );

        if(!updatedPayment){
            return createErrorResponse('Pagamento não encontrado para atualizar', 404);
        }
        
        return createSuccessResponse({
            pixCode: gatewayResponse.pixCode,
            pixQrCode: gatewayResponse.pixQrCode,
            expiresAt: gatewayResponse.expiresAt,
        }, 'Pagamento atualizado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao atualizar pagamento',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async updatePixPaymentToFailed(data: {
        paymentCode: string;
        gatewayResponse: Partial<IPaymentGhostResponse>;
    }): Promise<ApiResponse<null>> {
        try {
            const { gatewayResponse, paymentCode } = data;

            this.db.connect();

            const payment = await Payment!.findOne({
                paymentCode,
            });

            if(!payment){
                return createErrorResponse('Pagamento não encontrado', 404);
            }

            payment.status = gatewayResponse.status as PaymentStatusEnum;
            await payment.save();

            return createSuccessResponse(null, 'Pagamento atualizado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao atualizar pagamento',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


}