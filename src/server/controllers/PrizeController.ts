import 'reflect-metadata';
import { inject, injectable } from "tsyringe";
import type {IUserService} from "../services/UserService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import type { IPrizeService } from "../services/PrizeService";
import { Session } from 'next-auth';

export interface IPrizeController {
    getAllPrizes(session: Session): Promise<ApiResponse<IPrize[] | ApiResponse<null>>>;
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
    }, session: Session): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
    getPrizeById(id: string, session: Session): Promise<ApiResponse<IPrize | null>>;
    deletePrize(id: string, session: Session): Promise<ApiResponse<null>>;  
    updatePrize(id: string, updatedData: Record<string, any>, session: Session): Promise<ApiResponse<IPrize> | ApiResponse<null>>;
}

@injectable()
export class PrizeController implements IPrizeController {
    private prizeService: IPrizeService;

    constructor(
        @inject('prizeService') prizeService: IPrizeService
    ) {
        this.prizeService = prizeService;
    }

    async getAllPrizes(session: Session): Promise<ApiResponse<IPrize[] | ApiResponse<null>>> {
        return await this.prizeService.getAllPrizes(session) as ApiResponse<IPrize[] | ApiResponse<null>>;
    }

    async getPrizeById(id: string, session: Session): Promise<ApiResponse<IPrize | null>> {
        return await this.prizeService.getPrizeById(id, session);
    }

    async deletePrize(id: string, session: Session): Promise<ApiResponse<null>> {
        return await this.prizeService.deletePrize(id, session);
    }

    async updatePrize(id: string, updatedData: Record<string, any>, session: Session): Promise<ApiResponse<IPrize> | ApiResponse<null>> {
        try {
            return await this.prizeService.updatePrize(id, updatedData, session);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro interno do servidor ao atualizar prêmio',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
        categoryId: string;
    }, session: Session): Promise<ApiResponse<null> | ApiResponse<IPrize>> {
        try {
            return await this.prizeService.createPrize(prize, session);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro interno do servidor',
                statusCode: 500,
                cause: error as Error
            });
        }
    }
}