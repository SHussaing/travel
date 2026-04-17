import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { TravelDto, UpsertTravelRequest } from './travel-admin.types';
import { TravelAdminApi } from './travel-admin.api';

@Component({
  selector: 'app-travels-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Travels</h1>
        <button class="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" (click)="startCreate()">
          Add travel
        </button>
      </div>

      <div class="rounded-lg border bg-white">
        <div class="border-b px-4 py-3 text-sm text-slate-600">Manage travel itineraries (admin-only)</div>

        <div class="p-4">
          <div class="mb-3 flex items-center gap-3">
            <input
              class="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Search destination…"
              [(ngModel)]="query"
            />
            <button class="rounded-md border px-3 py-2 text-sm" (click)="reload()">Reload</button>
          </div>

          <div *ngIf="loading()" class="text-sm text-slate-600">Loading…</div>
          <div *ngIf="error()" class="text-sm text-red-600">{{ error() }}</div>

          <table *ngIf="!loading()" class="w-full table-auto text-left text-sm">
            <thead class="text-slate-600">
              <tr>
                <th class="py-2">Destination</th>
                <th class="py-2">Dates</th>
                <th class="py-2">Duration</th>
                <th class="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filtered()" class="border-t">
                <td class="py-2">
                  <div class="font-medium">{{ t.destination }}</div>
                </td>
                <td class="py-2">{{ t.startDate }} → {{ t.endDate }}</td>
                <td class="py-2">{{ t.durationDays }} days</td>
                <td class="py-2 text-right">
                  <button class="rounded-md border px-2 py-1" (click)="startEdit(t)">Edit</button>
                  <button class="ml-2 rounded-md border px-2 py-1 text-red-700" (click)="remove(t)">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!loading() && filtered().length === 0" class="text-sm text-slate-600">No travels.</div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="editing()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div class="w-full max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ editMode() === 'create' ? 'Add travel' : 'Edit travel' }}</h2>
            <button class="rounded-md border px-2 py-1" (click)="cancelEdit()">Close</button>
          </div>

          <form class="grid grid-cols-1 gap-3 md:grid-cols-2" (ngSubmit)="save()">
            <label class="block md:col-span-2">
              <div class="mb-1 text-sm text-slate-600">Destination</div>
              <input class="w-full rounded-md border px-3 py-2" name="destination" [(ngModel)]="form.destination" required />
            </label>

            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Start date</div>
              <input class="w-full rounded-md border px-3 py-2" type="date" name="startDate" [(ngModel)]="form.startDate" required />
            </label>

            <label class="block">
              <div class="mb-1 text-sm text-slate-600">End date</div>
              <input class="w-full rounded-md border px-3 py-2" type="date" name="endDate" [(ngModel)]="form.endDate" required />
            </label>

            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Duration (days)</div>
              <input class="w-full rounded-md border px-3 py-2" type="number" min="1" name="durationDays" [(ngModel)]="form.durationDays" required />
            </label>

            <label class="block md:col-span-2">
              <div class="mb-1 text-sm text-slate-600">Activities</div>
              <textarea class="w-full rounded-md border px-3 py-2" rows="2" name="activities" [(ngModel)]="form.activities"></textarea>
            </label>

            <label class="block md:col-span-2">
              <div class="mb-1 text-sm text-slate-600">Accommodation</div>
              <textarea class="w-full rounded-md border px-3 py-2" rows="2" name="accommodation" [(ngModel)]="form.accommodation"></textarea>
            </label>

            <label class="block md:col-span-2">
              <div class="mb-1 text-sm text-slate-600">Transportation</div>
              <textarea class="w-full rounded-md border px-3 py-2" rows="2" name="transportation" [(ngModel)]="form.transportation"></textarea>
            </label>

            <div *ngIf="saveError()" class="md:col-span-2 text-sm text-red-600">{{ saveError() }}</div>

            <button
              class="md:col-span-2 w-full rounded-md bg-slate-900 px-3 py-2 text-white disabled:opacity-60"
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
export class TravelsPageComponent {
  query = '';

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null);

  travels = signal<TravelDto[]>([]);

  editMode = signal<'create' | 'edit'>('create');
  editing = signal<TravelDto | null>(null);

  form: UpsertTravelRequest = {
    destination: '',
    startDate: '',
    endDate: '',
    durationDays: 1,
    activities: '',
    accommodation: '',
    transportation: ''
  };

  filtered = computed(() => {
    const q = this.query.trim().toLowerCase();
    const list = this.travels();
    if (!q) return list;
    return list.filter((t: TravelDto) => t.destination.toLowerCase().includes(q));
  });

  constructor(private readonly api: TravelAdminApi) {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.travels.set(await this.api.list());
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load travels');
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.editMode.set('create');
    this.editing.set({
      id: '',
      destination: '',
      startDate: '',
      endDate: '',
      durationDays: 1,
      activities: '',
      accommodation: '',
      transportation: ''
    });
    this.form = {
      destination: '',
      startDate: '',
      endDate: '',
      durationDays: 1,
      activities: '',
      accommodation: '',
      transportation: ''
    };
    this.saveError.set(null);
  }

  startEdit(t: TravelDto): void {
    this.editMode.set('edit');
    this.editing.set(t);
    this.form = {
      destination: t.destination,
      startDate: t.startDate,
      endDate: t.endDate,
      durationDays: t.durationDays,
      activities: t.activities ?? '',
      accommodation: t.accommodation ?? '',
      transportation: t.transportation ?? ''
    };
    this.saveError.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);

    try {
      const req: UpsertTravelRequest = {
        destination: this.form.destination.trim(),
        startDate: this.form.startDate,
        endDate: this.form.endDate,
        durationDays: Number(this.form.durationDays) || 1,
        activities: this.form.activities ?? '',
        accommodation: this.form.accommodation ?? '',
        transportation: this.form.transportation ?? ''
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

  async remove(t: TravelDto): Promise<void> {
    const ok = confirm(`Delete travel to ${t.destination}?`);
    if (!ok) return;

    try {
      await this.api.delete(t.id);
      await this.reload();
    } catch (e: any) {
      alert(e?.error?.message ?? e?.message ?? 'Delete failed');
    }
  }
}

