import { inject, injectable } from "tsyringe";

import type { IDBConnection } from "@/server/lib/dbConnect";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { ApiError } from "@/server/utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import Prize from "@/models/Prize";
import { getServerSession } from "next-auth";
import { processImage } from '@/lib/upload-service/processImage'
import { uploadToS3 } from "@/lib/upload-service/client/uploadToS3";
import { Creator, User } from "@/models/User";
import { nextAuthOptions } from "@/lib/auth/nextAuthOptions";
import logger from "@/lib/logger/logger";

export interface IPrizeRepository {
    getAllPrizes(userCode: string): Promise<ApiResponse<IPrize[]> | ApiResponse<null>>;
    getPrizeById(id: string): Promise<ApiResponse<IPrize>>;
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: string;
        images: string[];
        userCode: string;
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
    deletePrize(id: string): Promise<ApiResponse<null>>;
}

@injectable()
export class PrizeRepository implements IPrizeRepository {
    private db: IDBConnection;

    constructor(
        @inject('db') db: IDBConnection
    ) {
        this.db = db;
    }


    async getAllPrizes(userCode: string): Promise<ApiResponse<IPrize[]> | ApiResponse<null>> {
        try {

            await this.db.connect();

            const user = await User.findOne({ userCode: userCode });

            console.log("user for list prizes",user);

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }



            const prizes = await Prize.find({ createdBy: user?._id });

            return createSuccessResponse(prizes, 'Prêmios encontrados com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar prêmios',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    async getPrizeById(id: string): Promise<ApiResponse<IPrize>> {
        try {
            await this.db.connect();
            const prize = await Prize.findOne({ prizeCode: id });
            return createSuccessResponse(prize, 'Prêmio encontrado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: string;  
        images: string[];
        userCode: string;
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>> {
        try {
            await this.db.connect();
            console.log("prize repository",prize);
            const user = await User.findOne({ userCode: prize.userCode });

            if(!user){
                return createErrorResponse('Usuário não encontrado', 404);
            }

            console.log("user",user);


            const prizeData = await Prize.create(prize);

            prizeData.prizeCode = generateEntityCode(prizeData._id, 'PR');
            prizeData.createdBy = user?._id;

            await prizeData.save();

            return createSuccessResponse(prizeData, 'Prêmio criado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }


    async deletePrize(id: string): Promise<ApiResponse<null>> {
        try {
            await this.db.connect();
            const prize = await Prize.findOne({ prizeCode: id });
            if (!prize) {
                return createErrorResponse('Prêmio não encontrado', 404);       
            }

            await Prize.deleteOne({ prizeCode: id });

            return createSuccessResponse(null, 'Prêmio deletado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                message: 'Repository: Erro ao deletar prêmio',
                success: false,
                statusCode: 500,
                cause: error as Error
            });
        }
    }   
}