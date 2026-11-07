import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function descriptionValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const containsLinks = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi.test(value);
    const containsEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(value);

    if (containsLinks || containsEmail) {return { containsTagsOrSriptingsOrLinksOrEmails: true }}

    const isCleanText = /^[a-zA-ZĂÂÎȘȚăâîșț0-9\s.,!?;:"'()\-–—]+$/u.test(value);
      
    const containsFunctionCall = /\b(console\.|alert\(|eval\(|prompt\()/gi.test(value);

    return isCleanText && !containsFunctionCall ? null : { containsTagsOrSriptingsOrLinksOrEmails: true };


  };
}