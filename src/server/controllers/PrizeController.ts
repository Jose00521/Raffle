import { inject, injectable } from "tsyringe";
import type {IUserService} from "../services/UserService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";
import { IPrize } from "@/models/interfaces/IPrizeInterfaces";
import type { IPrizeService } from "../services/PrizeService";

export interface IPrizeController {
    createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
    }): Promise<ApiResponse<null> | ApiResponse<IPrize>>;
}

@injectable()
export class PrizeController implements IPrizeController {
    private prizeService: IPrizeService;

    constructor(
        @inject('prizeService') prizeService: IPrizeService
    ) {
        this.prizeService = prizeService;
    }

    async createPrize(prize: {
        name: string;
        description: string;
        value: string;
        image: File;
        images: File[];
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