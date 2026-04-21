import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { rentalExpenseDoc } from '@cantax-fyi/db';
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

  const ref = rentalExpenseDoc(userId, taxYearId, propertyId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Rental expense not found' });
  }

  const body = await readBody(event);
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (body.category !== undefined) updateData['category'] = body.category;
  if (body.description !== undefined) updateData['description'] = body.description;
  if (body.amount !== undefined) updateData['amount'] = body.amount;
  if (body.date !== undefined) updateData['date'] = new Date(body.date);
  if (body.metadata !== undefined) updateData['metadata'] = body.metadata;

  await ref.update(updateData);
  const updated = await ref.get();
  return serializeDoc(updated);
});
