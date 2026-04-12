import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { rentalPropertyDoc, rentalIncomesCol, rentalExpensesCol } from '@can-tax-pro/db';
import { requireUserId } from '../../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!id || !taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'id and taxYearId are required' });
  }

  const doc = await rentalPropertyDoc(userId, taxYearId, id).get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Rental property not found' });
  }

  const incomesSnapshot = await rentalIncomesCol(userId, taxYearId, id).orderBy('date', 'desc').get();
  const expensesSnapshot = await rentalExpensesCol(userId, taxYearId, id).orderBy('date', 'desc').get();

  return {
    id: doc.id,
    ...doc.data(),
    incomes: incomesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
    expenses: expensesSnapshot.docs.map((d) => ({ id: d.id, ...d.data() })),
  };
});
