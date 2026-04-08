import { defineEventHandler, getQuery, createError } from 'h3';
import { investmentsCol } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const accountType = query['accountType'] as string;
  let ref = investmentsCol(TEST_USER_ID, taxYearId).orderBy('date', 'desc');
  if (accountType) {
    ref = investmentsCol(TEST_USER_ID, taxYearId)
      .where('accountType', '==', accountType)
      .orderBy('date', 'desc');
  }

  const snapshot = await ref.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
