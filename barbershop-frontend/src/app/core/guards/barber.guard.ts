import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const barberGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isBarber()) {
    return true; // Permite accesul la panou
  }

  // Dacă nu este customer, îl redirecționăm la login booking
    router.navigate(['/booking']);
    //router.navigate(['/login']);
  return false;
};