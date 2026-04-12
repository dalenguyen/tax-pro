import { defineEventHandler, getQuery, createError } from 'h3';
import { rentalPropertiesCol } from '@can-tax-pro/db';
import { requireUserId } from '../../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const snapshot = await rentalPropertiesCol(userId, taxYearId).orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
