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
    
    const multipartUpload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: 'image/webp',
        ACL: 'public-read',
        Metadata: {
          'original-name': encodeURIComponent(originalName)
        }
      }
    });
  
    await multipartUpload.done();
    
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  }