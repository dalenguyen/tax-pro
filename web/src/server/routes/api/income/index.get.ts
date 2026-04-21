import { defineEventHandler, getQuery, createError } from 'h3';
import { incomeEntriesCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';
import { serializeDocs } from '../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const sourceType = query['sourceType'] as string;
  let ref = incomeEntriesCol(userId, taxYearId).orderBy('date', 'desc');
  if (sourceType) {
    ref = incomeEntriesCol(userId, taxYearId)
      .where('sourceType', '==', sourceType)
      .orderBy('date', 'desc');
  }

  const snapshot = await ref.get();
  return serializeDocs(snapshot.docs);
});
