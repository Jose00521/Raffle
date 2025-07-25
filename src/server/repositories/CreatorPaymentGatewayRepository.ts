import { inject, injectable } from "tsyringe";
import { IUserPaymentGateway, IUserPaymentGatewayRequest, PaymentGatewayStatus } from "@/models/interfaces/IPaymentGatewayInterfaces";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiError } from "../utils/errorHandler/ApiError";
import UserPaymentGateway from "@/models/UserPaymentGateway";
import { Creator } from "@/models/User";
import { generateEntityCode } from "@/models/utils/idGenerator";
import PaymentGatewayTemplate from "@/models/PaymentGatewayTemplate";


export interface ICreatorPaymentGatewayRepository {
    integrateGateway(data: Partial<IUserPaymentGatewayRequest>, userCode: string): Promise<ApiResponse<null> | ApiResponse<IUserPaymentGateway>>;
    getDefaultPaymentGateway(userCode: string): Promise<ApiResponse<IUserPaymentGateway> | ApiResponse<null>>;
    getMyGateways(userCode: string): Promise<ApiResponse<IUserPaymentGateway[] | null>>;
    setAsDefaultGateway(userCode: string, gatewayCode: string): Promise<ApiResponse<null>>;
}


@injectable()
export class CreatorPaymentGatewayRepository implements ICreatorPaymentGatewayRepository {

    constructor(
        @inject("db") private db: IDBConnection
    ) {}


    async integrateGateway(data: Partial<IUserPaymentGatewayRequest>, userCode: string): Promise<ApiResponse<null> | ApiResponse<IUserPaymentGateway>> {
        try {
            await this.db.connect();

            console.log('data', data);
            console.log('userCode', userCode);

            const creator = await Creator.findOne({userCode})

            if(!creator){
                return createErrorResponse('Criador não encontrado', 404);
            }

            const paymentGatewayTemplate = await PaymentGatewayTemplate!.findOne({
                templateUniqueCode: data.templateUniqueCode
            })

            if(!paymentGatewayTemplate){
                return createErrorResponse('Template de gateway não encontrado', 404);
            }

            if(UserPaymentGateway){
                const integratedGateway = new UserPaymentGateway({
                    ...data,
                    userId: creator.id,
                    templateRef: paymentGatewayTemplate!._id,
                    templateUniqueCode: paymentGatewayTemplate!.templateUniqueCode,
                    isDefault: false,
                    status: PaymentGatewayStatus.ACTIVE,
                });

                integratedGateway.gatewayCode = generateEntityCode(paymentGatewayTemplate!._id, 'GP');

                await integratedGateway.save();

                return createSuccessResponse(integratedGateway as IUserPaymentGateway, 'Gateway integrado com sucesso', 200);
            }

            return createErrorResponse('Erro ao integrar gateway', 500);
            
        } catch (error) {   
            throw new ApiError({
                success: false,
                message: 'Erro ao integrar gateway',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async getDefaultPaymentGateway(userCode: string): Promise<ApiResponse<IUserPaymentGateway> | ApiResponse<null>> {
        try {
            await this.db.connect();

            const creator = await Creator.findOne({userCode})

            if(!creator){
                return createErrorResponse('Criador não encontrado', 404);
            }

            const defaultGateway = await UserPaymentGateway!.findOne({
                userId: creator?._id,
                isDefault: true
            })
            .populate('userId')
            .populate('templateRef')

            if(!defaultGateway){
                return createErrorResponse('Gateway padrão não encontrado', 404);
            }

            return createSuccessResponse(defaultGateway as IUserPaymentGateway, 'Gateway padrão encontrado', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar gateway padrão',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async getMyGateways(userCode: string): Promise<ApiResponse<IUserPaymentGateway[] | null>> {
        try {
            await this.db.connect();

            const creator = await Creator.findOne({userCode})

            if(!creator){
                return createErrorResponse('Criador não encontrado', 404);
            }

            const gateways = await UserPaymentGateway!.find({userId: creator._id}, '-_id -credentials')
            .populate('userId','-_id')
            .populate('templateRef','-_id')

            return createSuccessResponse(gateways as IUserPaymentGateway[], 'Gateways encontrados', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar gateways do criador',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async setAsDefaultGateway(userCode: string, gatewayCode: string): Promise<ApiResponse<null>> {
        try {
            await this.db.connect();

            const creator = await Creator.findOne({userCode})

            if(!creator){
                return createErrorResponse('Criador não encontrado', 404);
            }

            const gateway = await UserPaymentGateway!.findOne({gatewayCode})

            if(!gateway){
                return createErrorResponse('Gateway não encontrado', 404);
            }

            await UserPaymentGateway!.updateMany({userId: creator._id, isDefault: true}, {isDefault: false})

            await UserPaymentGateway!.updateOne({gatewayCode}, {isDefault: true})

            return createSuccessResponse(null, 'Gateway padrão atualizado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao atualizar gateway padrão',
                statusCode: 500,
                cause: error as Error
            });
        }
    }
}