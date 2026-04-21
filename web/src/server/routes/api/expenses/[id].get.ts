import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { expenseEntryDoc } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';
import { serializeDoc } from '../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const doc = await expenseEntryDoc(userId, taxYearId, id).get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Expense entry not found' });
  }

  return serializeDoc(doc);
});
