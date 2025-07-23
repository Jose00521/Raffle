export const adminGatewayAPIClient = {
    createGateway: async (body: any) => {
        try {
            const response = await fetch('/api/admin/gateways', {
                method: 'POST',
                body: JSON.stringify(body)
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
