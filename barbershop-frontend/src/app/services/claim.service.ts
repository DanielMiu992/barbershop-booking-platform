import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClaimService {

  constructor() { }

  private http = inject(HttpClient);

  claimRequest(email: string) {
    return this.http.post<{ success: boolean; message: string }>(
      '/api/claim-request', { email }
    );
  }

  validateResetToken(token: string) {
    return this.http.get<{ valid: boolean }>('/api/validate-claim-token', { params: { token } });
  }

  completeClaim(token: string, password: string) {
    return this.http.post<{ success: boolean; message: string }>(
      '/api/complete-claim', { token, password }
    );
  }

}
