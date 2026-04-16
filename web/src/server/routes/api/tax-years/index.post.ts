import { defineEventHandler, readBody, createError } from 'h3';
import { taxYearsCol } from '@cantax-fyi/db';
import { createTaxYearSchema } from '@cantax-fyi/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const body = await readBody(event);
  const parsed = createTaxYearSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const { year, notes } = parsed.data;

  const existing = await taxYearsCol(userId)
    .where('year', '==', year)
    .limit(1)
    .get();

  if (!existing.empty) {
    throw createError({ statusCode: 409, statusMessage: `Tax year ${year} already exists` });
  }

  const docRef = await taxYearsCol(userId).add({
    year,
    notes: notes || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
