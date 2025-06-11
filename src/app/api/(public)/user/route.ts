import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '../../../../server/container/container';
import { UserController } from '@/server/controllers/UserController';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */


export async function POST( request: Request,response: Response) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json();
        
        // Seu código existente...
        const userController = container.resolve(UserController);
        const result = await userController.createUser(body);
        
        // Garantir resposta válida
        return new Response(
          JSON.stringify(result || { success: false, message: "Resposta vazia" }),
          { 
            status: 200, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      } catch (error) {
        // Log detalhado do erro no servidor
        console.error("ERRO DETALHADO NA API:", error);
        if (error instanceof Error) {
          console.error("Nome:", error.name);
          console.error("Mensagem:", error.message);
          console.error("Stack:", error.stack);
        }
        
        // Garantir que SEMPRE retorne um JSON válido, mesmo em erro
        return new Response(
          JSON.stringify(createErrorResponse('Erro interno do servidor', 500)),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
}