import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from 'uuid';
import s3Client from "./s3Client";
import { PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Faz upload de uma imagem para o S3
 * 
 * IMPORTANTE: Para que as imagens sejam acessíveis publicamente, é necessário configurar
 * uma política de bucket no console da AWS que permita acesso público de leitura.
 * 
 * Exemplo de política de bucket:
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Sid": "PublicReadForGetBucketObjects",
 *       "Effect": "Allow",
 *       "Principal": "*",
 *       "Action": "s3:GetObject",
 *       "Resource": "arn:aws:s3:::raffle-bucket-100/rifas/prizes/*"
 *     }
 *   ]
 * }
 */
export async function uploadToS3(
    buffer: Buffer, 
    userId: string, 
    originalName: string
  ): Promise<string> {
    const fileName = `${uuidv4()}-${Date.now()}.webp`;
    const key = `rifas/prizes/${userId}/${fileName}`;

    // Definir o nome do bucket com um valor padrão caso a variável de ambiente não esteja definida
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'raffle-bucket-100';
    
    try {
      // Usar PutObjectCommand em vez de Upload para maior controle
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: 'image/webp',
          CacheControl: 'max-age=31536000', // Cache de 1 ano para imagens
          Metadata: {
            'original-name': encodeURIComponent(originalName)
          }
        })
      );
      
      // URL pública direta (funciona quando o bucket tem política pública configurada)
      const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`;
      
      console.log(`Imagem enviada com sucesso: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      console.error('Erro ao fazer upload para o S3:', error);
      throw error;
    }
  }