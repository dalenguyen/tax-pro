import { defineEventHandler, readBody, getRouterParam, createError } from 'h3';
import { taxYearDoc } from '@can-tax-pro/db';
import { FieldValue } from 'firebase-admin/firestore';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const body = await readBody(event);
  const ref = taxYearDoc(TEST_USER_ID, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }

  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (body.notes !== undefined) updateData['notes'] = body.notes;

  await ref.update(updateData);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
});
