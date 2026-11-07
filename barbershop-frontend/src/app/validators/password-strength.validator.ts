import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    // Reguli individuale de validare
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value);
    const hasValidLength = value.length >= 10; // Standardul modern recomandă minim 10 caractere

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar && hasValidLength;

    // Dacă parola nu este validă, returnăm un obiect cu criteriile neîndeplinite
    return !passwordValid
      ? {
          passwordStrength: {
            hasUpperCase,
            hasLowerCase,
            hasNumeric,
            hasSpecialChar,
            hasValidLength
          }
        }
      : null;
    };
}