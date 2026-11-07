import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'isFuture',
  pure: true, // Se va rula DOAR când start_time se modifică efectiv
  standalone: true
})
export class IsFuturePipe implements PipeTransform {

  transform(startTime: string): boolean {
    if (!startTime) return false;
    return new Date(startTime).getTime() > Date.now();
  }

}
