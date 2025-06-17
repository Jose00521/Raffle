import { IUser } from "@/models/interfaces/IUserInterfaces";
import { inject, injectable } from "tsyringe";
import type {IUserRepository} from "../repositories/UserRepository";
import { ApiResponse } from "../utils/errorHandler/api";

export interface IUserService {
    createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickCheckMainData(data: {cpf: string, email: string, phone: string}): Promise<ApiResponse<null> | ApiResponse<any>>;
}

@injectable()
export class UserService implements IUserService {
    private userRepository: IUserRepository;

    constructor(
        @inject('userRepository') userRepository: IUserRepository
    ) {
        this.userRepository = userRepository;
    }

    async createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        return await this.userRepository.createUser(user);
    }

    async quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        return await this.userRepository.quickCheckUser(phone);
    }

    async quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        return await this.userRepository.quickUserCreate(user);
    }

    async quickCheckMainData(data: {cpf: string, email: string, phone: string}): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        return await this.userRepository.quickCheckMainData(data);
    }
}   