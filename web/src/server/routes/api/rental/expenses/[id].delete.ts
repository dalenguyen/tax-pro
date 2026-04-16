import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { rentalExpenseDoc } from '@cantax-fyi/db';
import { requireUserId } from '../../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  const propertyId = query['propertyId'] as string;
  if (!id || !taxYearId || !propertyId) {
    throw createError({ statusCode: 400, statusMessage: 'id, taxYearId and propertyId are required' });
  }

  const ref = rentalExpenseDoc(userId, taxYearId, propertyId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Rental expense not found' });
  }

  await ref.delete();
  return { success: true };
});
