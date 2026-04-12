import { defineEventHandler, getRequestHeader } from 'h3';
import { auth } from '../lib/firebase-admin';

function extractBearerToken(header: string | undefined): string | null {
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

/**
 * Verifies the Firebase ID token on every request (when present) and
 * populates `event.context.userId` / `event.context.userEmail`.
 *
 * This middleware is deliberately permissive: missing/invalid tokens
 * do NOT short-circuit the request. Individual routes decide whether
 * auth is required by calling `requireUserId(event)`. That keeps
 * endpoints like `/api/v1/hello` and `/api/auth/register` reachable
 * from unauthenticated clients.
 */
export default defineEventHandler(async (event) => {
  const header = getRequestHeader(event, 'authorization');
  const token = extractBearerToken(header);
  if (!token) return;

  try {
    const decoded = await auth.verifyIdToken(token);
    event.context['userId'] = decoded.uid;
    event.context['userEmail'] = decoded.email ?? null;
  } catch {
    // Invalid token — leave context empty; protected routes will 401.
  }
});
