import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { expenseEntriesCol, db } from '@cantax-fyi/db';
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
  const entries = body.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'entries array is required' });
  }

  const validatedEntries = entries.map((entry: unknown, index: number) => {
    const parsed = createExpenseEntrySchema.safeParse(entry);
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: `Entry ${index}: ${parsed.error.message}` });
    }
    return parsed.data;
  });

  const batch = db.batch();
  const colRef = expenseEntriesCol(userId, taxYearId);

  for (const data of validatedEntries) {
    const currency = data.currency || Currency.CAD;
    const amountCad = computeAmountCad(data.amount, currency, data.exchangeRate);

    batch.set(colRef.doc(), {
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
  }

  await batch.commit();
  return { imported: validatedEntries.length };
});
