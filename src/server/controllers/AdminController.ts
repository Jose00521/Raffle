import { inject, injectable } from "tsyringe";
import { IAdmin } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse } from "../utils/errorHandler/api";
import type { IAdminService } from "../services/AdminService";
import { IAdminInvite } from "@/models/AdminInvite";

export interface IAdminController {
    validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>>;
    createAdmin(admin: IAdmin): Promise<ApiResponse<null> | ApiResponse<IAdmin>>;
}

@injectable()
export class AdminController implements IAdminController {
    private adminService: IAdminService;

    constructor(
        @inject('adminService') adminService: IAdminService
    ) {
        this.adminService = adminService;   
    }

    async validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>> { 
        return this.adminService.validateInvite(token);
    }

    async createAdmin(admin: IAdmin): Promise<ApiResponse<null> | ApiResponse<IAdmin>> {
        try {
            const securePassword = await bcrypt.hash(admin.password, 10);
            
            return await this.adminService.createAdmin({...admin, password: securePassword});
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