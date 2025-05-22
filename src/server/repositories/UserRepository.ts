import { User } from "@/models/User";
import { inject, injectable } from "tsyringe";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import * as dbConnect from '@/server/lib/dbConnect';
import { generateEntityCode } from "@/models/utils/idGenerator";
export interface IUserRepository {
    createUser(user: IUser): Promise<IUser>;
}

@injectable()
export class UserRepository implements IUserRepository {
    private db: dbConnect.IDBConnection;

    constructor(
        @inject('db') db: dbConnect.IDBConnection
    ) {
        this.db = db;
    }

     async createUser(user: IUser) {
        try {
            await this.db.connect();

            const userExists = await this.checkIfUserExists(user);
            if(userExists){
                throw new Error('Usuário já existe');
            }

            const userData = await User.create(user);
            userData.userCode = generateEntityCode(userData._id, 'US');
            await userData.save();

            
            return userData;
        } catch (error) {
            throw new Error(error as string);
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
            throw new Error(error as string);
        }
    }
}