import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './admin/admin-dashboard.component';
import { authGuard } from './auth/auth.guard';

const placeholder = (title: string) => ({
  title,
  canActivate: [authGuard],
  loadComponent: async () => (await import('./shared/placeholder-page.component')).PlaceholderPageComponent
});

export const routes: Routes = [
  { path: 'login', loadComponent: async () => (await import('./auth/login.component')).LoginComponent },

  { path: '', pathMatch: 'full', redirectTo: 'admin' },
  { path: 'admin', component: AdminDashboardComponent, title: 'Admin Dashboard', canActivate: [authGuard] },
  {
    path: 'admin/users',
    title: 'Users',
    canActivate: [authGuard],
    loadComponent: async () => (await import('./admin/users/users-page.component')).UsersPageComponent
  },
  {
    path: 'admin/travels',
    title: 'Travels',
    canActivate: [authGuard],
    loadComponent: async () => (await import('./admin/travels/travels-page.component')).TravelsPageComponent
  },
  {
    path: 'admin/payments',
    title: 'Payments',
    canActivate: [authGuard],
    loadComponent: async () => (await import('./admin/payments/payments-page.component')).PaymentsPageComponent
  },
  {
    path: 'admin/graph',
    title: 'Graph',
    canActivate: [authGuard],
    loadComponent: async () => (await import('./admin/graph/graph-page.component')).GraphPageComponent
  },
  { path: '**', redirectTo: 'admin' }
];
