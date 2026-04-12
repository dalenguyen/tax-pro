import { initializeApp, type FirebaseApp, getApps } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Lazy browser-side Firebase init. Safe to import from SSR because the
 * actual SDK calls are deferred until `getClientAuth()` runs, and that
 * should only be called inside `isPlatformBrowser`-guarded code paths.
 */
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

function config() {
  const env = import.meta.env as Record<string, string | undefined>;
  return {
    apiKey: env['VITE_FIREBASE_API_KEY'] ?? 'AIzaSyCom0VPQ-uboEAUDPv8n1caSoOHJB9U9-g',
    authDomain: env['VITE_FIREBASE_AUTH_DOMAIN'] ?? 'cantax-fyi.firebaseapp.com',
    projectId: env['VITE_FIREBASE_PROJECT_ID'] ?? 'cantax-fyi',
    storageBucket: env['VITE_FIREBASE_STORAGE_BUCKET'] ?? 'cantax-fyi.firebasestorage.app',
    messagingSenderId: env['VITE_FIREBASE_MESSAGING_SENDER_ID'] ?? '371544889573',
    appId: env['VITE_FIREBASE_APP_ID'] ?? '1:371544889573:web:01c470bdbee96d5a4e5c0c',
    measurementId: env['VITE_FIREBASE_MEASUREMENT_ID'] ?? 'G-HKY6R8FYXV',
  };
}

function getClientApp(): FirebaseApp {
  if (!app) {
    app = getApps()[0] ?? initializeApp(config());
  }
  return app;
}

export function getClientAuth(): Auth {
  if (!auth) {
    auth = getAuth(getClientApp());
  }
  return auth;
}

export function getClientFirestore(): Firestore {
  if (!firestore) {
    firestore = getFirestore(getClientApp());
  }
  return firestore;
}
