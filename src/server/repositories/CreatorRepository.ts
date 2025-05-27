import { inject, injectable } from "tsyringe";
import type { IDBConnection } from "../lib/dbConnect";
import { ICreator } from "@/models/interfaces/IUserInterfaces";
import mongoose from "mongoose";
import { Creator, User } from "@/models/User";
import { ApiError } from "../utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { generateEntityCode } from "@/models/utils/idGenerator";

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

            const creator = await Creator.create(creatorData);

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
            if(user.email){
                conditions.push({ email: user.email });
            }
            if(user.cpf){
                conditions.push({ cpf: user.cpf });
            }
            if(user.phone){
                conditions.push({ phone: user.phone });
            }
            const userExists = await Creator.findOne({ $or: conditions });
            if(userExists){
                return true;
            }
            return false;
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
