import { defineEventHandler } from 'h3';
import { taxYearsCol } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async () => {
  const snapshot = await taxYearsCol(TEST_USER_ID).orderBy('year', 'desc').get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
