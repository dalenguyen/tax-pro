import { defineEventHandler, getQuery, createError } from 'h3';
import { investmentsCol } from '@can-tax-pro/db';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const accountType = query['accountType'] as string;
  let ref = investmentsCol(userId, taxYearId).orderBy('date', 'desc');
  if (accountType) {
    ref = investmentsCol(userId, taxYearId)
      .where('accountType', '==', accountType)
      .orderBy('date', 'desc');
  }

  const snapshot = await ref.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
