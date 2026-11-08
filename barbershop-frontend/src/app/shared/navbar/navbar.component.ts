import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { Menubar } from 'primeng/menubar';

@Component({
  selector: 'app-navbar',
  imports: [
    CommonModule,
    Menubar,
    RouterLink,
    RouterLinkActive,
    Button
  ],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  authService = inject(AuthService);
  router = inject(Router);

  items = computed<MenuItem[]>(() => [
    {
      label: 'Rezerva acum',
      icon: 'fa-solid fa-book',
      routerLink: '/booking',
      visible: !this.authService.isBarber(),
      routerLinkActiveOptions: "{ exact: true }"
    },
    {
      label: 'Echipa noastră',
      icon: 'fa-solid fa-face-smile',
      routerLink: '/team-presentation',
      //visible: !this.authService.isBarber(),
      routerLinkActiveOptions: "{ exact: true }"
    },

    {
      label: 'Istoric Rezervări',
      //icon: 'pi pi-clock',
      icon: 'fa-regular fa-clock',
      routerLink: '/customer-history',
      visible: this.authService.isCustomer(), // Deoarece se află într-un computed(), se va re-evalua automat!
      routerLinkActiveOptions: "{ exact: true }"
    },
    {
      label: 'Dasboard frizeri',
      // icon: 'pi pi-shield',
      icon: 'fa-solid fa-shield',
      routerLink: '/barber-dashboard',
      visible: this.authService.isBarber(),
      routerLinkActiveOptions: "{ exact: true }"
    },

    {
      label: 'Profil',
      // icon: 'pi pi-users',
      icon: 'fa-solid fa-address-card',
      routerLink: '/profile',
      visible: !this.authService.isAdmin() && this.authService.isLoggedIn(),
      routerLinkActiveOptions: "{ exact: true }"
    },


    {
      label: 'Panou Control',
      // icon: 'pi pi-shield',
      icon: 'fa-solid fa-shield',
      routerLink: '/admin-dashboard',
      visible: this.authService.isAdmin(),
      routerLinkActiveOptions: "{ exact: true }"
    },
    {
      label: 'Management Frizeri',
      //label: 'Management Echipă Frizeri',
      // icon: 'pi pi-users',
      icon: 'fa-solid fa-users',
      routerLink: '/admin-barbers',
      visible: this.authService.isAdmin(),
      routerLinkActiveOptions: "{ exact: true }"
    },
    {
      label: 'Management Servicii',
      // icon: 'pi pi-list-check',
      icon: 'fa-solid fa-list-check',
      routerLink: '/admin-services',
      visible: this.authService.isAdmin(),
      routerLinkActiveOptions: "{ exact: true }"
    }
  ]);
  constructor(){
    // console.log("==|| NavbarComponent ||== this.authService.currentUser()?.role ==", this.authService.currentUser())
    // console.log("==|| NavbarComponent ||== this.authService.isCustomer() ==", this.authService.isCustomer())
  }

  ngOnInit(){
  // this.items = computed<MenuItem[]>(() => [
  //   {
  //     label: 'Rezerva acum',
  //     icon: 'pi pi-book',
  //     routerLink: '/booking'
  //   },
  //   {
  //     label: 'Istoric Rezervări',
  //     icon: 'pi pi-clock',
  //     routerLink: '/customer-history',
  //     visible: this.authService.isCustomer() // Deoarece se află într-un computed(), se va re-evalua automat!
  //   },
  //   {
  //     label: 'Panou Control',
  //     icon: 'pi pi-shield',
  //     routerLink: '/admin-dashboard',
  //     visible: this.authService.isAdmin()
  //   },
  //   {
  //     label: 'Management Echipă Frizeri',
  //     icon: 'pi pi-users',
  //     routerLink: '/admin-barbers',
  //     visible: this.authService.isAdmin()
  //   },
  //   {
  //     label: 'Management Servicii',
  //     icon: 'pi pi-list-check',
  //     routerLink: '/admin-services',
  //     visible: this.authService.isAdmin()
  //   }
  // ]);
  }

  logout(): void { 
    this.authService.logout();
  }

  onAuthButtonClick(): void {
    if (this.authService.currentUser()) {
      this.logout();
    } else {
       this.router.navigate(['/login']);
    }
  }


}
