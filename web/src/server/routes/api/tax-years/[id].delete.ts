import { defineEventHandler, getRouterParam, createError } from 'h3';
import { taxYearDoc } from '@can-tax-pro/db';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const ref = taxYearDoc(userId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }

  // Note: Firestore doesn't cascade delete subcollections automatically.
  // For now just delete the document. A proper cleanup can be added later.
  await ref.delete();
  return { success: true };
});
