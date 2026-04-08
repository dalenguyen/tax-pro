import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { rentalPropertiesCol } from '@can-tax-pro/db';
import { createRentalPropertySchema } from '@can-tax-pro/utils';
import { FieldValue } from 'firebase-admin/firestore';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const body = await readBody(event);
  const parsed = createRentalPropertySchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const docRef = await rentalPropertiesCol(TEST_USER_ID, taxYearId).add({
    address: parsed.data.address,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
