import { defineEventHandler, getRouterParam, createError } from 'h3';
import { taxYearDoc } from '@can-tax-pro/db';

const TEST_USER_ID = 'test-user';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const doc = await taxYearDoc(TEST_USER_ID, id).get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }

  return { id: doc.id, ...doc.data() };
});
