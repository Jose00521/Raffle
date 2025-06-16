import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { container } from '../../../../../server/container/container';
import { CreatorController } from '@/server/controllers/CreatorController';
import { createErrorResponse, createValidationErrorObject } from '@/server/utils/errorHandler/api';
import { validateWithSchema } from '@/utils/validation.schema';
import { creatorFormSchema } from '@/zod/creator.schema';
import { ICreator } from '@/models/interfaces/IUserInterfaces';
import { convertCreatorFormToSchema } from '@/zod/utils/convertToSchema';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */

const validator = validateWithSchema(creatorFormSchema);

export async function POST( request: Request,response: Response) {
    try {
        // Envolva todo o código em try/catch
        const body = await request.json() as ICreator;

        if(body.role !== 'creator'){
          return NextResponse.json(createValidationErrorObject(null,'Role inválida', 422));
        }

        console.log('body creator', body);

        const validate = validator(convertCreatorFormToSchema(body));

        console.log('validate creator', validate);

        if (!validate.success) {
            return NextResponse.json(createValidationErrorObject(validate.errors, 'Erro de validação', 422));
        }

        // Seu código existente...
        const creatorController = container.resolve(CreatorController);
        const result = await creatorController.createCreator(body);

        
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