import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { customerGuard } from './core/guards/customer.guard';
import { MainLayoutComponent } from './shared/main-layout/main-layout.component';
import { guestGuard } from './core/guards/guest.guard';
import { barberGuard } from './core/guards/barber.guard';
import { barberCustomerGuard } from './core/guards/barber-customer.guard';

export const routes: Routes = [

    // 1. Rutele Publice (FĂRĂ MENIU)
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'claim-account',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/claim-account/claim-account.component').then(m => m.ClaimAccountComponent)
  },
  {
    path: 'complete-claim',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/claim-set-password/claim-set-password.component').then(m => m.ClaimSetPasswordComponent)
  },

  {
    path: 'forgot-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },

 // 2. Structura globală cu meniu dinamic
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'booking', pathMatch: 'full' },
      
      // Pagina publică / homepage (accesibilă oricui)
      { 
        path: 'booking', 
        //canActivate: [bookingGuard], 
        loadComponent: () => import('./features/booking/booking.component').then(m => m.BookingComponent) 
      },
      {
        path: 'team-presentation',
        canActivate: [guestGuard],
        loadComponent: () => import('./features/team-presentation/team-presentation.component')
          .then(m => m.TeamPresentationComponent)
      },

      
      // Pagini protejate pentru CLIENȚI
      { 
        path: 'customer-history', 
        canActivate: [customerGuard], 
        loadComponent: () => import('./features/customer-history/customer-history.component').then(m => m.CustomerHistoryComponent) 
      },

      { 
        path: 'barber-dashboard', 
        canActivate: [barberGuard], 
        loadComponent: () => import('./features/barber-dashboard/barber-dashboard.component').then(m => m.BarberDashboardComponent) 
      },

      
      // Pagini protejate pentru ADMINI
      { 
        path: 'admin-barbers', 
        canActivate: [adminGuard], 
        loadComponent: () => import('./features/admin-barbers/admin-barbers.component').then(m => m.AdminBarbersComponent) 
      },
      { 
        path: 'admin-dashboard', 
        canActivate: [adminGuard], 
        loadComponent: () => import('./features/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent) 
      },
      { 
        path: 'admin-services', 
        canActivate: [adminGuard], 
        loadComponent: () => import('./features/admin-services/admin-services.component').then(m => m.AdminServicesComponent) 
      },
      { 
        path: 'profile', 
        canActivate: [barberCustomerGuard], 
        loadComponent: () => import('./features/barber-profile/barber-profile.component').then(m => m.BarberProfileComponent) 
      },
      // { 
      //   path: 'user-profile', 
      //   canActivate: [customerGuard], 
      //   loadComponent: () => import('./features/user-profile/user-profile.component').then(m => m.UserProfileComponent) 
      // },

    ]
  },
  { path: '**', redirectTo: 'booking' }  


];
