import { defineEventHandler, getRouterParam, createError } from 'h3';
import { taxYearDoc } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const ref = taxYearDoc(TEST_USER_ID, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }

  // Note: Firestore doesn't cascade delete subcollections automatically.
  // For now just delete the document. A proper cleanup can be added later.
  await ref.delete();
  return { success: true };
});
