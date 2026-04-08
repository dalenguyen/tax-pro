import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { receiptDoc } from '@can-tax-pro/db';
import { generateDownloadUrl } from '../../../lib/storage';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const doc = await receiptDoc(TEST_USER_ID, taxYearId, id).get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Receipt not found' });
  }

  const data = doc.data()!;
  const downloadUrl = await generateDownloadUrl(data['storagePath'] as string);

  return { id: doc.id, ...data, downloadUrl };
});
