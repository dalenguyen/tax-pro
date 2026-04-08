import { Storage } from '@google-cloud/storage';

const storage = new Storage();
const bucketName = process.env['GCS_BUCKET'] || 'can-tax-pro-receipts-dev';

export function getBucket() {
  return storage.bucket(bucketName);
}

export async function generateUploadUrl(
  storagePath: string,
  contentType: string,
): Promise<string> {
  const [url] = await getBucket().file(storagePath).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    contentType,
  });
  return url;
}

export async function generateDownloadUrl(storagePath: string): Promise<string> {
  const [url] = await getBucket().file(storagePath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });
  return url;
}

export async function deleteFile(storagePath: string): Promise<void> {
  await getBucket().file(storagePath).delete({ ignoreNotFound: true });
}

export function buildStoragePath(userId: string, taxYearId: string, fileName: string): string {
  const uuid = crypto.randomUUID();
  return `receipts/${userId}/${taxYearId}/${uuid}-${fileName}`;
}
