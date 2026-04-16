import { defineEventHandler, getRouterParam, createError } from 'h3';
import { apiKeyDoc } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id')!;

  const doc = await apiKeyDoc(id).get();
  if (!doc.exists || doc.data()!['userId'] !== userId) {
    throw createError({ statusCode: 404, statusMessage: 'API key not found' });
  }

  await apiKeyDoc(id).delete();
  return { success: true };
});
