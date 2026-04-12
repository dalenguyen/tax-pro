import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getOrInitApp() {
  if (getApps().length > 0) return getApps()[0]!;
  const serviceAccountJson = process.env['FIREBASE_SERVICE_ACCOUNT'];
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;
    return initializeApp({ credential: cert(serviceAccount) });
  }
  return initializeApp();
}

getOrInitApp();
export const auth = getAuth();
