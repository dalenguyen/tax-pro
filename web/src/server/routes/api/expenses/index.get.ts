import { defineEventHandler, getQuery, createError } from 'h3';
import { expenseEntriesCol } from '@cantax-fyi/db';
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
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      date: data.date?.toDate?.()?.toISOString() ?? data.date,
      createdAt: data.createdAt?.toDate?.()?.toISOString() ?? data.createdAt,
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? data.updatedAt,
    };
  });
});
