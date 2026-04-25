import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto max-w-md space-y-4 rounded-xl border bg-white p-6">
      <h1 class="text-xl font-semibold">Admin Login</h1>

      <form class="space-y-3" (ngSubmit)="onSubmit()">
        <label class="block">
          <div class="mb-1 text-sm text-slate-600">Username</div>
          <input
            class="w-full rounded-md border px-3 py-2"
            name="username"
            [(ngModel)]="username"
            autocomplete="username"
            required
          />
        </label>

        <label class="block">
          <div class="mb-1 text-sm text-slate-600">Password</div>
          <input
            class="w-full rounded-md border px-3 py-2"
            type="password"
            name="password"
            [(ngModel)]="password"
            autocomplete="current-password"
            required
          />
        </label>

        <button
          class="w-full rounded-md bg-slate-900 px-3 py-2 text-white disabled:opacity-60"
          type="submit"
          [disabled]="loading()"
        >
          {{ loading() ? 'Signing in…' : 'Sign in' }}
        </button>

        <p *ngIf="error()" class="text-sm text-red-600">{{ error() }}</p>
      </form>
    </section>
  `
})
export class LoginComponent {
  username = 'admin';
  password = 'admin123';

  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  async onSubmit(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.loginAdmin({ username: this.username, password: this.password });
      await this.router.navigateByUrl('/admin');
    } catch (e: any) {
      const status = e?.status;

      if (status === 401) {
        this.error.set('Invalid username or password.');
      } else {
        this.error.set('Sign-in is temporarily unavailable. Please try again.');
      }
    } finally {
      this.loading.set(false);
    }
  }
}
