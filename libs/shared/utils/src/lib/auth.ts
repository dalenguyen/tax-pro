/**
 * Extracts the token from an HTTP Authorization header of the form
 * `Bearer <token>`. Returns null if the header is missing, uses a
 * different scheme, or has no token value.
 */
export function extractBearerToken(
  authHeader: string | undefined | null
): string | null {
  if (!authHeader) return null;
  const trimmed = authHeader.trim();
  const match = /^Bearer\s+(.+)$/i.exec(trimmed);
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}
