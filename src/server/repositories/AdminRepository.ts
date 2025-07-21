import { inject, injectable } from "tsyringe";
import { IAdmin } from "@/models/interfaces/IUserInterfaces";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import type{ IDBConnection } from "../lib/dbConnect";
import AdminInvite, { IAdminInvite } from "@/models/AdminInvite";
import { ApiError } from "../utils/errorHandler/ApiError";
import { SecureDataUtils } from "@/utils/encryption";
import { Admin } from "@/models/User";
import { generateEntityCode } from "@/models/utils/idGenerator";

export interface IAdminRepository {
    validateInvite(token: string): Promise<ApiResponse<null> | ApiResponse<IAdminInvite>>;
    createAdmin(admin: Partial<IAdmin>): Promise<ApiResponse<null> | ApiResponse<IAdmin>>;
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

    async createAdmin(adminData: Partial<IAdmin>): Promise<ApiResponse<null> | ApiResponse<IAdmin>> {
        try {
            await this.db.connect();

            const adminExists = await this.checkIfAdminExists(adminData);

            if(adminExists){
                return createErrorResponse('Admin já existe', 400);
            }

            const admin = new Admin({
                ...adminData,
                
            });

            admin.userCode = generateEntityCode(admin._id, 'AD');

            //salva o usuário
            await admin.save();

            return createSuccessResponse(admin, 'Admin criado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar admin',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async checkIfAdminExists(user: Partial<IAdmin>) {
        try {
            await this.db.connect();
            let conditions = [];
            
            // ✅ CORRETO: Buscar pelos campos HASH
            if(user.email){
                const emailHash = SecureDataUtils.hashEmail(user.email);
                conditions.push({ email_hash: emailHash });
            }
            if(user.cpf){
                const cpfHash = SecureDataUtils.hashDocument(user.cpf);
                conditions.push({ cpf_hash: cpfHash });
            }
            if(user.phone){
                const phoneHash = SecureDataUtils.hashPhone(user.phone);
                conditions.push({ phone_hash: phoneHash });
            }
            
            if(conditions.length === 0) return false;
            
            const userExists = await Admin.findOne({ $or: conditions });
            return !!userExists;
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao checar se o usuário já existe',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

}
