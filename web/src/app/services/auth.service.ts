import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getClientAuth } from './firebase-client';

export interface CurrentUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private platformId = inject(PLATFORM_ID);

  currentUser = signal<CurrentUser | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);
  ready = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      // On the server we have no persistent session; routes that need
      // auth will 401 via the HTTP interceptor when no token is available.
      this.ready.set(true);
      return;
    }
    const auth = getClientAuth();
    onAuthStateChanged(auth, (user) => {
      this.currentUser.set(user ? toCurrentUser(user) : null);
      this.ready.set(true);
    });
  }

  async getIdToken(): Promise<string | null> {
    if (!isPlatformBrowser(this.platformId)) return null;
    const user = getClientAuth().currentUser;
    return user ? user.getIdToken() : null;
  }

  async loginWithGoogle(): Promise<void> {
    const auth = getClientAuth();
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    // Ensure user doc exists (idempotent — safe to call on every login).
    const token = await cred.user.getIdToken();
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ email: cred.user.email, displayName: cred.user.displayName }),
    });
  }

  async login(email: string, password: string): Promise<void> {
    const auth = getClientAuth();
    await signInWithEmailAndPassword(auth, email, password);
  }

  async register(email: string, password: string, displayName?: string): Promise<void> {
    const auth = getClientAuth();
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    // Notify backend to create a user profile document. We fetch directly
    // so the HTTP interceptor attaches the freshly-minted ID token.
    const token = await cred.user.getIdToken();
    await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, displayName }),
    });
  }

  async logout(): Promise<void> {
    await signOut(getClientAuth());
  }
}

function toCurrentUser(user: FirebaseUser): CurrentUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
}
