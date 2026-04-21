import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { rentalExpensesCol } from '@cantax-fyi/db';
import { createRentalExpenseSchema } from '@cantax-fyi/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../../lib/require-auth';
import { serializeDoc } from '../../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  const propertyId = query['propertyId'] as string;
  if (!taxYearId || !propertyId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId and propertyId are required' });
  }

  const body = await readBody(event);
  const parsed = createRentalExpenseSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const data = parsed.data;
  const docRef = await rentalExpensesCol(userId, taxYearId, propertyId).add({
    category: data.category,
    description: data.description || null,
    amount: data.amount,
    date: new Date(data.date),
    metadata: data.metadata || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return serializeDoc(doc);
});
