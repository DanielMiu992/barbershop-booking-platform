import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { ADMIN_APPOINTMENTS_ITEM_LIST, ADMIN_APPOINTMENTS_LIST_RESPONSE, GET_APPOINTMENT_OVERVIEW_RESPONSE, SET_CLIENT_RATE_RESPONSE } from '../modules/admin-dashboard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {

  private http = inject(HttpClient);
  private apiUrl = '/api';

  constructor() { }

  adminAppointments = signal<ADMIN_APPOINTMENTS_ITEM_LIST[]>([]);


  loadAdminAppointments(
    first: number, 
    rows: number, 
    customerName: string | null = null, 
    barberId: number | null = null, 
    serviceId: number | null= null,
    startDate: string | null = null, 
    endDate: string | null = null,
    searchQuery: string | null = null,
    status: string | null = null,
    sortField: string | undefined = undefined,
    sortOrder: number | undefined = undefined   
  ): Observable<ADMIN_APPOINTMENTS_LIST_RESPONSE> {
    
    let queryParams = new HttpParams()
      .set('first', first.toString())
      .set('rows', rows.toString())

    if (sortField) queryParams = queryParams.set('sortField', sortField);
    if (sortOrder) queryParams = queryParams.set('sortOrder', sortOrder);
    if (customerName) queryParams = queryParams.set('customerName', customerName);
    if (barberId) queryParams = queryParams.set('barberId', barberId.toString());    
    if (serviceId) queryParams = queryParams.set('serviceId', serviceId.toString());
    if (startDate) queryParams = queryParams.set('startDate', startDate);
    if (endDate) queryParams = queryParams.set('endDate', endDate);
    if (searchQuery) queryParams = queryParams.set('searchQuery', searchQuery);
    if (status) queryParams = queryParams.set('status', status);

    return this.http.get<ADMIN_APPOINTMENTS_LIST_RESPONSE>(`${this.apiUrl}/get-admin-appointments-list`, {
      params: queryParams
    });
  }

  exportAdminAppointmentsPdf(
    customerName: string | null = null, 
    barberId: number | null = null, 
    serviceId: number | null = null,
    startDate: string | null = null, 
    endDate: string | null = null,
    searchQuery: string | null = null,
    sortField: string | null = null,
    sortOrder: number | null = null
  ): Observable<Blob> {
    
    let queryParams = new HttpParams();


    // Atașăm filtrele exact ca la funcția de listare, dacă ele există
    if (customerName) {queryParams = queryParams.set('customerName', customerName)};
    if (barberId) { queryParams = queryParams.set('barberId', barberId.toString())};
    if (serviceId) { queryParams = queryParams.set('serviceId', serviceId.toString())};
    if (startDate) {queryParams = queryParams.set('startDate', startDate)};
    if (endDate) {queryParams = queryParams.set('endDate', endDate)};
    if (searchQuery) {queryParams = queryParams.set('searchQuery', searchQuery)};
    if (sortField) queryParams = queryParams.set('sortField', sortField);
    if (sortOrder) queryParams = queryParams.set('sortOrder', sortOrder.toString());

    // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
    return this.http.get(`${this.apiUrl}/export-pdf/admin-dashboard-pdf`, {
      params: queryParams,
      responseType: 'blob' 
    });
  }

  setClientRate(p_appointment_id: number, p_client_id: number, p_rating: number): Observable<SET_CLIENT_RATE_RESPONSE> {
    return this.http.post<SET_CLIENT_RATE_RESPONSE>(
      `${this.apiUrl}/set-client-rate`, 
      {p_appointment_id, p_client_id, p_rating}
    );
  }


  // setAppointmentCompleted(p_appointment_id: number, p_appointment_overview: string): Observable<SET_APPOINTMENT_COMPLETED_RESPONSE> {
  //   return this.http.post<SET_APPOINTMENT_COMPLETED_RESPONSE>(
  //     `${this.apiUrl}/set-appointment-completed`, 
  //     {p_appointment_id, p_appointment_overview} 
  //   );
  // }


  // getAdminAppointmentOverview(
  //   appointment_id: number | null = null, 
  // ): Observable<GET_APPOINTMENT_OVERVIEW_RESPONSE> {

  //   let queryParams = new HttpParams()
  //   if (appointment_id) queryParams = queryParams.set('appointment_id', appointment_id);
    
  //   return this.http.get<GET_APPOINTMENT_OVERVIEW_RESPONSE>(`${this.apiUrl}/get-admin-appointment-overview`, {
  //     params: queryParams
  //   });
  // }


  
  
  
}
