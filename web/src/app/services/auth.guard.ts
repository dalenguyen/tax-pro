import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  // Let SSR through; the browser pass will re-run the guard with a
  // populated AuthService and redirect if still unauthenticated.
  if (!isPlatformBrowser(platformId)) return true;

  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  router.navigateByUrl('/login');
  return false;
};
