import { defineEventHandler, getQuery, createError } from 'h3';
import { rentalPropertiesCol } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const snapshot = await rentalPropertiesCol(TEST_USER_ID, taxYearId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
