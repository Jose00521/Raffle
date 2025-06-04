import { injectable, inject } from "tsyringe";
import type { IPrizeCategoryRepository } from "../repositories/PrizeCategoryRepository";
import { ICategory } from "@/models/interfaces/IPrizeInterfaces";


export interface IPrizeCategoryService {
    createCategory(category: ICategory): Promise<ICategory>;
    getAllCategories(): Promise<ICategory[]>;
}


@injectable()
export class PrizeCategoryService implements IPrizeCategoryService {
    private prizeCategoryRepository: IPrizeCategoryRepository;

    constructor(@inject('prizeCategoryRepository') prizeCategoryRepository: IPrizeCategoryRepository) {
        this.prizeCategoryRepository = prizeCategoryRepository;
    }

    async createCategory(category: ICategory): Promise<ICategory> {
        return await this.prizeCategoryRepository.createCategory(category);
    }

    async getAllCategories(): Promise<ICategory[]> {
        return await this.prizeCategoryRepository.getAllCategories();
    }
}