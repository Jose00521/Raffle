import { inject, injectable } from "tsyringe";
import type {IUserService} from "../services/UserService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";

export interface IUserController {
    createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>>;
}

@injectable()
export class UserController implements IUserController {
    private userService: IUserService;

    constructor(
        @inject('userService') userService: IUserService
    ) {
        this.userService = userService;
    }

    async createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            const securePassword = await bcrypt.hash(user.password, 10);
            
            return await this.userService.createUser({...user,password: securePassword});
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