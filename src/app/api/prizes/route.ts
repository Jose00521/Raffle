import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { CampaignController } from '@/server/controllers/CampaignController';
import { container } from '../../../server/container/container';
import { UserController } from '@/server/controllers/UserController';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
import { PrizeController } from '@/server/controllers/PrizeController';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */


export async function POST( request: Request,response: Response) {
    try {
        const formData = await request.formData();
        const prizeText  = JSON.parse(formData.get('data') as string);
        
        const image = formData.get('image') as File;
        const images = formData.getAll('images') as File[];

        const prize = {
            ...prizeText,
            image: image,
            images: images
        }

        const prizeController = container.resolve(PrizeController);
        const prizeCreate = await prizeController.createPrize(prize);



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