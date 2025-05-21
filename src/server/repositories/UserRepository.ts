import { IUser, User } from "@/models/User";
import { inject, injectable } from "tsyringe";
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

            const userData = await User.create(user);
            userData.userCode = generateEntityCode(userData._id, 'US');
            await userData.save();

            
            return userData;
        } catch (error) {
            throw new Error(error as string);
        }
    }
}
