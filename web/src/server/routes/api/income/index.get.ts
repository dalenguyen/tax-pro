import { defineEventHandler, getQuery, createError } from 'h3';
import { incomeEntriesCol } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const sourceType = query['sourceType'] as string;
  let ref = incomeEntriesCol(TEST_USER_ID, taxYearId).orderBy('date', 'desc');
  if (sourceType) {
    ref = incomeEntriesCol(TEST_USER_ID, taxYearId)
      .where('sourceType', '==', sourceType)
      .orderBy('date', 'desc');
  }

  const snapshot = await ref.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
