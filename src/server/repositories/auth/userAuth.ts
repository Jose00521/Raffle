import { User } from '@/models/User';
import { inject, injectable } from "tsyringe";
import type { IUser } from '@/models/interfaces/IUserInterfaces';
import { compare } from 'bcrypt';
import { ApiError } from '@/server/utils/errorHandler/ApiError';
import type { IDBConnection } from '@/server/lib/dbConnect';

export interface IUserAuthRepository {
    findByCredentials(phone: string, password: string): Promise<IUser | null>;
}

@injectable()
export class UserAuthRepository implements IUserAuthRepository {
    private db: IDBConnection;

    constructor(
        @inject("db") db: IDBConnection
    ) {
        this.db = db;
    }

    async findByCredentials(phone: string, password: string): Promise<IUser | null> {
        try {
            console.log('phone', phone);
            console.log('password', password);

            const { SecureDataUtils } = await import('@/utils/encryption');


            await this.db.connect();
            
            const user: IUser | null = await User.findOne({ phone_hash: SecureDataUtils.hashPhone(phone) }, '+password').lean() as IUser | null;

        
            if (!user) {
                return null;
            }

            //Verifica se a senha é válida, comparando a senha fornecida com a senha armazenada via bcrypt
            const isPasswordValid = await compare(password, user.password);

            return isPasswordValid ? user : null;

        } catch (error) {
            
            throw new ApiError({
                message: 'Erro ao buscar usuário por credenciais',
                statusCode: 500,
                cause: error as Error,
                success: false
            });

        }
    }
}