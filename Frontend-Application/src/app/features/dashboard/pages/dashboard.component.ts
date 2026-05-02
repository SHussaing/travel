import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
    <div class="flex h-screen bg-gray-100">
      <!-- Sidebar -->
      <div class="w-64 bg-gradient-to-b from-blue-900 to-purple-900 text-white shadow-lg">
        <div class="p-6 border-b border-purple-700">
          <h1 class="text-2xl font-bold">Travel Admin</h1>
          <p class="text-purple-300 text-sm mt-2">{{ username() }}</p>
        </div>

        <nav class="p-6 space-y-4">
          <a
            routerLink="/dashboard/users"
            routerLinkActive="bg-purple-700"
            class="block px-4 py-3 rounded-lg hover:bg-purple-700 transition cursor-pointer"
          >
            <span class="text-lg">👥</span> Users
          </a>
          <a
            routerLink="/dashboard/travels"
            routerLinkActive="bg-purple-700"
            class="block px-4 py-3 rounded-lg hover:bg-purple-700 transition cursor-pointer"
          >
            <span class="text-lg">✈️</span> Travels
          </a>
          <a
            routerLink="/dashboard/payment-methods"
            routerLinkActive="bg-purple-700"
            class="block px-4 py-3 rounded-lg hover:bg-purple-700 transition cursor-pointer"
          >
            <span class="text-lg">💳</span> Payment Methods
          </a>
        </nav>

        <div class="p-6 border-t border-purple-700 absolute bottom-0 w-64">
          <button
            (click)="logout()"
            class="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Header -->
        <div class="bg-white shadow-sm border-b border-gray-200 p-6">
          <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-auto p-6">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = signal<string | null>(null);

  ngOnInit(): void {
    const state = this.authService.authState();
    this.username.set(state.username);
  }

  logout(): void {
    this.authService.logout();
  }
}
