import { defineEventHandler } from 'h3';
import { taxYearsCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';
import { serializeDocs } from '../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const snapshot = await taxYearsCol(userId).orderBy('year', 'desc').get();
  return serializeDocs(snapshot.docs);
});
