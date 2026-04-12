import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { incomeEntryDoc } from '@can-tax-pro/db';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = incomeEntryDoc(userId, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Income entry not found' });
  }

  await ref.delete();
  return { success: true };
});
