import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
  }
});

/**
 * Gera um nome de arquivo seguro para evitar conflitos e vulnerabilidades
 */
const generateSecureFilename = (originalName: string, entityCode: string) => {
  const ext = originalName.split('.').pop();
  const hash = crypto.createHash('sha256')
    .update(`${entityCode}-${Date.now()}-${Math.random()}`)
    .digest('hex').substring(0, 12);
    
  return `${hash}.${ext}`;
};

/**
 * Realiza upload de documento de verificação para S3 com criptografia do lado do servidor
 */
export const uploadVerificationDocument = async (
  entityCode: string, // userCode ou campaignCode
  file: Buffer,
  originalFilename: string,
  documentType: string,
  entityType: 'user' | 'campaign' = 'user'
) => {
  const secureFilename = generateSecureFilename(originalFilename, entityCode);
  const key = `verification/${entityType}/${entityCode}/${documentType}/${secureFilename}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: file.type,
    ServerSideEncryption: 'AES256',
    Metadata: {
      'x-amz-meta-original-filename': originalFilename,
      'x-amz-meta-document-type': documentType,
      'x-amz-meta-entity-code': entityCode,
      'x-amz-meta-entity-type': entityType,
      'x-amz-meta-upload-date': new Date().toISOString()
    }
  });
  
  await s3Client.send(command);
  return key;
};

/**
 * Gera URL temporária para visualização segura dos documentos (apenas para administradores)
 */
export const getTemporaryDocumentUrl = async (documentPath: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: documentPath
  });
  
  // URL expira em 15 minutos
  return getSignedUrl(s3Client, command, { expiresIn: 900 });
};

/**
 * Exclui um documento definitivamente após verificação ou rejeição
 */
export const deleteVerificationDocument = async (documentPath: string) => {
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: documentPath
  });
  
  await s3Client.send(command);
  return true;
};

/**
 * Registra evento de acesso no sistema de auditoria
 */
export const logDocumentAccess = async (
  documentPath: string,
  accessedBy: string,
  reason: string
) => {
  // Implementação de logging para auditoria
  console.log(`[DOCUMENT ACCESS] ${documentPath} accessed by ${accessedBy} for ${reason}`);
  
  // Aqui seria integrado com um sistema real de logs de auditoria
  // como CloudWatch Logs ou um serviço dedicado de compliance
}; 