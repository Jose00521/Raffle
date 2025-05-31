import { S3Client } from "@aws-sdk/client-s3";

// The bucket name is used in individual operations, not in the client initialization
const s3Client = new S3Client({
    region: process.env.AWS_REGION! || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID! || 'AKIAQ6E5OUARKKM5BQTZ',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY! || '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',
    },
  });

export default s3Client;  