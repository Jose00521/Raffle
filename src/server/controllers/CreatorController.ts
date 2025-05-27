import { inject, injectable } from "tsyringe";
import type {IUserService} from "../services/UserService";
import { ICreator, IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";
import type { ICreatorService } from "../services/CreatorService";

export interface ICreatorController {
    createCreator(creator: ICreator): Promise<ApiResponse<null> | ApiResponse<ICreator>>;
}

@injectable()
export class CreatorController implements ICreatorController {
    private creatorService: ICreatorService;

    constructor(
        @inject('creatorService') creatorService: ICreatorService
    ) {
        this.creatorService = creatorService;
    }

    async createCreator(creator: ICreator): Promise<ApiResponse<null> | ApiResponse<ICreator>> {
        try {
            const securePassword = await bcrypt.hash(creator.password, 10);
            
            return await this.creatorService.createCreator({...creator,password: securePassword});
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