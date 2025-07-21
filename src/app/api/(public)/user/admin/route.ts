
import { container } from '@/server/container/container';
import { UserController } from '@/server/controllers/UserController';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
import { validateWithSchema } from '@/utils/validation.schema';
import { registerUserSchema } from '@/zod/user.schema';
import { convertAdminFormToSchema, convertParticipantFormToSchema } from '@/zod/utils/convertToSchema';
import { NextResponse } from 'next/server';
import { IAdmin, IRegularUser } from '@/models/interfaces/IUserInterfaces';
import { createValidationErrorObject } from '@/server/utils/errorHandler/api';
import { AdminController } from '@/server/controllers/AdminController';
import { AdminCompleteSchema, AdminComplete, } from '@/zod/admin.schema';
/**
 * Endpoint POST: Criar um usuário participante
 */

const validator = validateWithSchema(AdminCompleteSchema);

export async function POST( request: NextResponse, response: NextResponse) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json() as Partial<IAdmin>; 

        console.log('body admin', body);


        if(body.role !== 'admin'){
            return NextResponse.json(createValidationErrorObject(null, 'Role inválida', 422));
        }

        const validate = validator(convertAdminFormToSchema(body));

        console.log('validate admin', validate);

        if (!validate.success) {
            return NextResponse.json(createValidationErrorObject(validate.errors, 'Erro de validação', 422));
        }
        
        // Seu código existente...
        const adminController = container.resolve(AdminController);
        const result = await adminController.createAdmin(body);

        console.log('result', result);
        // Garantir resposta válida
        return NextResponse.json(result);
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