import { defineEventHandler, getQuery, createError } from 'h3';
import {
  incomeEntriesCol,
  expenseEntriesCol,
  rentalPropertiesCol,
  rentalIncomesCol,
  rentalExpensesCol,
  investmentsCol,
  taxYearsCol,
} from '@cantax-fyi/db';
import { IncomeSourceType, InvestmentAccountType } from '@cantax-fyi/types';
import { estimateFederalTax } from '@cantax-fyi/utils';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const taxYearDoc = await taxYearsCol(userId).doc(taxYearId).get();
  if (!taxYearDoc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }
  const taxYearData = taxYearDoc.data();

  const [incomeSnap, expenseSnap, propsSnap, investSnap] = await Promise.all([
    incomeEntriesCol(userId, taxYearId).get(),
    expenseEntriesCol(userId, taxYearId).get(),
    rentalPropertiesCol(userId, taxYearId).get(),
    investmentsCol(userId, taxYearId).get(),
  ]);

  let employmentIncome = 0;
  let totalBusinessIncome = 0;
  let investmentIncome = 0;
  let cryptoIncome = 0;
  for (const doc of incomeSnap.docs) {
    const d = doc.data();
    const amt = d['amountCad'] ?? d['amount'] ?? 0;
    if (d['sourceType'] === IncomeSourceType.EMPLOYMENT) {
      employmentIncome += amt;
    } else if (d['sourceType'] === IncomeSourceType.INTERNET_BUSINESS || d['sourceType'] === IncomeSourceType.STRIPE) {
      totalBusinessIncome += amt;
    } else if (d['sourceType'] === IncomeSourceType.INVESTMENT) {
      investmentIncome += amt;
    } else if (d['sourceType'] === IncomeSourceType.CRYPTO) {
      cryptoIncome += amt;
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
      rentalIncomesCol(userId, taxYearId, prop.id).get(),
      rentalExpensesCol(userId, taxYearId, prop.id).get(),
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

  const totalIncome = employmentIncome + totalBusinessIncome + totalRentalIncome + investmentIncome + cryptoIncome;
  const totalDeductions = totalBusinessExpenses + rrspContributions;
  const taxableIncome = totalIncome - totalDeductions;

  return {
    taxYear: taxYearData?.['year'] ?? 0,
    employmentIncome,
    totalBusinessIncome,
    totalBusinessExpenses,
    netBusinessIncome: totalBusinessIncome - totalBusinessExpenses,
    totalRentalIncome,
    totalRentalExpenses,
    netRentalIncome: totalRentalIncome - totalRentalExpenses,
    investmentIncome,
    cryptoIncome,
    rrspContributions,
    tfsaContributions,
    totalIncome,
    totalDeductions,
    estimatedTax: estimateFederalTax(taxableIncome),
  };
});
