import { defineEventHandler, getQuery, createError } from 'h3';
import { incomeEntriesCol, expenseEntriesCol } from '@cantax-fyi/db';
import { aggregateMonthlyTotals } from '@cantax-fyi/utils';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const [incomeSnap, expenseSnap] = await Promise.all([
    incomeEntriesCol(TEST_USER_ID, taxYearId).get(),
    expenseEntriesCol(TEST_USER_ID, taxYearId).get(),
  ]);

  const incomeEntries = incomeSnap.docs.map((d) => d.data() as { date?: string; amount?: number; amountCad?: number });
  const expenseEntries = expenseSnap.docs.map((d) => d.data() as { date?: string; amount?: number; amountCad?: number });

  return { months: aggregateMonthlyTotals(incomeEntries, expenseEntries) };
});
