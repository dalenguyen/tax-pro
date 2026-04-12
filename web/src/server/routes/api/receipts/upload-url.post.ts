import { defineEventHandler, readBody, createError } from 'h3';
import { generateUploadUrl, buildStoragePath } from '../../../lib/storage';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const body = await readBody(event);
  const { fileName, contentType, taxYearId } = body;

  if (!fileName || !contentType || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'fileName, contentType, and taxYearId are required' });
  }

  const storagePath = buildStoragePath(userId, taxYearId, fileName);
  const uploadUrl = await generateUploadUrl(storagePath, contentType);

  return { uploadUrl, storagePath };
});
