import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/* Route guard: only signed-in admins reach the dashboard.
   Anyone else is redirected to the /admin login screen. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (await auth.isLoggedIn()) {
    return true;
  }
  return router.createUrlTree(['/admin']);
};
