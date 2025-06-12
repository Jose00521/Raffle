import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./s3Client";

/**
 * Extrai a chave (key) de uma URL de imagem do S3
 * 
 * @param imageUrl URL completa da imagem no S3
 * @returns A chave do objeto no S3
 */
function extractKeyFromS3Url(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const hostname = url.hostname;
    
    // Verifica se é uma URL do S3
    if (!hostname.includes('s3.') && !hostname.endsWith('.amazonaws.com')) {
      console.warn('URL não parece ser do S3:', imageUrl);
      return null;
    }
    
    // Remove a primeira barra do pathname para obter a chave
    const key = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
    return key;
  } catch (error) {
    console.error('Erro ao extrair chave da URL:', error);
    return null;
  }
}

/**
 * Extrai o nome do bucket a partir de uma URL do S3
 * 
 * @param imageUrl URL completa da imagem no S3
 * @returns O nome do bucket
 */
function extractBucketFromS3Url(imageUrl: string): string | null {
  try {
    const url = new URL(imageUrl);
    const hostname = url.hostname;
    
    // Padrão: bucket-name.s3.region.amazonaws.com
    const bucketName = hostname.split('.')[0];
    return bucketName;
  } catch (error) {
    console.error('Erro ao extrair bucket da URL:', error);
    return null;
  }
}

/**
 * Exclui um objeto do S3 a partir de sua URL
 * 
 * @param imageUrl URL completa da imagem no S3
 * @returns Promise<boolean> Indica se a exclusão foi bem-sucedida
 */
export async function deleteFromS3ByUrl(imageUrl: string): Promise<boolean> {
  try {
    const key = extractKeyFromS3Url(imageUrl);
    const bucketName = extractBucketFromS3Url(imageUrl) || process.env.AWS_S3_BUCKET_NAME as string;
    
    if (!key) {
      console.error('Não foi possível extrair a chave da URL:', imageUrl);
      return false;
    }
    
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key
      })
    );
    
    console.log(`Imagem excluída com sucesso: ${imageUrl}`);
    return true;
  } catch (error) {
    console.error('Erro ao excluir objeto do S3:', error);
    return false;
  }
}

/**
 * Exclui múltiplos objetos do S3 a partir de suas URLs
 * 
 * @param imageUrls Array de URLs completas das imagens no S3
 * @returns Promise<{success: boolean, deletedCount: number, errors: number}>
 */
export async function deleteMultipleFromS3(imageUrls: string[]): Promise<{success: boolean, deletedCount: number, errors: number}> {
  let deletedCount = 0;
  let errors = 0;
  
  if (!imageUrls || imageUrls.length === 0) {
    return { success: true, deletedCount: 0, errors: 0 };
  }
  
  for (const url of imageUrls) {
    try {
      const success = await deleteFromS3ByUrl(url);
      if (success) {
        deletedCount++;
      } else {
        errors++;
      }
    } catch (error) {
      console.error('Erro ao excluir imagem:', url, error);
      errors++;
    }
  }
  
  return {
    success: errors === 0,
    deletedCount,
    errors
  };
} 