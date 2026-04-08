import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { rentalExpensesCol } from '@can-tax-pro/db';
import { createRentalExpenseSchema } from '@can-tax-pro/utils';
import { FieldValue } from 'firebase-admin/firestore';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
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
  const docRef = await rentalExpensesCol(TEST_USER_ID, taxYearId, propertyId).add({
    category: data.category,
    description: data.description || null,
    amount: data.amount,
    date: new Date(data.date),
    metadata: data.metadata || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
