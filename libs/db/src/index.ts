import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function initFirebase() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // In production (Cloud Run), uses Application Default Credentials
  // Locally, uses GOOGLE_APPLICATION_CREDENTIALS env var or service account JSON
  const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT'];
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    return initializeApp({ credential: cert(serviceAccount) });
  }

  return initializeApp({ projectId: 'cantax-fyi' });
}

const app = initFirebase();
export const db = getFirestore(app);
export { app };

export * from './lib/collections';
