import { IUser } from "@/models/interfaces/IUserInterfaces";
import { ApiResponse } from "@/server/utils/errorHandler/api";

const userAPI = {
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


    requestLogin: async (phone: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'  
                },
                body: JSON.stringify({ phone, password })
            });
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
export default userAPI;