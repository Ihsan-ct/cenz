import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFile(key: string, body: Buffer | Uint8Array, contentType: string) {
  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

export async function getPresignedUrl(key: string, expiresIn = 3600) {
  return getSignedUrl(r2, new GetObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }), { expiresIn });
}

export async function deleteFile(key: string) {
  await r2.send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET!, Key: key }));
}
