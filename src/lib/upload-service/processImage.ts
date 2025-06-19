import sharp from "sharp";
import config from '@/lib/upload-service/config/config'
import { ApiError } from "@/server/utils/errorHandler/ApiError";


/**
 * Processa uma imagem para formato WebP otimizado
 * Funciona tanto com File do navegador quanto com FormData do servidor
 */
export async function processImage(file: any): Promise<{ buffer: Buffer, originalName: string } | null> {
    try {
      // Verificar se é um arquivo válido
      if (!file) {
        console.warn('Arquivo não fornecido');
        return null;
      }

      // Extrair propriedades do arquivo (compatível com File e FormData)
      const fileType = file.type || '';
      const fileSize = file.size || 0;
      const fileName = file.name || 'image';
      
      // Validações de segurança
      if (!config.ALLOWED_MIME_TYPES.includes(fileType)) {
        console.warn(`Tipo de arquivo não permitido: ${fileType}`);
        return null;
      }
      
      if (fileSize > config.MAX_FILE_SIZE) {
        console.warn(`Arquivo muito grande: ${Math.round(fileSize / 1024 / 1024)}MB`);
        return null;
      }
  
      // Converter para buffer (compatível com diferentes tipos)
      let buffer: Buffer;
      
      if (file.arrayBuffer && typeof file.arrayBuffer === 'function') {
        // File do navegador
        buffer = Buffer.from(await file.arrayBuffer());
      } else if (file.stream && typeof file.stream === 'function') {
        // FormData File do servidor
        const chunks: Uint8Array[] = [];
        const reader = file.stream().getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        
        buffer = Buffer.concat(chunks);
      } else {
        console.warn('Formato de arquivo não suportado');
        return null;
      }
      
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
        originalName: fileName
      };
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      throw new ApiError({
        success: false,
        message: 'Erro ao processar imagem',
        statusCode: 500,
        cause: error as Error
      });
    }
  }

