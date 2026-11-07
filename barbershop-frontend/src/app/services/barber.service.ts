import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ADMIN_APPOINTMENTS_LIST_RESPONSE } from '../modules/admin-dashboard.interfaces';


// export interface BarberServiceItem {
//   id: number;
//   name: string;
//   price: number;
//   duration_minutes: number;
//   is_active: boolean;
// }

// export interface BarberServiceItemCombo {
//   id: number;
//   name: string;
//   price: number;
//   duration_minutes: number;
// }


// export interface BarberPerson {
//   id?: number | null;
//   first_name: string;
//   last_name: string;
//   avatar_url: string;
//   is_active: boolean;
// }

// export interface ServicePayload {
//   id?: number | null;
//   name: string;
//   duration_minutes: number;
//   price: number;
//   is_active: boolean;
// }


// export interface BarberScheduleItem {
//   id: number;
//   barber_id: number;
//   day_of_week: number;
//   start_hour: string;
//   end_hour: string;
// }


// export interface BarberPersonCombo {
//   id: number;
//   full_name: string;
// }

// interface AvailableSlotsResponse {
//   data: string[];
//   success: boolean;
// }

// interface ServicesComboResponse {
//   result: any[]; // Poți înlocui any cu o interfață specifică precum BarberCombo[] dacă o ai definită
//   success: boolean;
// }

// interface BarbersComboResponse {
//   result: any[]; // Poți înlocui any cu o interfață specifică precum BarberCombo[] dacă o ai definită
//   success: boolean;
// }

// export interface UpsertServiceResponse {
//   id: number | null;
//   success: boolean;
//   message: string;
// }

// export interface UpsertBarberResponse {
//   id: number | null;
//   success: boolean;
//   message: string;
// }

// export interface SaveScheduleResponse {
//   success: boolean;
//   message: string;
// }

// export interface GetScheduleResponse {
//   data: BarberScheduleItem[] ;
//   success: boolean;
// }





@Injectable({
  providedIn: 'root'
})
export class BarberService {

  constructor() { }

    
  private http = inject(HttpClient);
  private apiUrl = '/api';

  // Stări globale gestionate prin Angular Signals
  // services = signal<BarberServiceItem[]>([]);

  // selectedService = signal<BarberServiceItem | null>(null);
  // selectedBarber = signal<BarberPerson | null>(null);

  // selectedBarberCombo = signal<BarberPersonCombo | null>(null);
  // selectedServiceCombo = signal<BarberServiceItemCombo | null>(null);

  // availableSlots = signal<string[]>([]);

  // adminServices = signal<BarberServiceItem[]>([]);
  // adminBarbers = signal<BarberPerson[]>([]);

  // publicBarbers = signal<any[]>([]); 

  // publicBarbersCombo = signal<Array<BarberPersonCombo>>([]);

  // publicServicesCombo = signal<Array<BarberServiceItemCombo>>([]);


  // Adaugă acest Signal în clasa BarberService pentru stocarea programărilor din panou
  // adminAppointments = signal<any[]>([]);
  // customerAppointments = signal<any[]>([]);


  // loadAvailableSlots(dateStr: string, barberId: number): Observable<AvailableSlotsResponse> {
  //   // 1. Folosim HttpParams pentru o construcție curată a parametrilor din URL
  //   const params = new HttpParams()
  //     .set('barberId', barberId.toString())
  //     .set('date', dateStr);

  //   // 2. Returnăm direct Observable-ul, fără .subscribe() în interiorul serviciului
  //   return this.http.get<AvailableSlotsResponse>(`${this.apiUrl}/get-available-slots`, { params });
  // }

  // createAppointment(serviceId: number, barberId: number, dateStr: string, slotStr: string, guestUser: any): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/create-appointment`, {
  //     serviceId,
  //     barberId,
  //     dateStr,
  //     slotStr,
  //     guestUser
  //   });
  // }



  // /api/appointments/:id/cancel

  // loadAdminAppointments(
  //   first: number, 
  //   rows: number, 
  //   customerName: string | null = null, 
  //   barberId: number | null = null, 
  //   serviceId: number | null = null,
  //   startDate: string | null = null, 
  //   endDate: string | null = null    
  // ): Observable<ADMIN_APPOINTMENTS_LIST_RESPONSE> {
    
  //   // Folosim HttpParams pentru o gestionare mai curată a parametrilor URL
  //   let queryParams = new HttpParams()
  //     .set('first', first.toString())
  //     .set('rows', rows.toString());

  //   if (customerName) queryParams = queryParams.set('customerName', customerName);
  //   if (barberId) queryParams = queryParams.set('barberId', barberId.toString());    
  //   if (serviceId) queryParams = queryParams.set('serviceId', serviceId.toString());
  //   if (startDate) queryParams = queryParams.set('startDate', startDate);
  //   if (endDate) queryParams = queryParams.set('endDate', endDate);


  //   // CORECT: Specificăm noul tip de răspuns așteptat de la API-ul Node.js
  //   return this.http.get<ADMIN_APPOINTMENTS_LIST_RESPONSE>(`${this.apiUrl}/get-admin-appointments-list`, {
  //     params: queryParams
  //   });
  // }











  // exportAdminServicesPdf(
  //   nameParam: string | null = null, 
  //   statusParam: boolean | null = null, 
  //   priceParam: number | null = null,
  // ): Observable<Blob> {
    
  //   let queryParams = new HttpParams();

  //   console.log("dance! -- exportAdminServicesPdf -- this route")

  //   // Atașăm filtrele exact ca la funcția de listare, dacă ele există
  //   if (nameParam) {queryParams = queryParams.set('nameParam', nameParam)};
  //   if (priceParam) {queryParams = queryParams.set('priceParam', priceParam.toString())};
  //   // if (statusParam !== null) {
      
  //     queryParams = queryParams.set('statusParam', String(statusParam));
  //   // }


  //   // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
  //   return this.http.get(`${this.apiUrl}/export-pdf/services-management-pdf`, {
  //     params: queryParams,
  //     responseType: 'blob' 
  //   });
  // }


  // Interfața ta rămâne valabilă pentru proprietatea 'data' din obiectul returnat
  // loadAdminServices(
  //   first: number, 
  //   rows: number, 
  //   name: string | null = null, 
  //   isActive: boolean | null = null, 
  //   maxPrice: number | null = null
  // ): Observable<{ data: BarberServiceItem[], total: number }> {
    
  //   // Construim parametrii folosind HttpParams pentru o formatare sigură în URL
  //   let queryParams = new HttpParams()
  //     .set('first', first.toString())
  //     .set('rows', rows.toString());

  //   if (name) {
  //     queryParams = queryParams.set('name', name);
  //   }
  //   if (isActive !== null) {
  //     queryParams = queryParams.set('isActive', isActive.toString());
  //   }
  //   if (maxPrice !== null && maxPrice > 0) {
  //     queryParams = queryParams.set('maxPrice', maxPrice.toString());
  //   }


  //   // CORECT: Mapăm noul tip de răspuns { data: [...], total: X } trimis din pgAdmin
  //   return this.http.get<{ data: BarberServiceItem[], total: number }>(`${this.apiUrl}/get-services-list`, {
  //     params: queryParams
  //   });
  // }


  // upsertService(payload: ServicePayload): Observable<UpsertServiceResponse> {
  //   return this.http.post<UpsertServiceResponse>(`${this.apiUrl}/save-service`, payload);
  // }



  // loadAdminBarbers(filters?: { active?: boolean; search?: string; first?: number; rows?: number }): Observable<{ data: any[], total: number }> {
  //   let params = new HttpParams();

  //   if (filters?.active !== undefined) params = params.set('active', String(filters.active));
    
  //   if (filters?.search) params = params.set('search', filters.search);

  //   if (filters?.first !== undefined) params = params.set('first', String(filters.first));
    
  //   if (filters?.rows !== undefined) params = params.set('rows', String(filters.rows));
    
  //   return this.http.get<{ data: any[], total: number }>(`${this.apiUrl}/get-barbers-list`, { params });
  // }


  // exportAdminBarbersPdf(
  //   nameParam: string | null = null, 
  //   statusParam: boolean | null = null, 
  // ): Observable<Blob> {
    
  //   let queryParams = new HttpParams();
    
  //   console.log("dance! -- exportAdminBarbersPdf -- this route")

  //   if (nameParam) {queryParams = queryParams.set('nameParam', nameParam)};
  //   queryParams = queryParams.set('statusParam', String(statusParam))


  //   // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
  //   return this.http.get(`${this.apiUrl}/export-pdf/barbers-management-pdf`, {
  //     params: queryParams,
  //     responseType: 'blob' 
  //   });
  // }


  // loadPublicBarbers(): void {
  //   this.http.get<any[]>(`${this.apiUrl}/barbers`, { params: { active: 'true' } }).subscribe({
  //     next: (barbers) => {
  //       this.publicBarbers.set(barbers);
        
  //     },
  //     error: (err) => console.error('Eroare la încărcarea frizerilor activi:', err)
  //   });
  // }



  // loadBarbersCombo(): void {
  //   // Dacă lista a fost deja încărcată anterior de o altă pagină, ne oprim instant (Cache)
  //   if (this.publicBarbersCombo().length > 0) return;

  //   this.http.get<BarbersComboResponse>(`${this.apiUrl}/barbers-combo`)
  //     .subscribe({
  //       next: (response) => {
  //          console.log("== || load BARBERS Combo || == response == ", response);
  //         // Dacă răspunsul de la Postgres este valid, salvăm datele în semnalul global
  //         if (response && response.success) {
  //           this.publicBarbersCombo.set(response.result);
  //         } else {
  //           this.publicBarbersCombo.set([]);
  //         }
  //       },
  //       error: (err: unknown) => {
  //         console.error('Eroare la încărcarea combo-ului de frizeri:', err);
  //         this.publicBarbersCombo.set([]); // Reset de siguranță în caz de eroare de rețea
  //       }
  //   });
  // }

  // loadServicesCombo(): void {
  //   // Dacă lista a fost deja încărcată anterior de o altă pagină, ne oprim instant (Cache)
  //   if (this.publicServicesCombo().length > 0) return;

  //   this.http.get<ServicesComboResponse>(`${this.apiUrl}/services-combo`)
  //     .subscribe({
  //       next: (response) => {
  //         // Dacă răspunsul de la Postgres este valid, salvăm datele în semnalul global
  //         console.log("== || load SERVICES Combo || == response == ", response);
  //         if (response && response.success) {
  //           this.publicServicesCombo.set(response.result);
  //         } else {
  //           this.publicServicesCombo.set([]);
  //         }
  //       },
  //       error: (err: unknown) => {
  //         console.error('Eroare la încărcarea combo-ului de servicii:', err);
  //         this.publicServicesCombo.set([]); // Reset de siguranță în caz de eroare de rețea
  //       }
  //     });
  // }

  
  // upsertBarber(barberData: BarberPerson): Observable<UpsertBarberResponse> {
  //   console.log("== || upsertBarber SVC || == barberData ==", barberData)
  //   return this.http.post<UpsertBarberResponse>(`${this.apiUrl}/save-barber-data`, barberData);
  // }

  //   // 2. Funcția actualizată cu tipizare strictă pentru Observable
  // saveBarberSchedule(p_barber_id: number, schedule: any[]): Observable<SaveScheduleResponse> {
  //   return this.http.post<SaveScheduleResponse>(
  //     `${this.apiUrl}/set-barber-schedule`, 
  //     { schedule, p_barber_id }, 
  //   );
  // }

  // getBarberSchedule(p_barber_id: number): Observable<GetScheduleResponse> {
  //    let params = new HttpParams();
  //    params = params.set('p_barber_id', p_barber_id);
  //   return this.http.get<GetScheduleResponse>(`${this.apiUrl}/get-barber-schedule`, {params});
  // }

}
