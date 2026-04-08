import { defineEventHandler, getQuery, createError } from 'h3';
import { expenseEntriesCol } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const category = query['category'] as string;
  let ref = expenseEntriesCol(TEST_USER_ID, taxYearId).orderBy('date', 'desc');
  if (category) {
    ref = expenseEntriesCol(TEST_USER_ID, taxYearId)
      .where('category', '==', category)
      .orderBy('date', 'desc');
  }

  const snapshot = await ref.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
