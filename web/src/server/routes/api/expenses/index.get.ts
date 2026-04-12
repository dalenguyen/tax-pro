import { defineEventHandler, getQuery, createError } from 'h3';
import { expenseEntriesCol } from '@can-tax-pro/db';
import { requireUserId } from '../../../lib/require-auth';


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
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
