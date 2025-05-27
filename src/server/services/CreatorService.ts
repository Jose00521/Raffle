import { ICreator } from "@/models/interfaces/IUserInterfaces";
import { inject, injectable } from "tsyringe";
import { ApiResponse } from "../utils/errorHandler/api";
import type { ICreatorRepository } from "../repositories/CreatorRepository";

export interface ICreatorService {
    createCreator(creator: ICreator): Promise<ApiResponse<null> | ApiResponse<ICreator>>;
}

@injectable()
export class CreatorService implements ICreatorService {
    private creatorRepository: ICreatorRepository;

    constructor(
        @inject('creatorRepository') creatorRepository: ICreatorRepository
    ) {
        this.creatorRepository = creatorRepository;
    }

    async createCreator(creator: ICreator): Promise<ApiResponse<null> | ApiResponse<ICreator>> {
        return await this.creatorRepository.createCreator(creator);
    }
}   