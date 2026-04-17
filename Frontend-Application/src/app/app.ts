import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from './auth/auth.service';
import { AuthState } from './auth/auth.state';
import { ToastHostComponent } from './shared/toast-host.component';
import { ToastService } from './shared/toast.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, ToastHostComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Frontend-Application');

  readonly authState = inject(AuthState);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  logout(): void {
    this.authService.logout();
    this.toast.show('You have been logged out.', 'info');
    void this.router.navigateByUrl('/login');
  }
}
