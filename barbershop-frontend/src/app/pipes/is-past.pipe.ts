import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isPast',
  pure: true,
  standalone: true
})
export class IsPastPipe implements PipeTransform {

  transform(startTime: string | Date): boolean {
    if (!startTime) return false;
    
    // Convertește timpul programării și timpul curent în milisecunde
    const appointmentTime = new Date(startTime).getTime();
    const currentTime = Date.now();
    
    // Returnează true dacă programarea este în trecut
    return appointmentTime < currentTime;
  }
}
