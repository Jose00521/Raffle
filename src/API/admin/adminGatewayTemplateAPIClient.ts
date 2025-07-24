export const adminGatewayTemplateAPIClient = {

    getAllGatewayTemplates: async () => {

        try {
            const response = await fetch('/api/admin/gateways', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                console.error(`Erro do servidor: ${response.status} ${response.statusText}`);
            }
            return response.json();
        }
        catch (error) {
            return {
                success: false,
                statusCode: 500,
                message: 'Erro ao comunicar com o servidor',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    },

    createGateway: async (body: FormData) => {
        try {
            const response = await fetch('/api/admin/gateways', {
                method: 'POST',
                body: body
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
    },

    verifyIfAlreadyExists: async (templateCode: string) => {
        try {
            const response = await fetch(`/api/admin/gateways/verify/${templateCode}`, {
                method: 'GET',
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
