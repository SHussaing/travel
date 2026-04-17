import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  template: `
    <section class="space-y-4">
      <h1 class="text-2xl font-semibold">Admin Dashboard</h1>
      <p class="text-slate-600">
        Use the navigation above to manage users, travel itineraries, payment methods, and graph data.
      </p>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <a class="rounded-lg border bg-white p-4 hover:border-slate-400" routerLink="/admin/users">
          <div class="font-medium">Users</div>
          <div class="text-sm text-slate-600">Create/update/delete users and roles</div>
        </a>
        <a class="rounded-lg border bg-white p-4 hover:border-slate-400" routerLink="/admin/travels">
          <div class="font-medium">Travels</div>
          <div class="text-sm text-slate-600">Manage travel itineraries</div>
        </a>
        <a class="rounded-lg border bg-white p-4 hover:border-slate-400" routerLink="/admin/payments">
          <div class="font-medium">Payments</div>
          <div class="text-sm text-slate-600">Manage payment methods</div>
        </a>
        <a class="rounded-lg border bg-white p-4 hover:border-slate-400" routerLink="/admin/graph">
          <div class="font-medium">Graph</div>
          <div class="text-sm text-slate-600">Manage Neo4j places</div>
        </a>
      </div>
    </section>
  `,
  imports: [RouterLink]
})
export class AdminDashboardComponent {}
