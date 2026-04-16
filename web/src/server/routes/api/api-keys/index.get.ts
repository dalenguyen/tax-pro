import { defineEventHandler } from 'h3';
import { apiKeysCol } from '@cantax-fyi/db';
import { requireUserId } from '../../../lib/require-auth';

export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const snap = await apiKeysCol().where('userId', '==', userId).orderBy('createdAt', 'desc').get();
  return snap.docs.map((d) => ({
    id: d.id,
    name: d.data()['name'],
    createdAt: d.data()['createdAt'],
    lastUsedAt: d.data()['lastUsedAt'] ?? null,
  }));
});
