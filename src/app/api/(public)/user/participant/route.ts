
import { container } from '@/server/container/container';
import { UserController } from '@/server/controllers/UserController';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
import { validateWithSchema } from '@/utils/validation.schema';
import { registerUserSchema } from '@/zod/user.schema';
import { convertParticipantFormToSchema } from '@/zod/utils/convertToSchema';
import { NextResponse } from 'next/server';
import { IRegularUser } from '@/models/interfaces/IUserInterfaces';
import { createValidationErrorObject } from '@/server/utils/errorHandler/api';
/**
 * Endpoint POST: Criar um usuário participante
 */

const validator = validateWithSchema(registerUserSchema);

export async function POST( request: Request,response: NextResponse) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json() as IRegularUser;

        console.log('body participant', body);


        if(body.role !== 'user'){
            return NextResponse.json(createValidationErrorObject(null, 'Role inválida', 422));
        }

        const validate = validator(convertParticipantFormToSchema(body));

        console.log('validate participant', validate);

        if (!validate.success) {
            return NextResponse.json(createValidationErrorObject(validate.errors, 'Erro de validação', 422));
        }
        
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