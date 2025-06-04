import { injectable, inject } from "tsyringe";
import type { IDBConnection } from "@/server/lib/dbConnect";
import { ICategory } from "@/models/interfaces/IPrizeInterfaces";
import PrizeCategory from "@/models/PrizeCategory";
import { ApiError } from "../utils/errorHandler/ApiError";
import { generateEntityCode } from "@/models/utils/idGenerator";




export interface IPrizeCategoryRepository {
    createCategory(category: ICategory): Promise<ICategory>;
    getAllCategories(): Promise<ICategory[]>;
}

@injectable()
export class PrizeCategoryRepository implements IPrizeCategoryRepository {
    private db: IDBConnection;

    constructor(@inject('db') db: IDBConnection) {
        this.db = db;
    }

    async createCategory(category: ICategory): Promise<ICategory> {
        try {
            await this.db.connect();

            const newCategory = await PrizeCategory.create(category);
            
            newCategory.categoryCode = generateEntityCode(newCategory._id, 'PC');

            await newCategory.save();

            return {
                ...newCategory.toObject(),
                _id: "",
            };
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao criar categoria',
                statusCode: 500,
                cause: error as Error
            });
        }
    }

    async getAllCategories(): Promise<ICategory[]> {
        try {
            await this.db.connect();
            const categories = await PrizeCategory.find().select("-_id");
            return categories;
        } catch (error) {
            throw new ApiError({
                success: false,
                message: 'Erro ao buscar categorias',
                statusCode: 500,
                cause: error as Error
            });
        }
    }   

}
