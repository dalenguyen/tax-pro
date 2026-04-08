import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { incomeEntriesCol, db } from '@can-tax-pro/db';
import { createIncomeEntrySchema, computeAmountCad } from '@can-tax-pro/utils';
import { Currency } from '@can-tax-pro/types';
import { FieldValue } from 'firebase-admin/firestore';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
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
    const parsed = createIncomeEntrySchema.safeParse(entry);
    if (!parsed.success) {
      throw createError({ statusCode: 400, statusMessage: `Entry ${index}: ${parsed.error.message}` });
    }
    return parsed.data;
  });

  const batch = db.batch();
  const colRef = incomeEntriesCol(TEST_USER_ID, taxYearId);

  for (const data of validatedEntries) {
    const currency = data.currency || Currency.CAD;
    const amountCad = computeAmountCad(data.amount, currency, data.exchangeRate);

    batch.set(colRef.doc(), {
      sourceType: data.sourceType,
      description: data.description || null,
      amount: data.amount,
      currency,
      exchangeRate: data.exchangeRate || null,
      amountCad,
      date: new Date(data.date),
      category: data.category || null,
      metadata: data.metadata || null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  return { imported: validatedEntries.length };
});
