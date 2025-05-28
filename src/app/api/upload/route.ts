// src/app/api/premios/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { createErrorResponse } from '@/server/utils/errorHandler/api';
import { rateLimit } from '@/lib/rateLimit';
import { processImage } from '@/lib/upload-service/processImage';
import { uploadToS3 } from '@/lib/upload-service/client/uploadToS3';


import Prize from '@/models/Prize';


// Configuração do rate limit
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
  tokensPerInterval: 5
});
/**
 * Cria um novo prêmio com upload de imagens integrado
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        createErrorResponse('Não autorizado', 401),
        { status: 401 }
      );
    }

    // Aplicar rate limiting
    try {
      await limiter.check(5, `${session.user.id}:premio-create`);
    } catch {
      return NextResponse.json(
        createErrorResponse('Muitas requisições, tente novamente mais tarde', 429),
        { status: 429 }
      );
    }

    // Extrair dados do formulário
    const formData = await request.formData();
    
    // Extrair campos do prêmio
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const value = formData.get('value') as string;
    const categoryId = formData.get('categoryId') as string;
    
    // Validar campos obrigatórios
    if (!name || !value) {
      return NextResponse.json(
        createErrorResponse('Nome e valor do prêmio são obrigatórios', 400),
        { status: 400 }
      );
    }

    // Extrair as imagens do formulário
    const imageFiles = formData.getAll('images') as File[];
    
    if (!imageFiles.length) {
      return NextResponse.json(
        createErrorResponse('Pelo menos uma imagem é obrigatória', 400),
        { status: 400 }
      );
    }

    // Processar as imagens em paralelo
    const processedImages = await Promise.all(
      imageFiles.map(file => processImage(file))
    );

    // Filtrar imagens processadas com sucesso
    const validImages = processedImages.filter(Boolean) as { buffer: Buffer, originalName: string }[];
    
    if (!validImages.length) {
      return NextResponse.json(
        createErrorResponse('Nenhuma imagem válida para upload', 400),
        { status: 400 }
      );
    }

    // Fazer upload das imagens para o S3
    const uploadPromises = validImages.map(img => 
      uploadToS3(img.buffer, session.user.id, img.originalName)
    );
    
    const imageUrls = await Promise.all(uploadPromises);
    
    // A primeira imagem será a principal
    const mainImageUrl = imageUrls[0];

    // Criar o prêmio no banco de dados
    const newPrize = await Prize.create({
      data: {
        name,
        description,
        value,
        categoryId: categoryId ? categoryId : undefined,
        image: mainImageUrl,
        images: imageUrls,
        createdBy: session.user.id
      }
    });

    // Retornar o prêmio criado com as URLs das imagens
    return NextResponse.json({
      message: 'Prêmio criado com sucesso',
      prize: newPrize,
      imageCount: imageUrls.length
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar prêmio:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    
    return NextResponse.json(
      createErrorResponse(`Erro ao criar prêmio: ${errorMessage}`, 500),
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};