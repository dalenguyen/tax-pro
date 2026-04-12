import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, type CanActivateFn } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // On SSR there is no persistent session — redirect to login.
  // The browser re-runs the guard after hydration with real Firebase state.
  if (!isPlatformBrowser(platformId)) return router.createUrlTree(['/login']);

  const auth = inject(AuthService);

  // Wait until Firebase has resolved the persisted session, then decide.
  return toObservable(auth.ready).pipe(
    filter(Boolean),
    take(1),
    map(() => {
      if (auth.isAuthenticated()) return true;
      return router.createUrlTree(['/login']);
    }),
  );
};
