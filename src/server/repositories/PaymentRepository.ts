import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { IPayment, IPaymentGhostResponse, IPaymentGhostWebhookPost, IPaymentPaginationRequestServer, IPaymentPaginationResponse, IPaymentPattern, PaymentStatusEnum } from "@/models/interfaces/IPaymentInterfaces";
import { ApiError } from "../utils/errorHandler/ApiError";
import Payment from "@/models/Payment";
import Campaign from "@/models/Campaign";
import { User } from "@/models/User";
import { CampaignStatusEnum, ICampaign } from "@/models/interfaces/ICampaignInterfaces";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { v4 as uuidv4 } from 'uuid';
import { SocketService } from "../lib/socket/SocketService";
import { container } from "tsyringe";
import { maskAddress, maskCPF, maskEmail, maskPhone, maskCEP} from "@/utils/maskUtils";
import { getSocketServer } from "../socketio";
import SocketServiceDefault from "../lib/socket/SocketService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import { BitMapService } from "@/services/BitMapService";
import { NumberStatusEnum } from "@/models/interfaces/INumberStatusInterfaces";
import NumberStatus from "@/models/NumberStatus";
import { SecureDataUtils } from "@/utils/encryption";
import mongoose from "mongoose";

export interface IPaymentRepository {
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
        pixCode: string;
        pixQrCode: string;
        expiresAt: string | Date | undefined;
        paymentCode: string;
    }> | ApiResponse<null>>;

    updatePixPaymentToFailed(data: {
        paymentCode: string;
        gatewayResponse: Partial<IPaymentGhostResponse>;
    }): Promise<ApiResponse<null>>;

    confirmPixPayment(data: IPaymentGhostWebhookPost): Promise<ApiResponse<IPayment> | ApiResponse<null>>;

    getMyNumbers(cpf: string, campaignCode: string): Promise<ApiResponse<{
        cpf: string;
        campaign: Partial<ICampaign>;
        user: Partial<IUser>;
        paymentCurrentCampaign: IPayment[];
        otherPayments: IPayment[];
    } | null>>;
}


@injectable()
export class PaymentRepository implements IPaymentRepository {
    private db: IDBConnection;

    constructor(
        @inject("db") db: IDBConnection
    ) {
        this.db = db;
    }

    async getMyNumbers(cpf: string, campaignCode: string): Promise<ApiResponse<{
        cpf: string;
        campaign: Partial<ICampaign>;
        user: Partial<IUser>;
        paymentCurrentCampaign: IPayment[];
        otherPayments: IPayment[];
    } | null>> {
        try {
            await this.db.connect();

            const campaign = await Campaign.findOne({ campaignCode });

            if(!campaign){
                return createErrorResponse('Campanha não encontrada', 404);
            }

            const user = await User.findOne({ cpf_hash: SecureDataUtils.hashDocument(cpf) });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            const paymentCurrentCampaign = await Payment!.find({
                campaignId: campaign._id,
                customerId: user._id,
                status: PaymentStatusEnum.APPROVED
            })

            const otherPayments = await Payment!.find({
                _id: { $nin: paymentCurrentCampaign?.map(payment => payment._id) },
                customerId: user._id,
                status: PaymentStatusEnum.APPROVED
            })
            .populate('campaignId')

            if(paymentCurrentCampaign.length === 0 && otherPayments.length === 0){
                return createErrorResponse('Nenhum número encontrado', 404);
            }
            
            return createSuccessResponse({
                cpf,
                campaign,
                user,
                paymentCurrentCampaign,
                otherPayments
            }, 'Números buscados com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar números',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async getPaymentsByCreatorId(pagination: IPaymentPaginationRequestServer): Promise<ApiResponse<IPaymentPaginationResponse | null>> {
        try {
            await this.db.connect();

            const { userCode, page, limit, skip, searchTerm, campaignId, status, startDate, endDate } = pagination;

            const creator = await User.findOne({ userCode, role: 'creator' });

            const campaign = await Campaign.findOne({ campaignCode: campaignId });

            const query: any = {
                // fixo sempre existe
                creatorId: creator._id,
            }

            if(campaignId){
                Object.assign(query, { campaignId: campaign._id });
            }
            if(status){
                Object.assign(query, { status });
            }
            
            // 🔧 CORREÇÃO: Construir condições de data corretamente no fuso brasileiro
            if(startDate || endDate){
                const dateCondition: any = {};
                
                if(startDate){
                    // Criar data no fuso brasileiro (UTC-3)
                    const startDateBR = new Date(startDate);
                    startDateBR.setHours(startDateBR.getHours() + 3); // Ajustar para UTC-3
                    dateCondition.$gte = startDateBR;
                }
                if(endDate){
                    // Criar data no fuso brasileiro (UTC-3)
                    const endDateBR = new Date(endDate);
                    endDateBR.setHours(endDateBR.getHours() + 3); // Ajustar para UTC-3
                    dateCondition.$lte = endDateBR;
                }
                
                Object.assign(query, { createdAt: dateCondition });
            }

            

            const [payments, totalItems, campaigns, stats] = await Promise.all([
                Payment!.find(query)
                    .populate('campaignId', '-_id')
                    .populate('customerId', '-_id')
                    .skip(skip)
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                Payment!.countDocuments(query),
                Campaign!.find({ createdBy: creator._id }, '-_id title campaignCode'),
                this.countParticipantsByCreatorId(campaignId || '', creator._id, startDate || '', endDate || ''),
            ]);

            const totalPages = Math.ceil(totalItems / limit);
            
            return createSuccessResponse({
                paginationData: {
                    totalItems,
                    totalPages,
                    page,
                    limit,
                    skip
                },
                campaigns,
                sales: payments,
                stats
            }, 'Pagamentos buscados com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar pagamentos',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    
    async getLatestPaymentsByCreatorId(pagination: Partial<IPaymentPaginationRequestServer>): Promise<ApiResponse<Partial<IPaymentPaginationResponse> | null>> {
        try {
            await this.db.connect();

            const { userCode, limit = 10, campaignId, startDate, endDate } = pagination;

            const creator = await User.findOne({ userCode, role: 'creator' });

            const campaign = await Campaign.findOne({ campaignCode: campaignId });

            const query: any = {
                // fixo sempre existe
                creatorId: creator._id,
                status: PaymentStatusEnum.APPROVED
            }

            if(campaignId){
                Object.assign(query, { campaignId: campaign._id });
            }
            
            // 🔧 CORREÇÃO: Construir condições de data corretamente no fuso brasileiro
            if(startDate || endDate){
                const dateCondition: any = {};
                
                if(startDate){
                    // Criar data no fuso brasileiro (UTC-3)
                    const startDateBR = new Date(startDate);
                    startDateBR.setHours(startDateBR.getHours() + 3); // Ajustar para UTC-3
                    dateCondition.$gte = startDateBR;
                }
                if(endDate){
                    // Criar data no fuso brasileiro (UTC-3)
                    const endDateBR = new Date(endDate);
                    endDateBR.setHours(endDateBR.getHours() + 3); // Ajustar para UTC-3
                    dateCondition.$lte = endDateBR;
                }
                
                Object.assign(query, { createdAt: dateCondition });
            }

            

            const [payments, campaigns, stats, salesByDay, totalCampaignsCount,totalCampaignsCountCompleted ] = await Promise.all([
                Payment!.find(query)
                    .populate('campaignId', '-_id')
                    .populate('customerId', '-_id')
                    .limit(limit)
                    .sort({ createdAt: -1 }),
                Campaign!.find({ createdBy: creator._id }, '-_id title campaignCode'),
                this.countParticipantsByCreatorId(campaignId || '', creator._id, startDate || '', endDate || ''),
                this.getVendasPorDia(campaignId || '', startDate || '', endDate || ''),
                Campaign!.countDocuments({ createdBy: creator._id }),
                Campaign!.countDocuments({ createdBy: creator._id, status: CampaignStatusEnum.COMPLETED })
            ]);
            
            return createSuccessResponse({
                campaigns,
                sales: payments,
                stats,
                salesByDay,
                totalCampaignsCount,
                totalCampaignsCountCompleted
            }, 'Pagamentos buscados com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar pagamentos',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async createInitialPixPaymentAttempt(data: {
        gateway: string;
        body: IPaymentPattern;
        idempotencyKey?: string; // 🎯 Chave de idempotência (padrão Stripe)
    }) {
        const { gateway, body, idempotencyKey } = data;

        try {
            await this.db.connect();

            // 🛡️ PROTEÇÃO 1: Verificação de idempotência (padrão da indústria)
            if (idempotencyKey) {
                const existingPayment = await Payment!.findOne({ 
                    idempotencyKey 
                });

                if (existingPayment) {
                    console.log(`[IDEMPOTENCY] Pagamento duplicado detectado. Key: ${idempotencyKey}`);
                    return createSuccessResponse(
                        existingPayment as IPayment, 
                        'Pagamento já processado (idempotência)', 
                        200
                    );
                }
            }

            const [campaign, user] = await Promise.all([
                Campaign.findOne({
                    campaignCode: body.campanha.campaignCode,
                    status: CampaignStatusEnum.ACTIVE,
                }),
                User.findOne({
                    userCode: body.userCode,
                })
            ]);
            
            if(!campaign){
                return createErrorResponse('Campanha não esta disponível', 404);
            }

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            // 🛡️ PROTEÇÃO 2: Verificação de duplicação por dados críticos
            const duplicateCheck = await Payment!.findOne({
                campaignId: campaign._id,
                customerId: user._id,
                creatorId: campaign.createdBy,
                amount: body.amount,
                status: { $in: ['PENDING', 'INITIALIZED', 'APPROVED'] },
                createdAt: { 
                    $gte: new Date(Date.now() - 5 * 60 * 1000) // Últimos 5 minutos
                }
            });

            if (duplicateCheck) {
                console.log(`[DUPLICATE_PREVENTION] Pagamento duplicado detectado nos últimos 5 minutos`);
                return createErrorResponse(
                    'Pagamento duplicado detectado nos últimos 5 minutos', 
                    409
                );
            }

            const paymentData = {
                amount: body.amount/100,
                numbersQuantity: body.selectedPackage.quantity,
                campaignId: campaign._id,
                customerId: user._id,
                creatorId: campaign.createdBy,
                paymentMethod: body.paymentMethod,
                status: PaymentStatusEnum.INITIALIZED,
                paymentProcessor: gateway,
                customerInfo: {
                    name: body.name,
                    email: maskEmail(body.email),
                    document: maskCPF(body.cpf),
                    phone: maskPhone(body.phone),
                },
                billingInfo: {
                    address: body.address.street && maskAddress(body.address.street),
                    city: body.address.city,
                    state: body.address.state,
                    zipCode: body.address.zipCode && maskCEP(body.address.zipCode),
                },
                installments: body.creditCard?.installments,
                // 🔑 Adiciona chave de idempotência se fornecida
                ...(idempotencyKey && { idempotencyKey })
            };

            const payment = await Payment!.create(paymentData);

            payment.paymentCode = generateEntityCode(payment._id, 'PG');
            await payment.save();

            console.log(`[PAYMENT_CREATED] ID: ${payment.paymentCode}, Key: ${idempotencyKey || 'N/A'}`);

            return createSuccessResponse(payment as IPayment, 'Pagamento criado com sucesso no banco de dados', 200);

        } catch (error: any) {
            // 🚨 Tratamento específico para constraint único da idempotência
            if (error.code === 11000 && error.keyPattern?.idempotencyKey) {
                console.log(`[IDEMPOTENCY_CONSTRAINT] Constraint violado: ${error.keyValue.idempotencyKey}`);
                
                const existingPayment = await Payment!.findOne({ 
                    idempotencyKey: error.keyValue.idempotencyKey 
                });

                if (existingPayment) {
                    console.log(`[IDEMPOTENCY_SUCCESS] Retornando pagamento existente: ${existingPayment.paymentCode}`);
                    return createSuccessResponse(
                        existingPayment as IPayment, 
                        'Pagamento já processado (idempotência)', 
                        200
                    );
                } else {
                    console.error(`[IDEMPOTENCY_ERROR] Constraint violado mas pagamento não encontrado: ${error.keyValue.idempotencyKey}`);
                }
            }

            if (error.code === 11000 && error.keyPattern?.paymentCode === 1) {
                return createErrorResponse('Pagamento já existe', 400);
            }

            console.error('[PAYMENT_CREATE_ERROR]', error);
            throw new ApiError({
                success: false,
                message: 'Erro ao criar pagamento',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async confirmPixPayment(data: IPaymentGhostWebhookPost): Promise<ApiResponse<IPayment> | ApiResponse<null>> {
        const connection = await this.db.connect();
        const session = await connection.startSession();
        try {
            const { externalId, paymentMethod, status, approvedAt , } = data;

            console.log('chegou aqui 1', externalId, paymentMethod, status, approvedAt);

            session.startTransaction();

            const payment = await Payment!.findOne({
                $or: [
                    { paymentCode: externalId },
                    { processorTransactionId: externalId }
                ]
            }).populate('customerId', 'name email userCode')
            .populate('campaignId', 'title campaignCode');

            if(!payment){
                return createErrorResponse('Pagamento não encontrado', 404);
            }


            console.log('chegou aqui 2', status, approvedAt);

            if(status === 'APPROVED'){
                console.log('chegou aqui 3', status, approvedAt);
                payment.status = PaymentStatusEnum.APPROVED;
                payment.approvedAt = new Date(approvedAt);

                // atualizar o status do numero status para pago
                await NumberStatus!.updateMany({
                    paymentId: payment._id,
                    status: NumberStatusEnum.RESERVED
                }, {
                    $set: { status: NumberStatusEnum.PAID, paidAt: new Date(approvedAt) }
                }, {session});


                // Atualizar role de 'user' para 'participant'
      
                    const userCode = (payment.customerId as unknown as IUser).userCode;
                    console.log('Tentando atualizar role do usuário:', userCode);
                    
                    // Usar findOneAndUpdate que funciona melhor com discriminators
                    const updatedUser = await User.findOneAndUpdate(
                        {
                            userCode: userCode,
                            role: 'user'
                        },
                        {
                            $set: {
                                role: 'participant'
                            }
                        },
                        { 
                            session,
                            new: true, // Retorna o documento atualizado
                            runValidators: true
                        }
                    );
                    
                    if (updatedUser) {
                        console.log('✅ Role atualizado com sucesso:', {
                            userCode: updatedUser.userCode,
                            oldRole: 'user',
                            newRole: updatedUser.role,
                            _id: updatedUser._id
                        });
                    } else {
                        console.log('⚠️ Nenhum usuário foi atualizado. Possíveis causas:', {
                            userCode: userCode,
                            razoes: [
                                'Usuário não encontrado',
                                'Usuário já é participant',
                                'UserCode incorreto'
                            ]
                        });
                        
                        // Verificar se o usuário existe
                        const existingUser = await User.findOne({ userCode: userCode });
                        console.log('Usuário existente:', {
                            exists: !!existingUser,
                            currentRole: existingUser?.role,
                            userCode: existingUser?.userCode
                        });
  
            }

            await payment.save({session});

            await session.commitTransaction();

            return createSuccessResponse(payment as IPayment, 'Pagamento confirmado com sucesso', 200);
        }

            return createErrorResponse('Status de pagamento não suportado', 400);
        } catch (error) {
            await session.abortTransaction();
            console.error('[PAYMENT_CONFIRM_ERROR]', error);
            throw new ApiError({
                success: false,
                message: 'Erro ao confirmar pagamento',
                statusCode: 500,
                cause: error as Error
            });
        } finally {
            session.endSession();
        }
    }


    async updatePixPaymentToPending(data: {
        paymentCode: string;
        gatewayResponse: IPaymentGhostResponse;
    }): Promise<ApiResponse<{
        pixCode: string;
        paymentCode: string;
        pixQrCode: string;
        expiresAt: string | Date | undefined;
    }> | ApiResponse<null>> {
        const connection = await this.db.connect();

        const session = await connection.startSession();
        
        try {
            const { gatewayResponse, paymentCode } = data;

            session.startTransaction();

            console.log('paymentCode vindo do updatePixPaymentToPending', paymentCode);
            
            const payment = await Payment!.findOne({
                paymentCode,
            });

            if(!payment){
                return createErrorResponse('Pagamento não encontrado', 404);
            }

            // 🔄 Se já está PENDING, retorna os dados do PIX (idempotência funcionando)
            if(payment.status === PaymentStatusEnum.PENDING){
                console.log(`[IDEMPOTENCY_SUCCESS] Pagamento já processado: ${paymentCode}`);
                return createSuccessResponse({
                    pixCode: payment.pixCode || gatewayResponse.pixCode,
                    paymentCode: payment.paymentCode || paymentCode,
                    pixQrCode: gatewayResponse.pixQrCode,
                    expiresAt: payment.expiresAt,
                }, 'Pagamento já processado (idempotência)', 200);
            }

                   // 1. Monta o objeto de atualização
        const updateData = {
            pixCode: gatewayResponse.pixCode,
            status: PaymentStatusEnum.PENDING,
            processorTransactionId: gatewayResponse.id,
            amountReceived: gatewayResponse.amountSeller/100 || 0,
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

        let numbers = await BitMapService.reserveRandomNumbers(payment.campaignId as string, payment.numbersQuantity, undefined, session);

        const isNumberAvailable = await BitMapService.isNumberAvailable(payment.campaignId as string, numbers[0]);
        console.log('isNumberAvailable', isNumberAvailable);
        const checkNumbersAvailability = await BitMapService.checkNumbersAvailability(payment.campaignId as string, [10880418,11042084,6584441,8461577,...numbers]);
        console.log('checkNumbersAvailability',checkNumbersAvailability);
        // inserir os numeros no NumberStatus como reservado

            // Configurar data de expiração
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 10);
        
        // Preparar operações em lote (cada operação é uma inserção)
        const bulkOps = numbers.map(number => ({
        insertOne: {
            document: {
            campaignId: payment.campaignId,
            number: number.toString(),
            status: NumberStatusEnum.RESERVED,
            userId: payment.customerId,
            paymentId: payment._id,
            reservedAt: new Date(),
            expiresAt,
            paidAt: null
            }
        }
        }));

        await NumberStatus!.bulkWrite(bulkOps, { 
            session,
            ordered: false // Define como false para continuar mesmo se houver erros
        });

        console.log('numbers', numbers);

        await session.commitTransaction();

        return createSuccessResponse({
            pixCode: gatewayResponse.pixCode,
            pixQrCode: gatewayResponse.pixQrCode,
            paymentCode: updatedPayment.paymentCode || paymentCode,
            numbers: numbers.slice(0, 30),
            expiresAt: updatedPayment.expiresAt?.toISOString() || '',
        }, 'Pagamento atualizado com sucesso', 200);

        } catch (error) {
            await session.abortTransaction();

            throw new ApiError({
                success: false,
                message: 'Erro ao atualizar pagamento',
                statusCode: 500,
                cause: error as Error
            });
        } finally {
            session.endSession();
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


    async countParticipantsByCreatorId(campaignId: string, creatorId: string, startDate: string, endDate: string): Promise<ApiResponse<number>> {
        try {

            const queryMatch ={
                creatorId: new mongoose.Types.ObjectId(creatorId),
                status: PaymentStatusEnum.APPROVED
            }

            const campaign = await Campaign.findOne({ campaignCode: campaignId });

            if(campaignId){
                Object.assign(queryMatch, { campaignId: campaign._id });
            }

            // 🔧 CORREÇÃO: Construir condições de data corretamente no fuso brasileiro
            if(startDate || endDate){
                const dateCondition: any = {};
                
                if(startDate){
                    // Criar data no fuso brasileiro (UTC-3)
                    const startDateBR = new Date(startDate);
                    startDateBR.setHours(startDateBR.getHours() + 3); // Ajustar para UTC-3
                    dateCondition.$gte = startDateBR;
                }
                if(endDate){
                    // Criar data no fuso brasileiro (UTC-3)
                    const endDateBR = new Date(endDate);
                    endDateBR.setHours(endDateBR.getHours() + 3); // Ajustar para UTC-3
                    dateCondition.$lte = endDateBR;
                }
                
                Object.assign(queryMatch, { createdAt: dateCondition });
            }            



            const resultado = await Payment!.aggregate([
                {
                    // Filtrar apenas pagamentos aprovados da campanha
                    $match: queryMatch
                },
                {
                    // Calcular todos os valores em um único grupo
                    $group: {
                        _id: null, // Agrupar tudo em um resultado
                        
                        // QUANTIDADE DE VENDAS
                        totalVendas: { $sum: 1 },
                        
                        // PARTICIPANTES ÚNICOS
                        participantesUnicos: { $addToSet: "$customerId" },
                        
                        // VALORES FINANCEIROS
                        valorBruto: { $sum: "$amount" },              // Valor total das vendas
                        valorLiquido: { $sum: "$amountReceived" },    // Valor que o criador recebe
                        taxasVendedor: { $sum: "$taxSeller" },        // Taxas do vendedor
                        taxasPlataforma: { $sum: "$taxPlatform" },    // Taxas da plataforma
                        
                        // NÚMEROS VENDIDOS
                        totalNumeros: { $sum: "$numbersQuantity" },
                        
                        // ESTATÍSTICAS ADICIONAIS
                        ticketMedio: { $avg: "$amount" },
                        maiorVenda: { $max: "$amount" },
                        menorVenda: { $min: "$amount" }
                    }
                },
                {
                    // Transformar o resultado final
                    $project: {
                        _id: 0,
                        vendas: {
                            total: "$totalVendas",
                            participantesUnicos: { $size: "$participantesUnicos" }
                        },
                        valores: {
                            bruto: { $round: ["$valorBruto", 2] },
                            liquido: { $round: ["$valorLiquido", 2] },
                            taxas: {
                                vendedor: { $round: ["$taxasVendedor", 2] },
                                plataforma: { $round: ["$taxasPlataforma", 2] },
                                total: { $round: [{ $add: ["$taxasVendedor", "$taxasPlataforma"] }, 2] }
                            }
                        },
                        numeros: {
                            vendidos: "$totalNumeros"
                        },
                        estatisticas: {
                            ticketMedio: { $round: ["$ticketMedio", 2] },
                            maiorVenda: "$maiorVenda",
                            menorVenda: "$menorVenda"
                        }
                    }
                }
            ]);
            
            return resultado[0] || {
                vendas: { total: 0, participantesUnicos: 0 },
                valores: { bruto: 0, liquido: 0, taxas: { vendedor: 0, plataforma: 0, total: 0 } },
                numeros: { vendidos: 0 },
                estatisticas: { ticketMedio: 0, maiorVenda: 0, menorVenda: 0 }
            };
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar total de participantes',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    async getVendasPorDia(campaignId: string, startDate: string, endDate: string) {

        const queryMatch ={
            status: PaymentStatusEnum.APPROVED
        }

        const campaign = await Campaign.findOne({ campaignCode: campaignId });

        if(campaignId){
            Object.assign(queryMatch, { campaignId: campaign._id });
        }

        // 🔧 CORREÇÃO: Construir condições de data corretamente no fuso brasileiro
        if(startDate || endDate){
            const dateCondition: any = {};
            
            if(startDate){
                // Criar data no fuso brasileiro (UTC-3)
                const startDateBR = new Date(startDate);
                startDateBR.setHours(startDateBR.getHours() + 3); // Ajustar para UTC-3
                dateCondition.$gte = startDateBR;
            }
            if(endDate){
                // Criar data no fuso brasileiro (UTC-3)
                const endDateBR = new Date(endDate);
                endDateBR.setHours(endDateBR.getHours() + 3); // Ajustar para UTC-3
                dateCondition.$lte = endDateBR;
            }
            
            Object.assign(queryMatch, { createdAt: dateCondition });
        }     

        const resultado = await Payment!.aggregate([
            {
                // Filtrar pagamentos aprovados no período
                $match: queryMatch
            },
            {
                // Agrupar por data mantendo campos para ordenação cronológica
                $group: {
                    _id: {
                        // Campos para ordenação cronológica
                        year: { $year: { date: "$createdAt", timezone: "America/Sao_Paulo" } },
                        month: { $month: { date: "$createdAt", timezone: "America/Sao_Paulo" } },
                        day: { $dayOfMonth: { date: "$createdAt", timezone: "America/Sao_Paulo" } },
                        // Campo formatado para exibição
                        dateFormatted: {
                            $dateToString: {
                                format: "%d/%m/%Y",
                                date: "$createdAt",
                                timezone: "America/Sao_Paulo"
                            }
                        }
                    },
                    sales: { $sum: 1 },                    // Quantidade de vendas
                    valorBruto: { $sum: "$amount" },       // Valor total vendido
                    valorLiquido: { $sum: "$amountReceived" }, // Valor líquido
                    participantes: { $addToSet: "$customerId" } // Participantes únicos do dia
                }
            },
            {
                // Ordenar cronologicamente (ano, mês, dia)
                $sort: { 
                    "_id.year": 1, 
                    "_id.month": 1, 
                    "_id.day": 1 
                }
            },
            {
                // Formatar resultado final
                $project: {
                    _id: 0,
                    date: "$_id.dateFormatted",
                    sales: 1,
                    valorBruto: { $round: ["$valorBruto", 2] },
                    valorLiquido: { $round: ["$valorLiquido", 2] },
                    participantesUnicos: { $size: "$participantes" }
                }
            }
        ]);
        
        return resultado;
    }


}