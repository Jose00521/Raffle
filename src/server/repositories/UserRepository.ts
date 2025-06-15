import { User } from "@/models/User";
import { inject, injectable } from "tsyringe";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import type { IDBConnection } from "@/server/lib/dbConnect";
import { generateEntityCode } from "@/models/utils/idGenerator";
import { ApiError } from "@/server/utils/errorHandler/ApiError";
import { ApiResponse, createErrorResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { maskCPF, maskEmail, maskPhone } from "@/utils/maskUtils";
import { SecureDataUtils } from "@/utils/encryption";


export interface IUserRepository {
    createUser(user: IUser): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickCheckUser(phone: string): Promise<ApiResponse<null> | ApiResponse<IUser>>;
    quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<IUser>>;
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
            const userData = new User({
                ...user,
            });

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

    async checkIfUserExists(user: Partial<IUser>) {
        try {
            await this.db.connect();
            let conditions = [];
            
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
            
            if(conditions.length === 0) return false;
            
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

            const { EncryptionService, SecureDataUtils } = await import('@/utils/encryption');

            const user = await User.findOne({ phone_hash: SecureDataUtils.hashForSearch(phone) }, {
                _id: 0,
                userCode: 1,
                address: 1,
                name: 1,
                email_display: 1,
                cpf_display: 1,
                phone_display: 1,
            });

            if(!user){
                return createSuccessResponse(null, 'Usuário não encontrado', 404);
            }

            console.log('user', user);

            return createSuccessResponse({
                name: user.name,
                userCode: user.userCode,
                address: user.address,
                cpf: user.cpf_display,
                phone: user.phone_display,
                email: user.email_display,
            } as IUser, 'Usuário encontrado', 200);


        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao checar se o usuário já existe',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async quickUserCreate(user: Partial<IUser>): Promise<ApiResponse<null> | ApiResponse<IUser>> {
        try {
            await this.db.connect();
            const userExists = await this.checkIfUserExists(user);

            if(userExists){
                return createErrorResponse('Usuário já cadastrado', 400);
            }

            const newUser = new User({
                ...user,
            });



            newUser.userCode = generateEntityCode(newUser._id, 'US');
            await newUser.save();

            return createSuccessResponse({
                name: newUser.name,
                userCode: newUser.userCode,
                address: newUser.address,
                cpf: newUser.cpf_display,
                phone: newUser.phone_display,
                email: newUser.email_display,
            } as IUser, 'Usuário criado com sucesso', 200);
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar usuário',
                statusCode: 500,
                cause: error as Error
            });
        }
    }
}