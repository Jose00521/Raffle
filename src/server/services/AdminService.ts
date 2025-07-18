import { inject, injectable } from "tsyringe";
import type { IAdminRepository } from "../repositories/AdminRepository";
import { IAdmin } from "@/models/interfaces/IUserInterfaces";
import { ApiResponse } from "../utils/errorHandler/api";
import { IAdminInvite } from "@/models/AdminInvite";

export interface IAdminService {
    validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>>;
    createAdmin(admin: IAdmin): Promise<ApiResponse<null> | ApiResponse<IAdmin>>;
}

@injectable()
export class AdminService implements IAdminService {
    constructor(
        @inject('adminRepository') private adminRepository: IAdminRepository
    ) {}

    async validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>> {
        return this.adminRepository.validateInvite(token);
    }

    async createAdmin(admin: IAdmin): Promise<ApiResponse<null> | ApiResponse<IAdmin>> {
        return this.adminRepository.createAdmin(admin);
    }
}
