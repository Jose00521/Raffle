import { inject, injectable } from "tsyringe";
import * as UserService from "../services/UserService";
import { IUser } from "@/models/interfaces/IUserInterfaces";
import bcrypt from "bcrypt";

export interface IUserController {
    createUser(user: IUser): Promise<IUser>;
}

@injectable()
export class UserController implements IUserController {
    private userService: UserService.IUserService;

    constructor(
        @inject('userService') userService: UserService.IUserService
    ) {
        this.userService = userService;
    }

    async createUser(user: IUser): Promise<IUser> {
        try {
            const securePassword = await bcrypt.hash(user.password, 10);

            return await this.userService.createUser({...user,password: securePassword});
        } catch (error) {
            throw new Error(error as string);
        }
    }
}