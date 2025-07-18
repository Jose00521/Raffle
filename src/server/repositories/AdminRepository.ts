import { inject, injectable } from "tsyringe";
import { IAdmin } from "@/models/interfaces/IUserInterfaces";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import type{ IDBConnection } from "../lib/dbConnect";
import AdminInvite, { IAdminInvite } from "@/models/AdminInvite";
import { ApiError } from "../utils/errorHandler/ApiError";

export interface IAdminRepository {
    validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>>;
    createAdmin(admin: IAdmin): Promise<ApiResponse<null> | ApiResponse<IAdmin>>;
}

@injectable()
export class AdminRepository implements IAdminRepository {

    constructor(
        @inject("db") private db: IDBConnection
    ) {}

    async validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>> {
        //Validação do convite
        try {
            await this.db.connect();

            const invite = await AdminInvite.findOne({
                token: token,
                isUsed: false,
                expiresAt: { $gt: new Date() }
              });

              if(!invite){
                return createErrorResponse('Convite inválido ou expirado', 404);
              }

              return createSuccessResponse(invite, 'Convite validado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao validar convite',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async createAdmin(admin: IAdmin): Promise<ApiResponse<null> | ApiResponse<IAdmin>> {
        //TODO: Implementar a criação do admin
        return createSuccessResponse(admin, 'Admin criado com sucesso', 200);
    }

}
