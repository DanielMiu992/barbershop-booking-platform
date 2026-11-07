import { CanDeactivateFn } from '@angular/router';
import { BookingComponent } from '../../features/booking/booking.component';
import { ConfirmationService } from 'primeng/api';
import { inject } from '@angular/core';

export const pendingChangesGuard: CanDeactivateFn<BookingComponent> = (component) => {
  const stepper = component.stepperRef();
  
   // Dacă nu sunt disponibile, pasul implicit va fi considerat 1
  const pasCurent = stepper && stepper.value ? stepper.value() : 1;


  console.log('Pasul curent GUARD:', pasCurent);

    // Dacă utilizatorul este la Pasul 1, poate părăsi pagina imediat
  if (pasCurent &&  pasCurent <= 1) {
    console.log('Pasul curent <= 1, permit părăsirea paginii.');
    return true;
  }
  
   const confirmationService = inject(ConfirmationService);
   
  // Returnăm o promisiune asincronă pentru ca Routerul Angular să aștepte decizia utilizatorului
  return new Promise<boolean>((resolve) => {
    confirmationService.confirm({
      header: '⚠️ Părăsire Programare',
      message: 'Ai o rezervare în curs de completare. Sigur dorești să părăsești pagina și să pierzi datele selectate?',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Da',
      rejectLabel: 'Nu',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-sm',
      
      // Dacă apasă butonul de accept, promisiunea se rezolvă cu 'true' și ruta se schimbă
      accept: () => {
        resolve(true);
      },
      // Dacă apasă pe anulare sau închide modalul, se trimite 'false' și utilizatorul rămâne pe pagină
      reject: () => {
        resolve(false);
      }
    });
  });};