import { defineEventHandler, getQuery, createError } from 'h3';
import { rentalPropertiesCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../../lib/require-auth';
import { serializeDocs } from '../../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const query = getQuery(event);
  const taxYearId = query['taxYearId'] as string;
  if (!taxYearId) {
    throw createError({ statusCode: 400, statusMessage: 'taxYearId is required' });
  }

  const snapshot = await rentalPropertiesCol(userId, taxYearId).orderBy('createdAt', 'desc').get();
  return serializeDocs(snapshot.docs);
});
