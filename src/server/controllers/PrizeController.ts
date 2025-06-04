import 'reflect-metadata';
import { inject, injectable } from "tsyringe";
import type {IUserService} from "../services/UserService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import type { IPrizeService } from "../services/PrizeService";

export interface IPrizeController {
    getAllPrizes(): Promise<ApiResponse<IPrize[] | ApiResponse<null>>>;
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
    getPrizeById(id: string): Promise<ApiResponse<IPrize>>;
    deletePrize(id: string): Promise<ApiResponse<null>>;
    updatePrize(id: string, updatedData: Record<string, any>): Promise<ApiResponse<IPrize> | ApiResponse<null>>;
}

@injectable()
export class PrizeController implements IPrizeController {
    private prizeService: IPrizeService;

    constructor(
        @inject('prizeService') prizeService: IPrizeService
    ) {
        this.prizeService = prizeService;
    }

    async getAllPrizes(): Promise<ApiResponse<IPrize[] | ApiResponse<null>>> {
        return await this.prizeService.getAllPrizes() as ApiResponse<IPrize[] | ApiResponse<null>>;
    }

    async getPrizeById(id: string): Promise<ApiResponse<IPrize>> {
        return await this.prizeService.getPrizeById(id);
    }

    async deletePrize(id: string): Promise<ApiResponse<null>> {
        return await this.prizeService.deletePrize(id);
    }

    async updatePrize(id: string, updatedData: Record<string, any>): Promise<ApiResponse<IPrize> | ApiResponse<null>> {
        try {
            return await this.prizeService.updatePrize(id, updatedData);
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
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>> {
        try {
            return await this.prizeService.createPrize(prize);
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