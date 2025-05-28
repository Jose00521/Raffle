import { ApiResponse } from "@/server/utils/errorHandler/api";

const prizeAPIClient = {
    createPrize: async (prize: any) => {
        try {
            const response = await fetch('/api/prizes', {
              method: 'POST',
              body: prize
            });
            // Verificar primeiro o status
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
}

export default prizeAPIClient;