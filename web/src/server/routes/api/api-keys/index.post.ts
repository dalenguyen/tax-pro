import { defineEventHandler, readBody, createError } from 'h3';
import { createHash, randomBytes } from 'node:crypto';
import { apiKeyDoc } from '@can-tax-pro/db';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const body = await readBody(event);
  const name = (body?.name as string | undefined)?.trim();
  if (!name) throw createError({ statusCode: 400, statusMessage: 'name is required' });

  const plaintext = 'ctpk_' + randomBytes(32).toString('hex');
  const hash = createHash('sha256').update(plaintext).digest('hex');

  await apiKeyDoc(hash).set({
    name,
    userId,
    createdAt: FieldValue.serverTimestamp(),
    lastUsedAt: null,
  });

  // Return plaintext once — never stored, never retrievable again
  return { id: hash, name, plaintext };
});
