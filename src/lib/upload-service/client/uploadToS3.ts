import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from 'uuid';
import s3Client from "./s3Client";


/**
 * Faz upload de uma imagem para o S3
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
    
    const multipartUpload = new Upload({
      client: s3Client,
      params: {
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
        Metadata: {
          'original-name': encodeURIComponent(originalName)
        }
      }
    });
  
    await multipartUpload.done();
    
    return `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`;
  }