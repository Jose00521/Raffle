import { inject, injectable } from "tsyringe";
import * as UserService from "../services/UserService";
import { IUser } from "@/models/User";

@injectable()
export class UserController {
    private userService: UserService.IUserService;

    constructor(
        @inject('userService') userService: UserService.IUserService
    ) {
        this.userService = userService;
    }

    async createUser(user: IUser): Promise<IUser> {
        return await this.userService.createUser(user);
    }
}