import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService, ClaimAccountCredentials } from '../../core/auth/auth.service';
import { Message } from 'primeng/message';

import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { matchPasswordValidator, passwordStrengthValidator } from '@validators/index';
import { ClaimService } from '../../services/claim.service';


@Component({
  selector: 'app-claim-account',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ReactiveFormsModule, 
    Card, 
    InputText, 
    Button, 
    Password, 
    RouterLink, 
    Message, 
    Toast
  ],
  templateUrl: './claim-account.component.html',
  styleUrl: './claim-account.component.scss'
})
export class ClaimAccountComponent {
  
  private claimService = inject(ClaimService);

  // private authService = inject(AuthService); 
  // private messageService = inject(MessageService);
  // private router = inject(Router)

  loading = signal(false);
  submitted = signal(false);
  errorMessage = signal<string | null>(null);

  // loading = false;
  // errorMessage = signal<string | null>(null);
  // successMessage = signal<string | null>(null);


  claimForm!: FormGroup;

  constructor(private fb: FormBuilder){
    
    this.claimForm = this.fb.group({
      email: ['', [
        Validators.required, 
        Validators.email, 
        Validators.maxLength(60)
      ]],
      // password: ['', [
      //   Validators.required, 
      //   passwordStrengthValidator()
      // ]],
      // confirm_password: [''],

    },
    // { 
    //   validators: matchPasswordValidator(),
    //   updateOn: 'submit'
    // }
    )
  }


  onClaimAccount(): void {
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.claimService.claimRequest(this.claimForm.value.email!).subscribe({
      next: () => {
        this.submitted.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Eroare la claim-request:', err);
        console.error('Eroare la claim-request - message - :', err.error.message);

        this.errorMessage.set(err?.error?.message ?? 'Nu am putut trimite emailul. Încearcă din nou peste câteva momente.');
        // if(err.error.message){
        //   this.errorMessage.set(err?.error?.message ?? 'Nu am putut trimite emailul. Încearcă din nou peste câteva momente.');
        // }else {
        //   this.errorMessage.set('Nu am putut trimite emailul. Încearcă din nou peste câteva momente.');
        // }
        
        this.loading.set(false);
      },
    });


    // this.errorMessage.set(null);
    // this.successMessage.set(null);

    // const { email, password, confirm_password } = this.claimForm.value;

    // if (this.claimForm.invalid) {
    //   return;
    // }
    // const credentials : ClaimAccountCredentials = {
    //   email : email,
    //   // password: password,
    //   // confirm_password: confirm_password
    // }
    // this.loading = true;

    // console.log("== || dance claim account || == credentials ==", credentials);
    // this.authService.claimAccount(credentials).subscribe({
    //   next: (response) => {

    //     console.log("== || claimAccount TS || == response ==", response);

        
    //     // Afișare Toast de Succes
    //     this.messageService.add({ 
    //       severity: 'info', 
    //       summary: 'Programare Anulată', 
    //       detail: response.message || 'Contul a fost creat cu succes! Te redirecționăm...',
    //       life: 4000 
    //     });

        

    //     setTimeout(() => this.router.navigate(['/login']), 2000); // Îl trimitem la login după succes

    //   },
    //   error: (err) => {
    //     //Afișare Toast de Eroare
    //     console.log("== || claimAccount TS || == err.error?.message ==", err.error?.message);

    //     this.messageService.add({ 
    //       severity: 'error', 
    //       summary: 'Eroare Rezervare', 
    //       detail: err.error?.message || 'A apărut o eroare la activarea contului.' 
    //     });

    //     this.loading = false;
    //   }
    // })
  }

  get email(){
    return this.claimForm.get('email');
  }

  // get password(){
  //   return this.claimForm.get('password');
  // }

  // get confirm_password(){
  //   return this.claimForm.get('confirm_password');
  // }


}
