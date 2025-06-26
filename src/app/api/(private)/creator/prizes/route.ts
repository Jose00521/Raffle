import 'reflect-metadata';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { container } from '@/server/container/container';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
import { PrizeController } from '@/server/controllers/PrizeController';
import logger from "@/lib/logger/logger";
import { withAuth } from '@/lib/auth/apiAuthHelper';
import { Session } from 'next-auth';
/**
 * Endpoint GET: Obter detalhes de uma campanha específica por ID
 */


export const GET = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    const prizeController = container.resolve(PrizeController);
    const prizes = await prizeController.getAllPrizes(session);
    return NextResponse.json(prizes, { status: 200 });
}, { allowedRoles: ['creator'] });



export const POST = withAuth(async (request: NextRequest, { params, session }: { params: { id: string }, session: Session }) => {
    try {
        const formData = await request.formData();
        
        // Logs detalhados para debug
        logger.info("FormData recebido na API:");
        for (const key of formData.keys()) {
            if (key === 'data') {
                logger.info(`- ${key}: ${formData.get(key)}`);
            } else {
                const value = formData.get(key);
                logger.info(`- ${key}: ${typeof value !== 'string' ? `File: ${value?.name}, type: ${value?.type}, size: ${value?.size}` : value}`);
            }
        }
        
        // Verificar imagens - mais detalhado
        const images = formData.getAll('images');
        logger.info(`Total de imagens recebidas: ${images.length}`);
        images.forEach((img, i) => {
            if (typeof img !== 'string') {
                logger.info(`Imagem ${i}: ${img.name}, tipo: ${img.type}, tamanho: ${img.size}`);
            } else {
                logger.info(`Imagem ${i}: não é um arquivo, é ${typeof img}`);
            }
        });
        
        const prizeText  = JSON.parse(formData.get('data') as string);
        
        const image = formData.get('image') as any;
        const prize = {
            ...prizeText,
            image: image,
            images: images as any[]
        }

        logger.info("Dados do prêmio montados:", {
            ...prizeText,
            hasImage: !!image,
            imageType: image?.type,
            imageSize: image?.size,
            imagesCount: images.length
        });

        const prizeController = container.resolve(PrizeController);
        const prizeCreate = await prizeController.createPrize(prize, session);

        return NextResponse.json(prizeCreate, { status: 200 });

      } catch (error) {
        // Log detalhado do erro no servidor
        console.error("ERRO DETALHADO NA API:", error);
        if (error instanceof Error) {
          console.error("Nome:", error.name);
          console.error("Mensagem:", error.message);
          console.error("Stack:", error.stack);
        }
        
        // Garantir que SEMPRE retorne um JSON válido, mesmo em erro
        return NextResponse.json(
          JSON.stringify(createErrorResponse('Erro interno do servidor', 500)),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
}, { allowedRoles: ['creator'] });
