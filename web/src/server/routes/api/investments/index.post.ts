import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { investmentsCol } from '@can-tax-pro/db';
import { createInvestmentSchema, computeAmountCad } from '@can-tax-pro/utils';
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
  const parsed = createInvestmentSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const data = parsed.data;
  const currency = data.currency || Currency.CAD;
  const amountCad = computeAmountCad(data.amount, currency, data.exchangeRate);

  const docRef = await investmentsCol(TEST_USER_ID, taxYearId).add({
    accountType: data.accountType,
    amount: data.amount,
    currency,
    exchangeRate: data.exchangeRate || null,
    amountCad,
    institution: data.institution || null,
    date: new Date(data.date),
    roomRemaining: data.roomRemaining ?? null,
    notes: data.notes || null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() };
});
