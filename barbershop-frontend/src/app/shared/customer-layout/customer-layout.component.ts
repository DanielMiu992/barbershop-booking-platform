import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-customer-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NavbarComponent ],
  templateUrl: './customer-layout.component.html',
  styleUrl: './customer-layout.component.scss'
})
export class CustomerLayoutComponent {

}
