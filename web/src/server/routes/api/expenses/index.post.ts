import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { expenseEntriesCol } from '@cantax-fyi/db';
import { createExpenseEntrySchema, computeAmountCad } from '@cantax-fyi/utils';
import { Currency } from '@cantax-fyi/types';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const body = await readBody(event);
  const parsed = createExpenseEntrySchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const data = parsed.data;
  const currency = data.currency || Currency.CAD;
  const amountCad = computeAmountCad(data.amount, currency, data.exchangeRate);

  const docRef = await expenseEntriesCol(userId, taxYearId).add({
    category: data.category,
    vendor: data.vendor || null,
    description: data.description || null,
    amount: data.amount,
    currency,
    exchangeRate: data.exchangeRate || null,
    amountCad,
    date: new Date(data.date),
    paymentMethod: data.paymentMethod || null,
    metadata: data.metadata || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
