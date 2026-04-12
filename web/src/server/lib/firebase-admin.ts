import { getAuth } from 'firebase-admin/auth';
// Importing the shared db module triggers firebase-admin initialization
// (Application Default Credentials in Cloud Run, FIREBASE_SERVICE_ACCOUNT locally).
import '@can-tax-pro/db';

export const auth = getAuth();
