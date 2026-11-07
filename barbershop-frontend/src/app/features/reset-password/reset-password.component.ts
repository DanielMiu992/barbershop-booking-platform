import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { AuthPasswordService } from '../../services/auth-password.service';
import { passwordStrengthValidator } from '@validators/password-strength.validator';
import { matchPasswordValidator } from '@validators/match-password.validator';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

type TokenState = 'checking' | 'valid' | 'invalid';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, 
    RouterLink, 
    ButtonModule, 
    MessageModule, 
    PasswordModule, 
    ProgressSpinnerModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})

export class ResetPasswordComponent implements OnInit{

  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authPasswordService = inject(AuthPasswordService);

  tokenState = signal<TokenState>('checking');
  loading = signal(false);
  success = signal(false);
  errorMessage = signal<string | null>(null);

  private token: string | null = null;

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      confirm_password: ['', Validators.required],
    },
    { validators: matchPasswordValidator(), updateOn: 'submit' } //'password', 'confirm_password'
  );

ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    console.log("== || reset-password token ON INIT || == this.token == ", this.token)

    if (!this.token) {
      this.tokenState.set('invalid');
      return;
    }

    this.authPasswordService.validateResetToken(this.token).subscribe({
      next: (res) => this.tokenState.set(res.valid ? 'valid' : 'invalid'),
      error: () => this.tokenState.set('invalid'),
    });
  }
  
  onSubmit(): void {
    if (this.form.invalid || !this.token) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authPasswordService.resetPassword(this.token, this.form.value.password!).subscribe({
      next: () => {
        this.success.set(true);
        this.loading.set(false);
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err) => {
        console.error('Eroare la reset-password:', err);
        console.error('Eroare la reset-password - message - :', err.error.message);

        this.errorMessage.set(
          err?.error?.message ?? 'Nu am putut schimba parola. Încearcă din nou.'
        );
        this.loading.set(false);
      },
    });
  }  


  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirm_password;
  }
}
