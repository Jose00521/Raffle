import { ICategory } from "@/models/interfaces/IPrizeInterfaces";

const prizeCategoryAPIClient = {
    createCategory: async (category: ICategory) => {
        const response = await fetch('/api/prizes/categories', {
            method: 'POST',
            body: JSON.stringify(category),
        });
        return response.json();
    },
    getAllCategories: async () => {
        try {
            const response = await fetch('/api/prizes/categories');
            return response.json();
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                message: 'Erro ao comunicar com o servidor',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }
};

export default prizeCategoryAPIClient;