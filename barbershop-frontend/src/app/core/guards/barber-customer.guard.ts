import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const barberCustomerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && !authService.isAdmin()) {
    return true; // Permite accesul la panou
  }

  // Dacă nu este admin, îl redirecționăm la login
  router.navigate(['/booking']);
  //router.navigate(['/login']);
  return false;
};