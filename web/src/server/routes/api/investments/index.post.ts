import { defineEventHandler, readBody, getQuery, createError } from 'h3';
import { investmentsCol } from '@cantax-fyi/db';
import { createInvestmentSchema, computeAmountCad } from '@cantax-fyi/utils';
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
  const parsed = createInvestmentSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.message });
  }

  const data = parsed.data;
  const currency = data.currency || Currency.CAD;
  const amountCad = computeAmountCad(data.amount, currency, data.exchangeRate);

  const docRef = await investmentsCol(userId, taxYearId).add({
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
