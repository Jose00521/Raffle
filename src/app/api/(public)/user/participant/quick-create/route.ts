import { NextRequest, NextResponse } from "next/server";
import { container } from "@/server/container/container";
import { UserController } from "@/server/controllers/UserController";
import { createErrorResponse, createSuccessResponse, createValidationErrorObject } from "@/server/utils/errorHandler/api";
import { signupSchema } from "@/zod/quicksignup.validation";
import { validateWithSchema } from "@/utils/validation.schema";
import { convertQuickSignupFormToSchema } from "@/zod/utils/convertToSchema";
import { IRegularUser } from "@/models/interfaces/IUserInterfaces";

const validator = validateWithSchema(signupSchema);


export async function POST(request: NextRequest,response: NextResponse) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json() as IRegularUser;
        
        if(body.role !== 'user'){
            return NextResponse.json(createValidationErrorObject(null, 'Role inválida', 422));
        }

        const validate = validator(convertQuickSignupFormToSchema(body));

        if(!validate.success){
            return NextResponse.json(createValidationErrorObject(validate.errors, 'Erro de validação', 422));
        }

        
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