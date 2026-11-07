import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function specialCharactersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Returnează null (valid) dacă câmpul este gol
    if (!value) {
      return null;
    }

    // RegEx care caută caractere speciale (tot ce NU este literă, cifră sau spațiu)
    const hasSpecialChars = /[^a-zA-Z0-9 ]/.test(value);

    // Dacă conține caractere speciale, returnează un obiect cu eroarea, altfel null
    return hasSpecialChars ? { specialChars: true } : null;
  };
}