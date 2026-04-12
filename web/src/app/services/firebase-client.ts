import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

/**
 * Lazy browser-side Firebase init. Safe to import from SSR because the
 * actual SDK calls are deferred until `getClientAuth()` runs, and that
 * should only be called inside `isPlatformBrowser`-guarded code paths.
 */
let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function config() {
  const env = import.meta.env as Record<string, string | undefined>;
  return {
    apiKey: env['VITE_FIREBASE_API_KEY'] ?? '',
    authDomain: env['VITE_FIREBASE_AUTH_DOMAIN'] ?? '',
    projectId: env['VITE_FIREBASE_PROJECT_ID'] ?? '',
    appId: env['VITE_FIREBASE_APP_ID'] ?? '',
  };
}

export function getClientAuth(): Auth {
  if (!app) {
    app = getApps()[0] ?? initializeApp(config());
  }
  if (!auth) {
    auth = getAuth(app);
  }
  return auth;
}
