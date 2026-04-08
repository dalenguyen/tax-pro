import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { rentalPropertyDoc } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = rentalPropertyDoc(TEST_USER_ID, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Rental property not found' });
  }

  await ref.delete();
  return { success: true };
});
