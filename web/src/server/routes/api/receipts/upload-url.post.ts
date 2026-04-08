import { defineEventHandler, readBody, createError } from 'h3';
import { generateUploadUrl, buildStoragePath } from '../../../lib/storage';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName, contentType, taxYearId } = body;

  if (!fileName || !contentType || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'fileName, contentType, and taxYearId are required' });
  }

  const storagePath = buildStoragePath(TEST_USER_ID, taxYearId, fileName);
  const uploadUrl = await generateUploadUrl(storagePath, contentType);

  return { uploadUrl, storagePath };
});
