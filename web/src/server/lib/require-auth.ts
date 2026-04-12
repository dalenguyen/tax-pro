import { createError, type H3Event } from 'h3';

/**
 * Returns the authenticated user id from event.context, or throws 401.
 * Populated by the auth middleware after verifying a Firebase ID token.
 */
export function requireUserId(event: H3Event): string {
  const userId = event.context['userId'] as string | undefined;
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
  }
  return userId;
}
