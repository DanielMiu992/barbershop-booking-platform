import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GET_APPOINTMENT_CANCEL_INFO_RESPONSE, GET_APPOINTMENT_DETAILS_RESPONSE, GET_BARBER_DETAILS_RESPONSE, SET_APPOINTMENT_COMPLETED_RESPONSE, SET_CANCEL_APPOINTMENT_RESPONSE } from '../modules/common.interfaces';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private http = inject(HttpClient);
  private apiUrl = '/api';

  constructor() { }

  setCancelAppointment(p_appointment_id: number, p_cancel_reason: string): Observable<SET_CANCEL_APPOINTMENT_RESPONSE> {
    console.log("==|| setCancelAppointment ||== SERVICE ==", p_appointment_id, p_cancel_reason)
    return this.http.post<SET_CANCEL_APPOINTMENT_RESPONSE>(
      `${this.apiUrl}/set-cancel-appointment`, 
      {p_appointment_id, p_cancel_reason} 
    );
  }

  setAppointmentCompleted(p_appointment_id: number, p_appointment_overview: string): Observable<SET_APPOINTMENT_COMPLETED_RESPONSE> {
    return this.http.post<SET_APPOINTMENT_COMPLETED_RESPONSE>(
      `${this.apiUrl}/set-appointment-completed`, 
      {p_appointment_id, p_appointment_overview} 
    );
  }
  


  getAppointmentDetails(appointment_id: number | null = null): Observable<GET_APPOINTMENT_DETAILS_RESPONSE> {

    let queryParams = new HttpParams()
    if (appointment_id) queryParams = queryParams.set('appointment_id', appointment_id);
    
    return this.http.get<GET_APPOINTMENT_DETAILS_RESPONSE>(`${this.apiUrl}/get-appointment-details`, {
      params: queryParams
    });
  }


  getBarbersDetails(barber_id: number | null = null ): Observable<GET_BARBER_DETAILS_RESPONSE> {

    let queryParams = new HttpParams()
    if (barber_id) queryParams = queryParams.set('barber_id', barber_id);
    
    return this.http.get<GET_BARBER_DETAILS_RESPONSE>(`${this.apiUrl}/get-barber-details`, {
      params: queryParams
    });
  }


}
