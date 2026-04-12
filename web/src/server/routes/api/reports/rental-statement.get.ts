import { defineEventHandler, getQuery, createError } from 'h3';
import { rentalPropertiesCol, rentalIncomesCol, rentalExpensesCol } from '@can-tax-pro/db';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const propsSnap = await rentalPropertiesCol(userId, taxYearId).get();

  let grandTotalIncome = 0;
  let grandTotalExpenses = 0;

  const properties = await Promise.all(
    propsSnap.docs.map(async (propDoc) => {
      const prop = { id: propDoc.id, ...propDoc.data() };
      const [incSnap, expSnap] = await Promise.all([
        rentalIncomesCol(userId, taxYearId, propDoc.id).orderBy('date', 'desc').get(),
        rentalExpensesCol(userId, taxYearId, propDoc.id).orderBy('date', 'desc').get(),
      ]);

      const incomes = incSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const expenses = expSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const totalIncome = incomes.reduce((s, i) => s + ((i as Record<string, unknown>)['amount'] as number ?? 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + ((e as Record<string, unknown>)['amount'] as number ?? 0), 0);

      grandTotalIncome += totalIncome;
      grandTotalExpenses += totalExpenses;

      return {
        id: prop['id'],
        address: (prop as Record<string, unknown>)['address'],
        incomes,
        totalIncome,
        expenses,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
      };
    })
  );

  return {
    properties,
    grandTotalIncome,
    grandTotalExpenses,
    grandNetIncome: grandTotalIncome - grandTotalExpenses,
  };
});
