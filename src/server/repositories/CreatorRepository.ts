import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ICreator } from "@/models/interfaces/IUserInterfaces";
import mongoose from "mongoose";
import { Creator, User } from "@/models/User";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { SecureDataUtils } from "@/utils/encryption";

// type CreatorModel = mongoose.Model<ICreator>;

export interface ICreatorRepository {
    createCreator(creatorData: ICreator): Promise<ApiResponse<null> | ApiResponse<ICreator>>;
    checkIfCreatorrExists(creator: ICreator): Promise<boolean>;
}


@injectable()
export class CreatorRepository implements ICreatorRepository {
    private db: IDBConnection;

    constructor(
        @inject("db") db: IDBConnection
    ) {
        this.db = db;
    }

    async createCreator(creatorData: ICreator): Promise<ApiResponse<null> | ApiResponse<ICreator>> {
        try {
            await this.db.connect();

            const creatorExists = await this.checkIfCreatorrExists(creatorData);

            if(creatorExists){
                return createErrorResponse('Criador já existe', 400);
            }

            const creator = new Creator({
                ...creatorData,
            });


            creator.userCode = generateEntityCode(creator._id, 'US');

            //salva o usuário
            await creator.save();

            return createSuccessResponse(creator, 'Criador criado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar criador',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async checkIfCreatorrExists(user: ICreator) {
        try {
            await this.db.connect();
            let conditions = [];
            
            // ✅ CORRETO: Buscar pelos campos HASH
            if(user.email){
                const emailHash = SecureDataUtils.hashForSearch(user.email);
                conditions.push({ email_hash: emailHash });
            }
            if(user.cpf){
                const cpfHash = SecureDataUtils.hashForSearch(user.cpf);
                conditions.push({ cpf_hash: cpfHash });
            }
            if(user.phone){
                const phoneHash = SecureDataUtils.hashForSearch(user.phone);
                conditions.push({ phone_hash: phoneHash });
            }
            if(user.cnpj){
                const cnpjHash = SecureDataUtils.hashForSearch(user.cnpj);
                conditions.push({ cnpj_hash: cnpjHash });
            }
            
            if(conditions.length === 0) return false;
            
            const userExists = await Creator.findOne({ $or: conditions });
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
