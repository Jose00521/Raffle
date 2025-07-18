const adminAPIClient = {
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
    }
}

export default adminAPIClient;