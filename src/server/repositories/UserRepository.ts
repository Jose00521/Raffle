import { User } from "@/models/User";
import { inject, injectable } from "tsyringe";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import type { IDBConnection } from "@/server/lib/dbConnect";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { ApiError } from "@/server/utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
export interface IUserRepository {
    createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<IUser>>;
}

@injectable()
export class UserRepository implements IUserRepository {
    private db: IDBConnection;

    constructor(
        @inject('db') db: IDBConnection
    ) {
        this.db = db;
    }

     async createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            //inicia conexão com o banco de dados
            await this.db.connect();

            //verifica se o usuário já existe
            const userExists = await this.checkIfUserExists(user);

            if(userExists){
                return createErrorResponse('Usuário já cadastrado', 400);
            }

            //cria o usuário
            const userData = await User.create(user);

            //gera o código do usuário(userCode)
            userData.userCode = generateEntityCode(userData._id, 'US');

            //salva o usuário
            await userData.save();

            
            return createSuccessResponse(userData, 'Usuário criado com sucesso', 200);

        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar usuário',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async checkIfUserExists(user: IUser) {
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
            const userExists = await User.findOne({ $or: conditions });
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

    async quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            
            await this.db.connect();

            const user = await User.findOne({ phone: phone }, {
                _id: 0,
                userCode: 1,
                address: 1,
                name: 1,
                email: 1,
                cpf: 1,
                phone: 1,
            });

            if(!user){
                return createSuccessResponse(null, 'Usuário não encontrado', 404);
            }

            return createSuccessResponse(user, 'Usuário encontrado', 200);


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