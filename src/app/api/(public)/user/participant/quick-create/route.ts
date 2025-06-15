import { NextRequest, NextResponse } from "next/server";
import { container } from "@/server/container/container";
import { UserController } from "@/server/controllers/UserController";
import { createErrorResponse, createSuccessResponse } from "@/server/utils/errorHandler/api";

export async function POST(request: NextRequest,response: NextResponse) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json();
        
        // Seu código existente...
        const userController = container.resolve(UserController);
        const result = await userController.quickUserCreate(body);
        
        // Garantir resposta válida
        return NextResponse.json(result,
          { 
            status: 200, 
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