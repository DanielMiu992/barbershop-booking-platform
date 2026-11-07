import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { CANCEL_APPOINTMENT_RESPONSE, CUSTOMER_APPOINTMENTS_LIST_ITEM, CUSTOMER_APPOINTMENTS_LIST_RESPONSE, SET_BARBER_RATE_RESPONSE } from '../modules/client-dashboard.interfaces';
import { BARBERS_COMBO_ITEM, SERVICES_COMBO_ITEM } from '../modules/combo-box.interfaces';


@Injectable({
  providedIn: 'root'
})
export class ClientDashboardService {

  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = '/api';

  customerAppointments = signal<CUSTOMER_APPOINTMENTS_LIST_ITEM[]>([]);


  loadCustomerAppointments(
    first: number, 
    rows: number, 
    serviceId: SERVICES_COMBO_ITEM | null = null,
    maxPrice: number | null = null, 
    maxDuration: number | null = null, 
    barberId: BARBERS_COMBO_ITEM | null = null, 
    startDate: string | null = null,
    endDate: string | null = null,
    searchQuery: string | null = null,
    sortField: string | undefined = undefined,
    sortOrder: number | undefined = undefined   
  ): Observable<CUSTOMER_APPOINTMENTS_LIST_RESPONSE> {

    let queryParams = new HttpParams()
      .set('first', first.toString())
      .set('rows', rows.toString());

    if (sortField) queryParams = queryParams.set('sortField', sortField);
    if (sortOrder) queryParams = queryParams.set('sortOrder', sortOrder);
    if (serviceId) queryParams = queryParams.set('serviceId', serviceId.id.toString());
    if (maxPrice) queryParams = queryParams.set('maxPrice', maxPrice);
    if (maxDuration) queryParams = queryParams.set('maxDuration', maxDuration);
    if (barberId) queryParams = queryParams.set('barberId', barberId.id.toString());    
    if (startDate) queryParams = queryParams.set('startDate', startDate);
    if (endDate) queryParams = queryParams.set('endDate', endDate);
    if (searchQuery) queryParams = queryParams.set('searchQuery', searchQuery);



    console.log("== || loadCustomerAppointments SVC || == queryParams == ", queryParams.toString());

    // CORECT: Specificăm noul tip de răspuns așteptat de la API-ul Node.js
    return this.http.get<CUSTOMER_APPOINTMENTS_LIST_RESPONSE>(`${this.apiUrl}/get-customer-appointments-list`, {
      params: queryParams
    });
  }

  // cancelAppointment(p_appointment_id: number): Observable<CANCEL_APPOINTMENT_RESPONSE> {
  //   return this.http.post<CANCEL_APPOINTMENT_RESPONSE>(
  //     `${this.apiUrl}/cancel-appointment-by-client`, 
  //     {p_appointment_id}
  //   );
  // }

  exportCustomerAppointmentsPdf(
    serviceId: SERVICES_COMBO_ITEM | null = null,
    maxPrice: number | null = null,
    maxDuration: number | null = null,
    barberId: BARBERS_COMBO_ITEM | null = null, 
    startDate: string | null = null, 
    endDate: string | null = null,
    searchQuery: string | null = null    
  ): Observable<Blob> {
    
    let queryParams = new HttpParams();


    // Atașăm filtrele exact ca la funcția de listare, dacă ele există
    if (barberId) { queryParams = queryParams.set('barberId', barberId.id.toString())};
    if (serviceId) { queryParams = queryParams.set('serviceId', serviceId.id.toString())};
    if (maxPrice) queryParams = queryParams.set('maxPrice', maxPrice);
    if (maxDuration) queryParams = queryParams.set('maxDuration', maxDuration);

    if (startDate) queryParams = queryParams.set('startDate', startDate);
    if (endDate) queryParams = queryParams.set('endDate', endDate);

    if (searchQuery) queryParams = queryParams.set('searchQuery', searchQuery);

    // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
    return this.http.get(`${this.apiUrl}/export-pdf/customer-dashboard-pdf`, {
      params: queryParams,
      responseType: 'blob' 
    });
  }


  setBarberRate(p_appointment_id: number, p_barber_id: number, p_rating: number): Observable<SET_BARBER_RATE_RESPONSE> {
    return this.http.post<SET_BARBER_RATE_RESPONSE>(
      `${this.apiUrl}/set-barber-rate`, 
      {p_appointment_id, p_barber_id, p_rating}
    );
  }

 
  


}
