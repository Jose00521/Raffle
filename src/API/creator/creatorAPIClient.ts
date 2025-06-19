import { ICreator } from '@/models/interfaces/IUserInterfaces';

const creatorAPIClient = {
    createCreator: async (creator: Partial<ICreator>) => {
        try {
            const response = await fetch('/api/user/creator', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(creator)
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

export default creatorAPIClient;