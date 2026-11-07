import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export function scheduleHoursValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isActive = control.get('is_active')?.value;
    const start = control.get('start_hour')?.value;
    const end = control.get('end_hour')?.value;

    if (isActive && start && end && start >= end) {
      return { invalidHours: true };
    }
    return null;
  };
}