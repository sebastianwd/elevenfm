import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string
  }
})

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'elevenfm-uploads'

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600 // 1 hour
) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType
  })

  const url = await getSignedUrl(S3, command, { expiresIn })
  return url
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600 // 1 hour
) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key
  })

  const url = await getSignedUrl(S3, command, { expiresIn })
  return url
}

export function generateFileKey(userId: string, fileName: string): string {
  const timestamp = Date.now()
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  const key = `uploads/${userId}/${timestamp}-${sanitizedFileName}`

  return key
}
