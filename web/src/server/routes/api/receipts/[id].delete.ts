import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { receiptDoc } from '@can-tax-pro/db';
import { deleteFile } from '../../../lib/storage';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = receiptDoc(userId, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Receipt not found' });
  }

  const data = doc.data()!;
  await deleteFile(data['storagePath'] as string);
  await ref.delete();

  return { success: true };
});
