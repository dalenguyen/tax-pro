import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { expenseEntryDoc } from '@cantax-fyi/db';
import { computeAmountCad } from '@cantax-fyi/utils';
import { Currency } from '@cantax-fyi/types';
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

  const ref = expenseEntryDoc(userId, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Expense entry not found' });
  }

  const body = await readBody(event);
  const existing = doc.data()!;
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  const fields = ['category', 'vendor', 'description', 'amount', 'currency', 'exchangeRate', 'paymentMethod', 'metadata'];
  for (const field of fields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }
  if (body.date !== undefined) updateData['date'] = new Date(body.date);

  const amount = (updateData['amount'] as number) ?? existing['amount'];
  const currency = (updateData['currency'] as Currency) ?? existing['currency'];
  const exchangeRate = (updateData['exchangeRate'] as number) ?? existing['exchangeRate'];
  updateData['amountCad'] = computeAmountCad(amount, currency, exchangeRate);

  await ref.update(updateData);
  const updated = await ref.get();
  return serializeDoc(updated);
});
