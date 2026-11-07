import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';


import { routes } from './app.routes';
import { ConfirmationService, MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),  // Necesar pentru apelurile API către backend
    MessageService,
    ConfirmationService,
    providePrimeNG({
        theme: {
            preset: Aura,
            options: {
                darkModeSelector: '.my-app-dark' // Opțional, pentru managementul temei întunecate
            }
        }
    })
  ]
};