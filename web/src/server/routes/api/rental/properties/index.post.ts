import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { rentalPropertiesCol } from '@cantax-fyi/db';
import { createRentalPropertySchema } from '@cantax-fyi/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../../lib/require-auth';
import { serializeDoc } from '../../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
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

  const docRef = await rentalPropertiesCol(userId, taxYearId).add({
    address: parsed.data.address,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return serializeDoc(doc);
});
