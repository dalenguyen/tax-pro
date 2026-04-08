import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { rentalPropertyDoc } from '@can-tax-pro/db';
import { FieldValue } from 'firebase-admin/firestore';

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

  const body = await readBody(event);
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (body.address !== undefined) updateData['address'] = body.address;

  await ref.update(updateData);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
});
