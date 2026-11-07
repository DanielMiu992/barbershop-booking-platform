import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function roMobilePhoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Returnează null (valid) dacă câmpul este gol 
    // (de validarea câmpului gol se ocupă Validators.required)
    if (!value) {
      return null;
    }

    // RegEx explicat:
    // ^07 -> trebuie să înceapă obligatoriu cu 07
    // [1-9] -> a treia cifră poate fi orice între 1 și 9
    // [0-9]{7}$ -> urmează exact încă 7 cifre, lungimea totală fiind de 10 cifre
    const roMobileRegex = /^07[1-9][0-9]{7}$/;
    const isValid = roMobileRegex.test(value);

    // Dacă numărul este valid returnează null, altfel returnează obiectul de eroare
    return isValid ? null : { invalidRoMobile: true };
  };
}