import { defineEventHandler, getRouterParam, createError } from 'h3';
import { taxYearDoc } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';
import { serializeDoc } from '../../../lib/firestore-serialize';


export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' });

  const doc = await taxYearDoc(userId, id).get();
  if (!doc.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Tax year not found' });
  }

  return serializeDoc(doc);
});
