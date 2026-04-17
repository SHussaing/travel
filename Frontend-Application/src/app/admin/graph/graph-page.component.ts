import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { PlaceDto, UpsertPlaceRequest } from './graph-admin.types';
import { GraphAdminApi } from './graph-admin.api';

@Component({
  selector: 'app-graph-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Graph</h1>
        <button class="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" (click)="startCreate()">
          Add place
        </button>
      </div>

      <div class="rounded-lg border bg-white">
        <div class="border-b px-4 py-3 text-sm text-slate-600">Manage Neo4j places (admin-only)</div>

        <div class="p-4">
          <div class="mb-3 flex items-center gap-3">
            <input
              class="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Search name/country…"
              [(ngModel)]="query"
            />
            <button class="rounded-md border px-3 py-2 text-sm" (click)="reload()">Reload</button>
          </div>

          <div *ngIf="loading()" class="text-sm text-slate-600">Loading…</div>
          <div *ngIf="error()" class="text-sm text-red-600">{{ error() }}</div>

          <table *ngIf="!loading()" class="w-full table-auto text-left text-sm">
            <thead class="text-slate-600">
              <tr>
                <th class="py-2">Name</th>
                <th class="py-2">Country</th>
                <th class="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let p of filtered()" class="border-t">
                <td class="py-2 font-medium">{{ p.name }}</td>
                <td class="py-2">{{ p.country }}</td>
                <td class="py-2 text-right">
                  <button class="rounded-md border px-2 py-1" (click)="startEdit(p)">Edit</button>
                  <button class="ml-2 rounded-md border px-2 py-1 text-red-700" (click)="remove(p)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!loading() && filtered().length === 0" class="text-sm text-slate-600">No places.</div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="editing()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div class="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ editMode() === 'create' ? 'Add place' : 'Edit place' }}</h2>
            <button class="rounded-md border px-2 py-1" (click)="cancelEdit()">Close</button>
          </div>

          <form class="space-y-3" (ngSubmit)="save()">
            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Name</div>
              <input class="w-full rounded-md border px-3 py-2" name="name" [(ngModel)]="form.name" required />
            </label>

            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Country</div>
              <input class="w-full rounded-md border px-3 py-2" name="country" [(ngModel)]="form.country" required />
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
export class GraphPageComponent {
  query = '';

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null);

  places = signal<PlaceDto[]>([]);

  editMode = signal<'create' | 'edit'>('create');
  editing = signal<PlaceDto | null>(null);

  form: UpsertPlaceRequest = {
    name: '',
    country: ''
  };

  filtered = computed(() => {
    const q = this.query.trim().toLowerCase();
    const list = this.places();
    if (!q) return list;
    return list.filter(
      (p: PlaceDto) => p.name.toLowerCase().includes(q) || p.country.toLowerCase().includes(q)
    );
  });

  constructor(private readonly api: GraphAdminApi) {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.places.set(await this.api.list());
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load places');
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.editMode.set('create');
    this.editing.set({ id: '', name: '', country: '' });
    this.form = { name: '', country: '' };
    this.saveError.set(null);
  }

  startEdit(p: PlaceDto): void {
    this.editMode.set('edit');
    this.editing.set(p);
    this.form = { name: p.name, country: p.country };
    this.saveError.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);

    try {
      const req: UpsertPlaceRequest = {
        name: this.form.name.trim(),
        country: this.form.country.trim()
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

  async remove(p: PlaceDto): Promise<void> {
    const ok = confirm(`Delete place ${p.name}?`);
    if (!ok) return;

    try {
      await this.api.delete(p.id);
      await this.reload();
    } catch (e: any) {
      alert(e?.error?.message ?? e?.message ?? 'Delete failed');
    }
  }
}

