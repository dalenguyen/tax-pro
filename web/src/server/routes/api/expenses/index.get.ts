import { defineEventHandler, getQuery, createError } from 'h3';
import { expenseEntriesCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';
import { serializeDocs } from '../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const category = query['category'] as string;
  let ref = expenseEntriesCol(userId, taxYearId).orderBy('date', 'desc');
  if (category) {
    ref = expenseEntriesCol(userId, taxYearId)
      .where('category', '==', category)
      .orderBy('date', 'desc');
  }

  const snapshot = await ref.get();
  return serializeDocs(snapshot.docs);
});
