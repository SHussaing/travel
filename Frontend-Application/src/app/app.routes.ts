import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/pages/login.component';
import { DashboardComponent } from './features/dashboard/pages/dashboard.component';
import { UsersComponent } from './features/users/pages/users.component';
import { TravelsComponent } from './features/travels/pages/travels.component';
import { PaymentMethodsComponent } from './features/payment/pages/payment-methods.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [authGuard]
      },
      {
        path: 'travels',
        component: TravelsComponent,
        canActivate: [authGuard]
      },
      {
        path: 'payment-methods',
        component: PaymentMethodsComponent,
        canActivate: [authGuard]
      },
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
