import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { UserAdminApi } from './user-admin.api';
import type { AdminUserDto, UpsertUserRequest } from './user-admin.types';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Users</h1>
        <button class="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" (click)="startCreate()">
          Add user
        </button>
      </div>

      <div class="rounded-lg border bg-white">
        <div class="border-b px-4 py-3 text-sm text-slate-600">Manage users and roles (admin-only)</div>

        <div class="p-4">
          <div class="mb-3 flex items-center gap-3">
            <input
              class="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Search by email…"
              [(ngModel)]="query"
            />
            <button class="rounded-md border px-3 py-2 text-sm" (click)="reload()">Reload</button>
          </div>

          <div *ngIf="loading()" class="text-sm text-slate-600">Loading…</div>
          <div *ngIf="error()" class="text-sm text-red-600">{{ error() }}</div>

          <table *ngIf="!loading()" class="w-full table-auto text-left text-sm">
            <thead class="text-slate-600">
              <tr>
                <th class="py-2">Email</th>
                <th class="py-2">Enabled</th>
                <th class="py-2">Roles</th>
                <th class="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of filtered()" class="border-t">
                <td class="py-2">{{ u.email }}</td>
                <td class="py-2">{{ u.enabled ? 'Yes' : 'No' }}</td>
                <td class="py-2">{{ u.roles.join(', ') }}</td>
                <td class="py-2 text-right">
                  <button class="rounded-md border px-2 py-1" (click)="startEdit(u)">Edit</button>
                  <button class="ml-2 rounded-md border px-2 py-1 text-red-700" (click)="remove(u)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!loading() && filtered().length === 0" class="text-sm text-slate-600">
            No users.
          </div>
        </div>
      </div>

      <!-- Simple modal -->
      <div *ngIf="editing()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div class="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ editMode() === 'create' ? 'Add user' : 'Edit user' }}</h2>
            <button class="rounded-md border px-2 py-1" (click)="cancelEdit()">Close</button>
          </div>

          <form class="space-y-3" (ngSubmit)="save()">
            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Email</div>
              <input class="w-full rounded-md border px-3 py-2" name="email" [(ngModel)]="form.email" required />
            </label>

            <label class="flex items-center gap-2">
              <input type="checkbox" name="enabled" [(ngModel)]="form.enabled" />
              <span class="text-sm">Enabled</span>
            </label>

            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Roles (comma-separated)</div>
              <input class="w-full rounded-md border px-3 py-2" name="roles" [(ngModel)]="rolesText" />
            </label>

            <div *ngIf="saveError()" class="text-sm text-red-600">{{ saveError() }}</div>

            <button
              class="w-full rounded-md bg-slate-900 px-3 py-2 text-white disabled:opacity-60"
              type="submit"
              [disabled]="saving()"
            >
              {{ saving() ? 'Saving…' : 'Save' }}
            </button>
          </form>
        </div>
      </div>
    </section>
  `
})
export class UsersPageComponent {
  query = '';

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null);

  users = signal<AdminUserDto[]>([]);

  editMode = signal<'create' | 'edit'>('create');
  editing = signal<AdminUserDto | null>(null);

  form: UpsertUserRequest = {
    email: '',
    enabled: true,
    roles: ['USER']
  };

  rolesText = 'USER';

  filtered = computed(() => {
    const q = this.query.trim().toLowerCase();
    const list = this.users();
    if (!q) return list;
    return list.filter((u: AdminUserDto) => u.email.toLowerCase().includes(q));
  });

  constructor(private readonly api: UserAdminApi) {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.users.set(await this.api.list());
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load users');
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.editMode.set('create');
    this.editing.set({ id: '', email: '', enabled: true, roles: ['USER'] });
    this.form = { email: '', enabled: true, roles: ['USER'] };
    this.rolesText = 'USER';
    this.saveError.set(null);
  }

  startEdit(u: AdminUserDto): void {
    this.editMode.set('edit');
    this.editing.set(u);
    this.form = { email: u.email, enabled: u.enabled, roles: [...u.roles] };
    this.rolesText = u.roles.join(',');
    this.saveError.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  private parsedRoles(): string[] {
    const roles = this.rolesText
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r) => r.toUpperCase());

    return roles.length ? roles : ['USER'];
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);

    try {
      const req: UpsertUserRequest = {
        email: this.form.email.trim(),
        enabled: this.form.enabled,
        roles: this.parsedRoles()
      };

      if (this.editMode() === 'create') {
        await this.api.create(req);
      } else {
        const id = this.editing()?.id;
        if (!id) {
          this.saveError.set('Missing id');
          return;
        }
        await this.api.update(id, req);
      }

      this.editing.set(null);
      await this.reload();
    } catch (e: any) {
      this.saveError.set(e?.error?.message ?? e?.message ?? 'Save failed');
    } finally {
      this.saving.set(false);
    }
  }

  async remove(u: AdminUserDto): Promise<void> {
    const ok = confirm(`Delete ${u.email}?`);
    if (!ok) return;

    try {
      await this.api.delete(u.id);
      await this.reload();
    } catch (e: any) {
      alert(e?.error?.message ?? e?.message ?? 'Delete failed');
    }
  }
}
