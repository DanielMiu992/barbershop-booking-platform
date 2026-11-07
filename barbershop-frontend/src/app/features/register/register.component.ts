import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { AuthService } from '../../core/auth/auth.service';

import { specialCharactersValidator, roMobilePhoneValidator, passwordStrengthValidator, matchPasswordValidator} from '@validators/index';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
      CommonModule, 
      FormsModule, 
      ReactiveFormsModule, 
      RouterModule, 
      Card, 
      InputText, 
      Password, 
      Button, 
      Message, 
      RouterLink
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  registerForm!: FormGroup;

  constructor(private fb: FormBuilder){

    this.registerForm = this.fb.group({
      last_name: ['', [
        Validators.required, 
        Validators.maxLength(60),
        specialCharactersValidator()
      ]],
      first_name: ['', [
          Validators.required, 
          Validators.maxLength(60),
          specialCharactersValidator()
        ]],
      email: ['', [
          Validators.required, 
          Validators.email, 
          Validators.maxLength(60)
        ]],
      phone:['', roMobilePhoneValidator()],
      password: ['', [
          Validators.required, 
          passwordStrengthValidator()
        ]],
      confirm_password: [''],
      role:[null]
    }, 
    { 
      validators: matchPasswordValidator(),
      updateOn: 'submit'
    })
    // {updateOn: 'submit'})
  }

  onRegister(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const {first_name, last_name,  email, phone, password} = this.registerForm.value;
    

    console.log("==|| this.confirm_password ||== ", this.confirm_password);

    if (this.registerForm.invalid) {
      return;
    }

    const payload = {
      first_name: first_name,
      last_name: last_name,
      email: email,
      phone: phone,
      password: password,
    };


    this.authService.register(payload).subscribe({
      next: () => {
        this.successMessage.set('Contul a fost creat cu succes! Te redirecționăm...');
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.error || 'A apărut o eroare la înregistrare.');
      }
    });


  }

  get last_name(){
    return this.registerForm.get('last_name');
  }
  get first_name(){
    return this.registerForm.get('first_name');
  }
  get email(){
    return this.registerForm.get('email');
  }
  get phone(){
    return this.registerForm.get('phone');
  }

  get password(){
    return this.registerForm.get('password');
  }

  get confirm_password(){
    return this.registerForm.get('confirm_password');
  }

  get f(){
    return this.registerForm.controls
  }





}
