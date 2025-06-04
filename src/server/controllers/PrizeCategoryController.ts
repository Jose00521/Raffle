import { injectable, inject } from "tsyringe";
import type { IPrizeCategoryService } from "../services/PrizeCategoryService";
import { ApiResponse, createSuccessResponse } from "../utils/errorHandler/api";
import { ICategory } from "@/models/interfaces/IPrizeInterfaces";


export interface IPrizeCategoryController {
    createCategory(category: ICategory): Promise<ApiResponse<ICategory>>;
    getAllCategories(): Promise<ApiResponse<ICategory[]>>;
}

@injectable()
export class PrizeCategoryController implements IPrizeCategoryController {
    private prizeCategoryService: IPrizeCategoryService;

    constructor(@inject('prizeCategoryService') prizeCategoryService: IPrizeCategoryService) {
        this.prizeCategoryService = prizeCategoryService;
    }

    async createCategory(category: ICategory) {
        const newCategory = await this.prizeCategoryService.createCategory(category);
        return createSuccessResponse(newCategory, 'Categoria criada com sucesso', 201);
    }

    async getAllCategories() {
        const categories = await this.prizeCategoryService.getAllCategories();
        return createSuccessResponse(categories, 'Categorias encontradas com sucesso', 200);
    }
    
}