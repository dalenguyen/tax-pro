import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { rentalPropertyDoc } from '@cantax-fyi/db';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../../lib/require-auth';
import { serializeDoc } from '../../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = rentalPropertyDoc(userId, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Rental property not found' });
  }

  const body = await readBody(event);
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (body.address !== undefined) updateData['address'] = body.address;

  await ref.update(updateData);
  const updated = await ref.get();
  return serializeDoc(updated);
});
