import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AuthPasswordService {

  constructor() { }

  private http = inject(HttpClient);

  forgotPassword(email: string) {
    return this.http.post<{ success: boolean; message: string }>(
      '/api/forgot-password', { email }
    );
  }

  validateResetToken(token: string) {
    return this.http.get<{ valid: boolean }>('/api/validate-reset-token', { params: { token } });
  }

  resetPassword(token: string, password: string) {
    return this.http.post<{ success: boolean; message: string }>(
      '/api/reset-password', { token, password }
    );
  }
}
