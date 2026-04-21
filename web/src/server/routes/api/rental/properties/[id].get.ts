import { defineEventHandler, getQuery, getRouterParam, createError } from 'h3';
import { rentalPropertyDoc, rentalIncomesCol, rentalExpensesCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../../lib/require-auth';
import { serializeDoc, serializeDocs } from '../../../../lib/firestore-serialize';


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
    ...serializeDoc(doc),
    incomes: serializeDocs(incomesSnapshot.docs),
    expenses: serializeDocs(expensesSnapshot.docs),
  };
});
