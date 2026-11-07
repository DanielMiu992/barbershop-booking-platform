import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BookingComponent } from './features/booking/booking.component';
import { Toast } from 'primeng/toast';
import { NavbarComponent } from './shared/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BookingComponent, Toast, NavbarComponent],
  //RouterOutlet,
  
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  //template: `<app-booking></app-booking>`
})
export class AppComponent {
  title = 'barbershop-frontend';
}
