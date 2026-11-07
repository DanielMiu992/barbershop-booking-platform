import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { AuthPasswordService } from '../../services/auth-password.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink, 
    ButtonModule, 
    InputTextModule, 
    MessageModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  private fb = inject(FormBuilder);
  private authPasswordService = inject(AuthPasswordService);

  loading = signal(false);
  submitted = signal(false);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  },{updateOn: 'submit'});

  get email() {
    return this.form.controls.email;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authPasswordService.forgotPassword(this.form.value.email!).subscribe({
      next: () => {
        this.submitted.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Eroare la forgot-password:', err);
        console.error('Eroare la forgot-password - message - :', err.error.message);

        this.errorMessage.set(err?.error?.message ?? 'Nu am putut trimite emailul. Încearcă din nou peste câteva momente.');
        // if(err.error.message){
        //   this.errorMessage.set(err?.error?.message ?? 'Nu am putut trimite emailul. Încearcă din nou peste câteva momente.');
        // }else {
        //   this.errorMessage.set('Nu am putut trimite emailul. Încearcă din nou peste câteva momente.');
        // }
        
        this.loading.set(false);
      },
    });
  }

}
