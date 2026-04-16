import { defineEventHandler, getQuery, createError } from 'h3';
import { receiptsCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const status = query['status'] as string;
  let ref = receiptsCol(userId, taxYearId).orderBy('createdAt', 'desc');
  if (status) {
    ref = receiptsCol(userId, taxYearId)
      .where('status', '==', status)
      .orderBy('createdAt', 'desc');
  }

  const snapshot = await ref.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
});
