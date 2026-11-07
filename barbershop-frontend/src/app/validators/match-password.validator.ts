import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirm_password = control.get('confirm_password');

    // Dacă câmpurile nu au fost încă inițializate sau sunt goale, nu validăm
    if (!password || !confirm_password || !confirm_password.value) {
      return null;
    }

    // Dacă valorile diferă, setăm eroarea pe câmpul de confirmare
    if (password.value !== confirm_password.value) {
      confirm_password.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } 

    // Dacă parolele coincid, ștergem eroarea specifică (păstrând alte eventuale erori ca 'required')
    if (confirm_password.hasError('passwordMismatch')) {
      const { passwordMismatch, ...remainingErrors } = confirm_password.errors || {};
      confirm_password.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    }

    return null;
  };
}