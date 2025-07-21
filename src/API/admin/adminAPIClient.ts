import { IAdmin } from "@/models/interfaces/IUserInterfaces";

const adminAPIClient = {
    // Valida o token de convite
    validateInvite: async (token: string) => {
        try {
            const response = await fetch(`/api/user/admin/validate-invite/${token}`);
            return response.json();
        } catch (error) {
            return {
                success: false,
                statusCode: 500,
                message: 'Erro ao comunicar com o servidor',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    },

    // Cria um novo admin
    createAdmin: async (admin: Partial<IAdmin>) => {
        try {
            const response = await fetch('/api/user/admin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(admin)
            });
            if (!response.ok) {
                console.error(`Erro do servidor: ${response.status} ${response.statusText}`);
            }
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

}

export default adminAPIClient;