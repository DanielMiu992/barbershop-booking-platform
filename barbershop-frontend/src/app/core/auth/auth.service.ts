import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';


export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  user_id: number;
  first_name: string;
  last_name: string;
  role: string;
}

export interface ClaimAccountCredentials {
  email: string;
  // password: string;
  // confirm_password: string
}

export interface RegisterData {
  email: string;
  password?: string; // sau password, în funcție de maparea din formular
  first_name: string;
  last_name: string;
  phone: string;
  //role?: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface AuthActionResponse {
  user_id: number | null;
  success: boolean;
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api';

  // Stări reactive globale
  // currentUser = signal<{ first_name: string; last_name: string; role: string } | null>(null);
  // token = signal<string | null>(localStorage.getItem('token'));

  token = signal<string | null>(localStorage.getItem('token'));
  currentUser = signal<UserProfile | null>(JSON.parse(localStorage.getItem('user') || 'null'));

  // Verifică reactiv dacă utilizatorul este admin
  isAdmin = computed(() => this.currentUser()?.role === 'admin');
  isCustomer = computed(() => this.currentUser()?.role === 'customer');
  isBarber = computed(() => this.currentUser()?.role === 'barber');
  isLoggedIn = computed(() => !!this.token());

  constructor() {
    // La pornirea aplicației, dacă avem token, încercăm să restaurăm utilizatorul simplificat din stocare
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.currentUser.set(JSON.parse(savedUser));

      console.log("this.currentUser()?.role ", this.currentUser()?.role )
      console.log("isBarber", this.isBarber )
    }
  }

  // login(credentials: { email: string; password: string }): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
  //     tap(response => {
  //       localStorage.setItem('token', response.token);
  //       localStorage.setItem('user', JSON.stringify(response.user));

  //       console.log("|| RESPONSE USER SVC LOGIN ||", response.user);
        
  //       this.token.set(response.token);
  //       this.currentUser.set(response.user);
  //     })
  //   );
  // }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        console.log("==|| login ||== response ==", response)
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        this.token.set(response.token);
        this.currentUser.set(response.user);
        console.log("==|| login ||== this.currentUser ==", this.currentUser)
      })
    );
  }

  register(userData: RegisterData): Observable<AuthActionResponse> {
    return this.http.post<AuthActionResponse>(`${this.apiUrl}/register`, userData);
  }

  // claimAccount(p_email: string, password: string): Observable<any> {
  //   return this.http.post<any>(`${this.apiUrl}/claim-account`, { p_email, password }); 
  // }

  claimAccount(credentials: ClaimAccountCredentials): Observable<AuthActionResponse> {
    console.log("== || claimAccount SVC || ==", credentials)
    return this.http.post<AuthActionResponse>(`${this.apiUrl}/claim-account`, credentials);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/booking']); // Redirecționează utilizatorul către pagina de booking după logout
    // this.router.navigate(['/login']);
  }


}
