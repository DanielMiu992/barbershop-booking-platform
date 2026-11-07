import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Dacă utilizatorul este logat (verificăm semnalul din AuthService)
  if (authService.isLoggedIn()) {
    
    // Verificăm rolul pentru a-l trimite pe pagina potrivită
    if (authService.isAdmin()) {
      router.navigate(['/admin-dashboard']);
    } else {
      router.navigate(['/booking']);
    }
    
    return false; // Blochează accesul la pagina de login/register
  }

  return true; // Permite accesul dacă este vizitator nelogat
};