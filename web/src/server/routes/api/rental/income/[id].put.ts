import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { rentalIncomeDoc } from '@cantax-fyi/db';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../../lib/require-auth';
import { serializeDoc } from '../../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  const propertyId = query['propertyId'] as string;
  if (!id || !taxYearId || !propertyId) {
    throw createError({ statusCode: 400, statusMessage: 'id, taxYearId and propertyId are required' });
  }

  const ref = rentalIncomeDoc(userId, taxYearId, propertyId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Rental income not found' });
  }

  const body = await readBody(event);
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (body.description !== undefined) updateData['description'] = body.description;
  if (body.amount !== undefined) updateData['amount'] = body.amount;
  if (body.date !== undefined) updateData['date'] = new Date(body.date);

  await ref.update(updateData);
  const updated = await ref.get();
  return serializeDoc(updated);
});
