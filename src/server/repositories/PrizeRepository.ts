import { inject, injectable } from "tsyringe";

import type { IDBConnection } from "@/server/lib/dbConnect";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { ApiError } from "@/server/utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import Prize from "@/models/Prize";
import { processImage } from '@/lib/upload-service/processImage'
import { uploadToS3 } from "@/lib/upload-service/client/uploadToS3";

export interface IPrizeRepository {
    getAllPrizes(): Promise<ApiResponse<IPrize[]>>;
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: string;
        images: string[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
}

@injectable()
export class PrizeRepository implements IPrizeRepository {
    private db: IDBConnection;

    constructor(
        @inject('db') db: IDBConnection
    ) {
        this.db = db;
    }


    async getAllPrizes(): Promise<ApiResponse<IPrize[]>> {
        try {
            await this.db.connect();
            const prizes = await Prize.find();
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

    async createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: string;
        images: string[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>> {
        try {
            await this.db.connect();
            console.log("prize repository",prize);

            const prizeData = await Prize.create(prize);

            prizeData.prizeCode = generateEntityCode(prizeData._id, 'PR');

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

}