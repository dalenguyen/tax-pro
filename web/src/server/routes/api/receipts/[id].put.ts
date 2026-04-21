import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { receiptDoc } from '@cantax-fyi/db';
import { updateReceiptSchema } from '@cantax-fyi/utils';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';
import { serializeDoc } from '../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = receiptDoc(userId, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Receipt not found' });
  }

  const body = await readBody(event);
  const parsed = updateReceiptSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (parsed.data.linkedType !== undefined) updateData['linkedType'] = parsed.data.linkedType;
  if (parsed.data.linkedId !== undefined) updateData['linkedId'] = parsed.data.linkedId;
  if (body['status'] !== undefined) updateData['status'] = body['status'];

  await ref.update(updateData);
  const updated = await ref.get();
  return serializeDoc(updated);
});
