import { defineEventHandler, readBody, createError } from 'h3';
import { userDoc } from '@cantax-fyi/db';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUserId } from '../../../lib/require-auth';

/**
 * Called immediately after a successful Firebase client-side signup.
 * Creates the user profile document keyed on the Firebase uid. Idempotent:
 * if the doc already exists, returns the existing profile.
 */
export default defineEventHandler(async (event) => {
  const userId = requireUserId(event);
  const body = await readBody(event);

  const email = (body?.email as string | undefined) ?? (event.context['userEmail'] as string | undefined);
  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'email is required' });
  }
  const displayName = (body?.displayName as string | undefined) ?? null;

  const ref = userDoc(userId);
  const existing = await ref.get();

  if (!existing.exists) {
    await ref.set({
      email,
      displayName,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  const snap = await ref.get();
  return { id: snap.id, ...snap.data() };
});
