import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BARBERS_COMBO_ITEM, BARBERS_COMBO_RESPONSE, SERVICES_COMBO_ITEM, SERVICES_COMBO_RESPONSE, SP_COMBO_ITEM, SP_COMBO_RESPONSE } from '../modules/combo-box.interfaces';

@Injectable({
  providedIn: 'root'
})
export class ComboBoxService {

  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = '/api';

  publicBarbersCombo = signal<BARBERS_COMBO_ITEM[]>([]);
  publicServicesCombo = signal<SERVICES_COMBO_ITEM[]>([]);
  publicSpCombo = signal<SP_COMBO_ITEM[]>([]);

  mainServicesCombo = computed(() => 
    this.publicServicesCombo().filter(s => !s.is_addon)
  );

  addonServicesCombo = computed(() => 
    this.publicServicesCombo().filter(s => s.is_addon)
  );


  loadBarbersCombo(): void {
    // Dacă lista a fost deja încărcată anterior de o altă pagină, ne oprim instant (Cache)
    if (this.publicBarbersCombo().length > 0) return;

    this.http.get<BARBERS_COMBO_RESPONSE>(`${this.apiUrl}/barbers-combo`)
      .subscribe({
        next: (response) => {
          //  console.log("== || load BARBERS Combo || == response == ", response);
          // Dacă răspunsul de la Postgres este valid, salvăm datele în semnalul global
          console.log("==|| response ||== publicBarbersCombo ==", response)
          if (response && response.success) {
            // console.log("==|| response.result ||== publicBarbersCombo ==", response.result)
            this.publicBarbersCombo.set(response.result);
          } else {
            this.publicBarbersCombo.set([]);
          }
        },
        error: (err: unknown) => {
          console.error('Eroare la încărcarea combo-ului de frizeri:', err);
          this.publicBarbersCombo.set([]); // Reset de siguranță în caz de eroare de rețea
        }
    });
  }


  loadServicesCombo(): void {
    // Dacă lista a fost deja încărcată anterior de o altă pagină, ne oprim instant (Cache)
    if (this.publicServicesCombo().length > 0) return;

    this.http.get<SERVICES_COMBO_RESPONSE>(`${this.apiUrl}/services-combo`)
      .subscribe({
        next: (response) => {
          // Dacă răspunsul de la Postgres este valid, salvăm datele în semnalul global
          // console.log("== || load SERVICES Combo || == response == ", response);
          if (response && response.success) {
            this.publicServicesCombo.set(response.result);
          } else {
            this.publicServicesCombo.set([]);
          }
        },
        error: (err: unknown) => {
          console.error('Eroare la încărcarea combo-ului de servicii:', err);
          this.publicServicesCombo.set([]); // Reset de siguranță în caz de eroare de rețea
        }
      });
  }



  loadSpCombo(): void {
    // Dacă lista a fost deja încărcată anterior de o altă pagină, ne oprim instant (Cache)
    if (this.publicSpCombo().length > 0) return;

    this.http.get<SP_COMBO_RESPONSE>(`${this.apiUrl}/sp-combo`)
      .subscribe({
        next: (response) => {
          // Dacă răspunsul de la Postgres este valid, salvăm datele în semnalul global
          console.log("== || load SP Combo || == response == ", response);
          if (response && response.success) {
            this.publicSpCombo.set(response.result);
          } else {
            this.publicSpCombo.set([]);
          }
        },
        error: (err: unknown) => {
          console.error('Eroare la încărcarea combo-ului de servicii:', err);
          this.publicSpCombo.set([]); // Reset de siguranță în caz de eroare de rețea
        }
      });
  }




}
