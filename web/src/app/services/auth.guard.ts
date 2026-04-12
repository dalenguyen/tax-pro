import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, type CanActivateFn } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  // Let SSR through; the browser will re-run the guard with real auth state.
  if (!isPlatformBrowser(platformId)) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

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
