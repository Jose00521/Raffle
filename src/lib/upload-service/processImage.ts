import sharp from "sharp";
import config from '@/lib/upload-service/config/config'
import { ApiError } from "@/server/utils/errorHandler/ApiError";


/**
 * Processa uma imagem para formato WebP otimizado
 */
export async function processImage(file: File): Promise<{ buffer: Buffer, originalName: string } | null> {
    try {
      // Validações de segurança
      if (!config.ALLOWED_MIME_TYPES.includes(file.type)) {
        console.warn(`Tipo de arquivo não permitido: ${file.type}`);
        return null;
      }
      
      if (file.size > config.MAX_FILE_SIZE) {
        console.warn(`Arquivo muito grande: ${Math.round(file.size / 1024 / 1024)}MB`);
        return null;
      }
  
      // Converter para buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      
      // Processar e otimizar a imagem com Sharp
      const optimizedBuffer = await sharp(buffer)
        .resize({
          width: config.MAX_WIDTH,
          height: config.MAX_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: config.IMAGE_QUALITY })
        .toBuffer();
      
      return { 
        buffer: optimizedBuffer,
        originalName: file.name
      };
    } catch (error) {
      throw new ApiError({
        success: false,
        message: 'Erro ao processar imagem',
        statusCode: 500,
        cause: error as Error
      });
    }
  }

