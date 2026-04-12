import { defineEventHandler, getQuery, createError } from 'h3';
import { incomeEntriesCol, expenseEntriesCol } from '@can-tax-pro/db';
import { IncomeSourceType, ExpenseCategoryType } from '@can-tax-pro/types';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const [incomeSnap, expenseSnap] = await Promise.all([
    incomeEntriesCol(userId, taxYearId).get(),
    expenseEntriesCol(userId, taxYearId).get(),
  ]);

  // Gross income: INTERNET_BUSINESS + STRIPE
  let grossIncome = 0;
  for (const doc of incomeSnap.docs) {
    const d = doc.data();
    if (d['sourceType'] === IncomeSourceType.INTERNET_BUSINESS || d['sourceType'] === IncomeSourceType.STRIPE) {
      grossIncome += d['amountCad'] ?? d['amount'] ?? 0;
    }
  }

  // Expense line mapping
  const expTotals: Record<string, number> = {};
  for (const cat of Object.values(ExpenseCategoryType)) expTotals[cat] = 0;

  for (const doc of expenseSnap.docs) {
    const d = doc.data();
    const cat = d['category'] as string;
    expTotals[cat] = (expTotals[cat] ?? 0) + (d['amountCad'] ?? d['amount'] ?? 0);
  }

  const advertising = expTotals[ExpenseCategoryType.ADS] ?? 0;
  const internet = (expTotals[ExpenseCategoryType.INTERNET] ?? 0) + (expTotals[ExpenseCategoryType.PHONE] ?? 0);
  const officeExpenses =
    (expTotals[ExpenseCategoryType.EMAIL] ?? 0) +
    (expTotals[ExpenseCategoryType.GCP] ?? 0) +
    (expTotals[ExpenseCategoryType.NAMECHEAP] ?? 0) +
    (expTotals[ExpenseCategoryType.HOSTING] ?? 0);
  const otherExpenses = expTotals[ExpenseCategoryType.OTHER] ?? 0;

  const totalExpenses = advertising + internet + officeExpenses + otherExpenses;

  return {
    grossIncome,
    expenses: {
      advertising,   // Line 8520
      internet,      // Line 8590
      officeExpenses, // Line 8810
      otherExpenses, // Line 9270
    },
    totalExpenses,   // Line 9368
    netIncome: grossIncome - totalExpenses, // Line 9369
  };
});
