import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BarberProfileService {

  private http = inject(HttpClient);
  private apiUrl = '/api';

  constructor() { }

  getBarberProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-profile`);
  }

  getCustomerProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/my-customer-profile`);
  }


    // <SAVE_BARBER_DATA_RESPONSE> 
  updateBarberProfile(params: any): Observable<any>{
    // console.log("== || updateMyProfile SVC || == barberData ==", params)
    return this.http.put(`${this.apiUrl}/my-profile`, params);
  }

  updateCustomerProfile(params: any): Observable<any>{
    // console.log("== || updateMyProfile SVC || == barberData ==", params)
    return this.http.put(`${this.apiUrl}/my-customer-profile`, params);
  }



  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post<{ success: boolean; avatar_url: string; message?: string }>(
      '/api/upload-avatar', formData
    );
  }


  changePassword(current_password: string, new_password: string, confirm_password: string): Observable<any>{
    // console.log("== || changePassword SVC || == current_password ==", current_password)
    // console.log("== || changePassword SVC || == new_password ==", new_password)
    return this.http.put(`${this.apiUrl}/my-password`, {current_password, new_password, confirm_password});
  }

  setBarberSpecialties(params: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/set-specialities`, { params });

  }


  


}
