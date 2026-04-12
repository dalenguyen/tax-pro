import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { incomeEntryDoc } from '@can-tax-pro/db';
import { computeAmountCad } from '@can-tax-pro/utils';
import { Currency } from '@can-tax-pro/types';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = incomeEntryDoc(userId, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Income entry not found' });
  }

  const body = await readBody(event);
  const existing = doc.data()!;
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  const fields = ['sourceType', 'description', 'amount', 'currency', 'exchangeRate', 'category', 'metadata'];
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
  return { id: updated.id, ...updated.data() };
});
