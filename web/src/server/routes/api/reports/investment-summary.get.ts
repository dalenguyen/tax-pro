import { defineEventHandler, getQuery, createError } from 'h3';
import { investmentsCol } from '@cantax-fyi/db';
import { InvestmentAccountType } from '@cantax-fyi/types';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const snap = await investmentsCol(userId, taxYearId).orderBy('date', 'desc').get();
  const entries = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const rrspEntries: unknown[] = [];
  const tfsaEntries: unknown[] = [];

  for (const entry of entries) {
    const at = (entry as Record<string, unknown>)['accountType'] as string;
    if (at === InvestmentAccountType.RRSP) rrspEntries.push(entry);
    else if (at === InvestmentAccountType.TFSA) tfsaEntries.push(entry);
  }

  const sumAmt = (arr: unknown[]) =>
    arr.reduce((s, e) => s + (((e as Record<string, unknown>)['amountCad'] as number) ?? ((e as Record<string, unknown>)['amount'] as number) ?? 0), 0);

  return {
    rrsp: { contributions: rrspEntries, total: sumAmt(rrspEntries) },
    tfsa: { contributions: tfsaEntries, total: sumAmt(tfsaEntries) },
  };
});
