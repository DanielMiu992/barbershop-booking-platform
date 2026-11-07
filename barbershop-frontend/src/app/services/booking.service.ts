import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { AVAILABLE_SLOTS_LIST_RESPONSE } from '../modules/booking.interfaces';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  constructor() { }

  private http = inject(HttpClient);
  private apiUrl = '/api';

  loadAvailableSlots(dateStr: string, barberId: number, serviceIds: Array<number>): Observable<AVAILABLE_SLOTS_LIST_RESPONSE> {

    console.log("==|| loadAvailableSlots SVC ||== serviceIds ==", serviceIds)

    const params = new HttpParams()
      .set('barberId', barberId.toString())
      .set('date', dateStr)
      .set('serviceIds', serviceIds.toString());

    return this.http.get<AVAILABLE_SLOTS_LIST_RESPONSE>(`${this.apiUrl}/get-available-slots`, { params });
  }

  createAppointment(serviceIds: any, barberId: number, dateStr: string, slotStr: string, guestUser: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-appointment`, {
      serviceIds,
      barberId,
      dateStr,
      slotStr,
      guestUser
    });
  }

}
