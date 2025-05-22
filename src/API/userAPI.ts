import { IUser } from "@/models/interfaces/IUserInterfaces";
import { ApiResponse } from "@/types/api";

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
            
            // Tentar ler o texto da resposta, independente do status
            const text = await response.text();
            
            // Se não houver texto, retornar erro formatado
            if (!text || text.trim() === '') {
              console.error('Resposta vazia do servidor');
              return {
                success: false,
                statusCode: response.status,
                message: `Erro do servidor (${response.status}) sem detalhes`
              };
            }
            
            // Tentar fazer parse do texto
            try {
              return JSON.parse(text);
            } catch (parseError) {
              console.error('Erro ao processar resposta:', parseError);
              console.error('Texto recebido:', text);
              return {
                success: false,
                statusCode: response.status,
                message: 'Resposta inválida do servidor',
                text: text // incluir o texto para debug
              };
            }
          } catch (error) {
            console.error('Erro na requisição:', error);
            return {
              success: false,
              statusCode: 500,
              message: 'Erro ao comunicar com o servidor',
              error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
          }
    },
}
export default userAPI;