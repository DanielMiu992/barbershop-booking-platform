import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { GET_SERVICE_DETAILS_RESPONSE, SAVE_SERVICE_RESPONSE, SAVE_SP_RESPONSE, SERVICES_LIST_ITEM, SERVICES_LIST_RESPONSE, SPECIALTIES_LIST_ITEM, SPECIALTIES_LIST_RESPONSE } from '../modules/admin-services.interface';

@Injectable({
  providedIn: 'root'
})

export class AdminServicesService {

  private http = inject(HttpClient);
  private apiUrl = '/api';

  constructor() { }

  adminSv = signal<SERVICES_LIST_ITEM[]>([]);

  adminSp = signal<SPECIALTIES_LIST_ITEM[]>([]);

  

  loadAdminServices(
    first: number, 
    rows: number, 
    name: string | null = null, 
    isActive: boolean | null = null, 
    maxPrice: number | null = null,
    sortField: string | undefined = undefined,
    sortOrder: number | undefined = undefined   

  ): Observable<SERVICES_LIST_RESPONSE> {
    
    // Construim parametrii folosind HttpParams pentru o formatare sigură în URL
    let queryParams = new HttpParams()
      .set('first', first.toString())
      .set('rows', rows.toString());

    if (sortField) queryParams = queryParams.set('sortField', sortField);
    if (sortOrder) queryParams = queryParams.set('sortOrder', sortOrder);
    if (name) queryParams = queryParams.set('name', name);
    if (isActive !== null) queryParams = queryParams.set('isActive', isActive.toString());
    if (maxPrice !== null && maxPrice > 0) queryParams = queryParams.set('maxPrice', maxPrice.toString());


    // CORECT: Mapăm noul tip de răspuns { data: [...], total: X } trimis din pgAdmin
    return this.http.get<SERVICES_LIST_RESPONSE>(`${this.apiUrl}/get-services-list`, {
      params: queryParams
    });
  }


  upsertService(payload: SERVICES_LIST_ITEM): Observable<SAVE_SERVICE_RESPONSE> {
    return this.http.post<SAVE_SERVICE_RESPONSE>(`${this.apiUrl}/save-service`, payload);
  }


  exportAdminServicesPdf(
    nameParam: string | null = null, 
    statusParam: boolean | null = null, 
    priceParam: number | null = null,
  ): Observable<Blob> {
    
    let queryParams = new HttpParams();

    console.log("dance! -- exportAdminServicesPdf -- this route")

    // Atașăm filtrele exact ca la funcția de listare, dacă ele există
    if (nameParam) {queryParams = queryParams.set('nameParam', nameParam)};
    if (priceParam) {queryParams = queryParams.set('priceParam', priceParam.toString())};
    // if (statusParam !== null) {
      
      queryParams = queryParams.set('statusParam', String(statusParam));
    // }


    // IMPORTANT: Adăugăm { responseType: 'blob' } pentru ca Angular să trateze răspunsul ca pe un fișier binar
    return this.http.get(`${this.apiUrl}/export-pdf/services-management-pdf`, {
      params: queryParams,
      responseType: 'blob' 
    });
  }


  getServiceDetails(service_id: number | null = null ): Observable<GET_SERVICE_DETAILS_RESPONSE> {

    let queryParams = new HttpParams()
    if (service_id) queryParams = queryParams.set('service_id', service_id);
    
    return this.http.get<GET_SERVICE_DETAILS_RESPONSE>(`${this.apiUrl}/get-service-details`, {
      params: queryParams
    });
  }


  loadAdminSpecialties(
    first: number, 
    rows: number, 
    searchQuery: string | null = null, 
    isActive: boolean | null = null, 
    sortField: string | undefined = undefined,
    sortOrder: number | undefined = undefined   

  ): Observable<SPECIALTIES_LIST_RESPONSE> {
    
    // Construim parametrii folosind HttpParams pentru o formatare sigură în URL
    let queryParams = new HttpParams()
      .set('first', first.toString())
      .set('rows', rows.toString());

    if (sortField) queryParams = queryParams.set('sortField', sortField);
    if (sortOrder) queryParams = queryParams.set('sortOrder', sortOrder);
    if (searchQuery) queryParams = queryParams.set('searchQuery', searchQuery);
    if (isActive !== null) queryParams = queryParams.set('isActive', isActive.toString());


    // CORECT: Mapăm noul tip de răspuns { data: [...], total: X } trimis din pgAdmin
    return this.http.get<SPECIALTIES_LIST_RESPONSE>(`${this.apiUrl}/get-specialties-list`, {
      params: queryParams
    });
  }

  upsertSp(payload: SPECIALTIES_LIST_ITEM): Observable<SAVE_SP_RESPONSE> {
    return this.http.post<SAVE_SP_RESPONSE>(`${this.apiUrl}/save-sp`, payload);
  }


  



}
