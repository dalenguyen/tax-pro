import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap, EMPTY } from 'rxjs';
import { AuthService } from './auth.service';

/**
 * Attaches the Firebase ID token as a Bearer header to same-origin
 * `/api/**` requests when the user is signed in. Skips API requests
 * during SSR (no auth context available server-side).
 */
function isApiRequest(url: string): boolean {
  // Match both relative (/api/...) and absolute (http://host/api/...) URLs
  return /(?:^|\/)api\//.test(url);
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!isApiRequest(req.url)) {
    return next(req);
  }

  // During SSR there is no Firebase user — skip the request entirely
  // so components just render empty; the browser will re-fetch with auth.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return EMPTY;
  }

  const auth = inject(AuthService);
  return from(auth.getIdToken()).pipe(
    switchMap((token) => {
      if (!token) return next(req);
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(cloned);
    })
  );
};
