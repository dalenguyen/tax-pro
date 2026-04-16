import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { rentalIncomesCol } from '@cantax-fyi/db';
import { createRentalIncomeSchema } from '@cantax-fyi/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  const propertyId = query['propertyId'] as string;
  if (!taxYearId || !propertyId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId and propertyId are required' });
  }

  const body = await readBody(event);
  const parsed = createRentalIncomeSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const data = parsed.data;
  const docRef = await rentalIncomesCol(userId, taxYearId, propertyId).add({
    description: data.description || null,
    amount: data.amount,
    date: new Date(data.date),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
