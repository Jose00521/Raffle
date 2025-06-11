import { IUser } from "@/models/interfaces/IUserInterfaces";
import { ApiResponse } from "@/server/utils/errorHandler/api";

const userAPIClient = {
    createUser: async (user: any) => {
        try {
            const response = await fetch('/api/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(user)
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


    requestLogin: async (credentials: {phone: string, password: string}) => {
        try {
            const response = await fetch('/api/auth/callback/credentials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  
                },
                body: JSON.stringify(credentials)
            });
            console.log('response',response);
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

    verifyIfUserExists: async (phone: string) => {
        try {
            const response = await fetch(`/api/user/check/${phone}`);
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
export default userAPIClient;