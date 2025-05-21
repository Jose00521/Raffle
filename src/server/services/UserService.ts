import { IUser } from "@/models/User";
import { inject, injectable } from "tsyringe";
import * as UserRepository from "../repositories/UserRepository";

export interface IUserService {
    createUser(user: IUser): Promise<IUser>;
}

@injectable()
export class UserService implements IUserService {
    private userRepository: UserRepository.IUserRepository;

    constructor(
        @inject('userRepository') userRepository: UserRepository.IUserRepository
    ) {
        this.userRepository = userRepository;
    }

    async createUser(user: IUser): Promise<IUser> {
        return await this.userRepository.createUser(user);
    }
}