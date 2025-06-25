import 'reflect-metadata';
import { inject, injectable } from "tsyringe";
import type {IUserService} from "../services/UserService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";

export interface IUserController {
    createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>>;
    quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>>;
    quickCheckMainData(data: {cpf: string, email: string, phone: string}): Promise<ApiResponse<null> | ApiResponse<IUser>>;
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

    async quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>> {
        try {
            return await this.userService.quickCheckUser(phone);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro interno do servidor',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<Partial<IUser>>> {
        try {
            return await this.userService.quickUserCreate(user);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro interno do servidor',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async quickCheckMainData(data: {cpf: string, email: string, phone: string}): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            return await this.userService.quickCheckMainData(data);
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