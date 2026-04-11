import { defineEventHandler, getQuery, createError } from 'h3';
import {
  incomeEntriesCol,
  expenseEntriesCol,
  rentalPropertiesCol,
  rentalIncomesCol,
  rentalExpensesCol,
  investmentsCol,
  taxYearsCol,
} from '@can-tax-pro/db';
import { IncomeSourceType, InvestmentAccountType } from '@can-tax-pro/types';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const taxYearDoc = await taxYearsCol(TEST_USER_ID).doc(taxYearId).get();
  if (!taxYearDoc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }
  const taxYearData = taxYearDoc.data();

  const [incomeSnap, expenseSnap, propsSnap, investSnap] = await Promise.all([
    incomeEntriesCol(TEST_USER_ID, taxYearId).get(),
    expenseEntriesCol(TEST_USER_ID, taxYearId).get(),
    rentalPropertiesCol(TEST_USER_ID, taxYearId).get(),
    investmentsCol(TEST_USER_ID, taxYearId).get(),
  ]);

  // Business income
  let totalBusinessIncome = 0;
  for (const doc of incomeSnap.docs) {
    const d = doc.data();
    if (d['sourceType'] === IncomeSourceType.INTERNET_BUSINESS || d['sourceType'] === IncomeSourceType.STRIPE) {
      totalBusinessIncome += d['amountCad'] ?? d['amount'] ?? 0;
    }
  }

  // Business expenses
  let totalBusinessExpenses = 0;
  for (const doc of expenseSnap.docs) {
    const d = doc.data();
    totalBusinessExpenses += d['amountCad'] ?? d['amount'] ?? 0;
  }

  // Rental
  let totalRentalIncome = 0;
  let totalRentalExpenses = 0;
  for (const prop of propsSnap.docs) {
    const [rIncSnap, rExpSnap] = await Promise.all([
      rentalIncomesCol(TEST_USER_ID, taxYearId, prop.id).get(),
      rentalExpensesCol(TEST_USER_ID, taxYearId, prop.id).get(),
    ]);
    for (const d of rIncSnap.docs) totalRentalIncome += d.data()['amount'] ?? 0;
    for (const d of rExpSnap.docs) totalRentalExpenses += d.data()['amount'] ?? 0;
  }

  // Investments
  let rrspContributions = 0;
  let tfsaContributions = 0;
  for (const doc of investSnap.docs) {
    const d = doc.data();
    const amt = d['amountCad'] ?? d['amount'] ?? 0;
    if (d['accountType'] === InvestmentAccountType.RRSP) rrspContributions += amt;
    else if (d['accountType'] === InvestmentAccountType.TFSA) tfsaContributions += amt;
  }

  return {
    taxYear: taxYearData?.['year'] ?? 0,
    totalBusinessIncome,
    totalBusinessExpenses,
    netBusinessIncome: totalBusinessIncome - totalBusinessExpenses,
    totalRentalIncome,
    totalRentalExpenses,
    netRentalIncome: totalRentalIncome - totalRentalExpenses,
    rrspContributions,
    tfsaContributions,
    totalIncome: totalBusinessIncome + totalRentalIncome,
    totalDeductions: totalBusinessExpenses + rrspContributions,
  };
});
