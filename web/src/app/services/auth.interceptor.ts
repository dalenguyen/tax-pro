import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { from, switchMap, of } from 'rxjs';
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

  // During SSR there is no Firebase user — return an empty response so
  // firstValueFrom resolves with null/[] rather than throwing EmptyError.
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return of(new HttpResponse({ status: 200, body: null }));
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
