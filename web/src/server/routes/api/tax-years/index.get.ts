import { defineEventHandler } from 'h3';
import { taxYearsCol } from '@can-tax-pro/db';
import { requireUserId } from '../../../lib/require-auth';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const snapshot = await taxYearsCol(userId).orderBy('year', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
