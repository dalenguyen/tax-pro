import { defineEventHandler, getQuery, createError } from 'h3';
import { receiptsCol } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const status = query['status'] as string;
  let ref = receiptsCol(TEST_USER_ID, taxYearId).orderBy('createdAt', 'desc');
  if (status) {
    ref = receiptsCol(TEST_USER_ID, taxYearId)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc');
  }

  const snapshot = await ref.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
