import { defineEventHandler, readBody, getQuery, getRouterParam, createError } from 'h3';
import { investmentDoc } from '@can-tax-pro/db';
import { computeAmountCad } from '@can-tax-pro/utils';
import { Currency } from '@can-tax-pro/types';
import { FieldValue } from 'firebase-admin/firestore';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const ref = investmentDoc(TEST_USER_ID, taxYearId, id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Investment not found' });
  }

  const body = await readBody(event);
  const existing = doc.data()!;
  const updateData: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  const fields = ['accountType', 'institution', 'roomRemaining', 'notes'];
  for (const field of fields) {
    if (body[field] !== undefined) updateData[field] = body[field];
  }
  if (body.date !== undefined) updateData['date'] = new Date(body.date);
  if (body.amount !== undefined) updateData['amount'] = body.amount;
  if (body.currency !== undefined) updateData['currency'] = body.currency;
  if (body.exchangeRate !== undefined) updateData['exchangeRate'] = body.exchangeRate;

  const amount = (updateData['amount'] as number) ?? existing['amount'];
  const currency = (updateData['currency'] as Currency) ?? existing['currency'];
  const exchangeRate = (updateData['exchangeRate'] as number) ?? existing['exchangeRate'];
  updateData['amountCad'] = computeAmountCad(amount, currency, exchangeRate);

  await ref.update(updateData);
  const updated = await ref.get();
  return { id: updated.id, ...updated.data() };
});
