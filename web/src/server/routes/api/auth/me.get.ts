import { defineEventHandler, createError } from 'h3';
import { userDoc } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const snap = await userDoc(userId).get();
  if (!snap.exists) {
    throw createError({ statusCode: 404, statusMessage: 'User profile not found' });
  }
  return { id: snap.id, ...snap.data() };
});
