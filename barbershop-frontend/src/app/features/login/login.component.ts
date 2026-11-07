import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule } from '@angular/forms';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { Message } from 'primeng/message';

import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Card, InputText, Password, Button, Message, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm!: FormGroup;

  // email = '';
  // password = '';
  errorMessage = signal<string | null>(null);

  constructor(private fb: FormBuilder){

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, Validators.maxLength(60)]],
      password: ['', [Validators.required, Validators.maxLength(60)]]
    },
    {updateOn: 'submit'})

    // this.loginForm.valueChanges.subscribe(() => {
    //   if (this.isSubmitted) {
    //     this.isSubmitted = false;
    //   }

    //   console.log("==|| isSubmitted || ==", this.isSubmitted);
    // });
    
  }

  onLogin(): void {
    this.errorMessage.set(null);
    const { email, password } = this.loginForm.value;

    if (this.loginForm.invalid) {
      return;
    }


    this.authService.login({ email: email, password: password }).subscribe({
      next: () => {
        // Redirecționare în funcție de rol
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin-dashboard']);
        }else if(this.authService.isBarber()){
          this.router.navigate(['/barber-dashboard']);
        } else {
          this.router.navigate(['/booking']);
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'Eroare la autentificare.');
      }
    });
  }

  get email(){
    return this.loginForm.get('email');
  }

  get password(){
    return this.loginForm.get('password');
  }
}

//   {
//   "email": "admin@barbershop.com",
//   "password": "parolasupursecreta",
//   "first_name": "Manager",
//   "last_name": "General",
//   "phone": "0799999999",
//   "role": "admin"
// }

//Popescu123||popescu@gmail.com
//user_test2@gmail.com user123

