import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { BARBER_APPOINTMENTS_LIST_ITEM, BARBER_APPOINTMENTS_LIST_RESPONSE } from '../modules/barber-dashboard.interfaces';
import { SERVICES_COMBO_ITEM } from '../modules/combo-box.interfaces';
import { Observable } from 'rxjs';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class BarberDashboardService {

  private http = inject(HttpClient);
  private apiUrl = '/api';

  barberAppointments = signal<BARBER_APPOINTMENTS_LIST_ITEM[]>([]);

  constructor() { }


  loadBarberAppointments(
    first: number, 
    rows: number, 
    serviceId: SERVICES_COMBO_ITEM | null = null,
    maxPrice: number | null = null, 
    maxDuration: number | null = null, 
    startDate: string | null = null,
    endDate: string | null = null,
    searchQuery: string | null = null,
    sortField: string | undefined = undefined,
    sortOrder: number | undefined = undefined   

  ): Observable<BARBER_APPOINTMENTS_LIST_RESPONSE> {

    let queryParams = new HttpParams()
      .set('first', first.toString())
      .set('rows', rows.toString());

    if (sortField) queryParams = queryParams.set('sortField', sortField);
    if (sortOrder) queryParams = queryParams.set('sortOrder', sortOrder);

    if (serviceId) queryParams = queryParams.set('serviceId', serviceId.id.toString());
    if (maxPrice) queryParams = queryParams.set('maxPrice', maxPrice);
    if (maxDuration) queryParams = queryParams.set('maxDuration', maxDuration);
    if (startDate) queryParams = queryParams.set('startDate', startDate);
    if (endDate) queryParams = queryParams.set('endDate', endDate);
    // if (startDate) queryParams = queryParams.set('startDate', formatDate(startDate, 'yyyy-MM-dd', 'en-US'));
    // if (endDate) queryParams = queryParams.set('endDate', formatDate(endDate, 'yyyy-MM-dd', 'en-US'));
 

   
    if (searchQuery) queryParams = queryParams.set('searchQuery', searchQuery);

    return this.http.get<BARBER_APPOINTMENTS_LIST_RESPONSE>(`${this.apiUrl}/get-barber-appointments-list`, {
      params: queryParams
    });
  }

  exportBarberAppointmentsPdf(
    serviceId: SERVICES_COMBO_ITEM | null = null,
    maxPrice: number | null = null,
    maxDuration: number | null = null,
    startDate: string | null = null, 
    endDate: string | null = null,
    searchQuery: string | null = null    
  ): Observable<Blob> {
    
    let queryParams = new HttpParams();


    // Atașăm filtrele exact ca la funcția de listare, dacă ele există
    if (serviceId) { queryParams = queryParams.set('serviceId', serviceId.id.toString())};
    if (maxPrice) queryParams = queryParams.set('maxPrice', maxPrice);
    if (maxDuration) queryParams = queryParams.set('maxDuration', maxDuration);

    if (startDate) queryParams = queryParams.set('startDate', startDate);
    if (endDate) queryParams = queryParams.set('endDate', endDate);

    if (searchQuery) queryParams = queryParams.set('searchQuery', searchQuery);

    // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
    return this.http.get(`${this.apiUrl}/export-pdf/barber-dashboard-pdf`, {
      params: queryParams,
      responseType: 'blob' 
    });
  }
  

}
