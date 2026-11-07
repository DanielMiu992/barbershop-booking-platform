import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { BARBER_SCHEDULE_LIST_ITEM, BARBER_SCHEDULE_LIST_RESPONSE, BARBERS_LIST_ITEM, BARBERS_LIST_RESPONSE, SAVE_BARBER_DATA_RESPONSE, SET_BARBER_SCHEDULE_RESPONSE, SET_FORM_MODEL } from '../modules/admin-barbers.interfaces';
import { SET_CLIENT_RATE_RESPONSE } from '../modules/admin-dashboard.interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminBarbersService { 
  
  private http = inject(HttpClient);
  private apiUrl = '/api';

  adminBarbers = signal<BARBERS_LIST_ITEM[]>([]);

  constructor() { }

  loadAdminBarbers(
    filters?: 
      { 
        active?: boolean; 
        search?: string; 
        first?: number; 
        rows?: number; 
        sortField: string | undefined; 
        sortOrder: number | undefined 
      }
    ): Observable<BARBERS_LIST_RESPONSE> {

    let params = new HttpParams();
    
    if (filters?.sortField) params = params.set('sortField', filters.sortField);
    if (filters?.sortOrder) params = params.set('sortOrder', filters.sortOrder);
    if (filters?.active !== null && filters?.active !== undefined) params = params.set('active', String(filters.active));
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.first !== undefined) params = params.set('first', String(filters.first));
    if (filters?.rows !== undefined) params = params.set('rows', String(filters.rows));
    
    return this.http.get<BARBERS_LIST_RESPONSE>(`${this.apiUrl}/get-barbers-list`, { params });
  }

  upsertBarber(params: any): Observable<SAVE_BARBER_DATA_RESPONSE> {
    return this.http.post<SAVE_BARBER_DATA_RESPONSE>(`${this.apiUrl}/save-barber-data`, params);
  }

  saveBarberSchedule(p_barber_id: number, schedule: any[]): Observable<SET_BARBER_SCHEDULE_RESPONSE> {
    return this.http.post<SET_BARBER_SCHEDULE_RESPONSE>(
      `${this.apiUrl}/set-barber-schedule`, 
      { schedule, p_barber_id } 
    );
  }

  getBarberSchedule(barber_id: number): Observable<BARBER_SCHEDULE_LIST_RESPONSE> {
    let params = new HttpParams();
    params = params.set('p_barber_id', barber_id);
    return this.http.get<BARBER_SCHEDULE_LIST_RESPONSE>(`${this.apiUrl}/get-barber-schedule`, {params});
  }

  exportAdminBarbersPdf(nameParam: string | null = null, statusParam: boolean | null = null): Observable<Blob> {
    
    let queryParams = new HttpParams();
    
    console.log("dance! -- exportAdminBarbersPdf -- this route")

    if (nameParam) {queryParams = queryParams.set('nameParam', nameParam)};
    queryParams = queryParams.set('statusParam', String(statusParam))


    // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
    return this.http.get(`${this.apiUrl}/export-pdf/barbers-management-pdf`, {
      params: queryParams,
      responseType: 'blob' 
    });
  }


uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append('avatar', file);
  return this.http.post<{ success: boolean; avatar_url: string; message?: string }>(
    '/api/upload-avatar', formData
  );
}

  




}
