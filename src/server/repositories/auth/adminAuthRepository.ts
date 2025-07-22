import { Admin, User } from '@/models/User';
import { inject, injectable } from "tsyringe";
import type { IAdmin, IUser } from '@/models/interfaces/IUserInterfaces';
import { compare } from 'bcrypt';
import { ApiError } from '@/server/utils/errorHandler/ApiError';
import type { IDBConnection } from '@/server/lib/dbConnect';

export interface IAdminAuthRepository {
    findByCredentials(email: string, cpf: string, password: string): Promise<IAdmin | null>;
}

@injectable()
export class AdminAuthRepository implements IAdminAuthRepository {
    private db: IDBConnection;

    constructor(
        @inject("db") db: IDBConnection
    ) {
        this.db = db;
    }

    async findByCredentials(email: string, cpf: string, password: string): Promise<IAdmin | null> {
        try {

            const { SecureDataUtils } = await import('@/utils/encryption');


            await this.db.connect();
            
            const admin: IAdmin | null = await Admin.findOne({ 
                email_hash: SecureDataUtils.hashEmail(email),
                cpf_hash: SecureDataUtils.hashDocument(cpf),
            }, '+password').lean() as IAdmin | null;

        
            if (!admin) {
                return null;
            }

            //Verifica se a senha é válida, comparando a senha fornecida com a senha armazenada via bcrypt
            const isPasswordValid = await compare(password, admin.password);

            return isPasswordValid ? admin : null;

        } catch (error) {
            
            throw new ApiError({
                message: 'Erro ao buscar admin por credenciais',
                statusCode: 500,
                cause: error as Error,
                success: false
            });

        }
    }
}