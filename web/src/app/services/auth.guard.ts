import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, type CanActivateFn } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  // On SSR there is no Firebase session — let the route render (dashboard
  // layout shows a loading state). The browser guard runs after hydration.
  if (!isPlatformBrowser(platformId)) return true;

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
