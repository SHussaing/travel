import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import type { PaymentMethodDto, UpsertPaymentMethodRequest } from './payment-admin.types';
import { PaymentAdminApi } from './payment-admin.api';

@Component({
  selector: 'app-payments-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-semibold">Payments</h1>
        <button class="rounded-md bg-slate-900 px-3 py-2 text-sm text-white" (click)="startCreate()">
          Add method
        </button>
      </div>

      <div class="rounded-lg border bg-white">
        <div class="border-b px-4 py-3 text-sm text-slate-600">Manage payment methods (admin-only)</div>

        <div class="p-4">
          <div class="mb-3 flex items-center gap-3">
            <input
              class="w-full rounded-md border px-3 py-2 text-sm"
              placeholder="Search provider…"
              [(ngModel)]="query"
            />
            <button class="rounded-md border px-3 py-2 text-sm" (click)="reload()">Reload</button>
          </div>

          <div *ngIf="loading()" class="text-sm text-slate-600">Loading…</div>
          <div *ngIf="error()" class="text-sm text-red-600">{{ error() }}</div>

          <table *ngIf="!loading()" class="w-full table-auto text-left text-sm">
            <thead class="text-slate-600">
              <tr>
                <th class="py-2">Provider</th>
                <th class="py-2">Name</th>
                <th class="py-2">Enabled</th>
                <th class="py-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let m of filtered()" class="border-t">
                <td class="py-2 font-medium">{{ m.provider }}</td>
                <td class="py-2">{{ m.displayName }}</td>
                <td class="py-2">{{ m.enabled ? 'Yes' : 'No' }}</td>
                <td class="py-2 text-right">
                  <button class="rounded-md border px-2 py-1" (click)="startEdit(m)">Edit</button>
                  <button class="ml-2 rounded-md border px-2 py-1 text-red-700" (click)="remove(m)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!loading() && filtered().length === 0" class="text-sm text-slate-600">No methods.</div>
        </div>
      </div>

      <!-- Modal -->
      <div *ngIf="editing()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
        <div class="w-full max-w-2xl space-y-4 rounded-xl bg-white p-6 shadow">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">{{ editMode() === 'create' ? 'Add payment method' : 'Edit payment method' }}</h2>
            <button class="rounded-md border px-2 py-1" (click)="cancelEdit()">Close</button>
          </div>

          <form class="grid grid-cols-1 gap-3 md:grid-cols-2" (ngSubmit)="save()">
            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Provider</div>
              <input
                class="w-full rounded-md border px-3 py-2"
                name="provider"
                [(ngModel)]="form.provider"
                [readonly]="editMode() === 'edit'"
                required
              />
              <div class="mt-1 text-xs text-slate-500">Examples: STRIPE, PAYPAL</div>
            </label>

            <label class="block">
              <div class="mb-1 text-sm text-slate-600">Display name</div>
              <input class="w-full rounded-md border px-3 py-2" name="displayName" [(ngModel)]="form.displayName" required />
            </label>

            <label class="flex items-center gap-2 md:col-span-2">
              <input type="checkbox" name="enabled" [(ngModel)]="form.enabled" />
              <span class="text-sm">Enabled</span>
            </label>

            <label class="block md:col-span-2">
              <div class="mb-1 text-sm text-slate-600">Configuration (JSON)</div>
              <textarea class="w-full rounded-md border px-3 py-2 font-mono text-xs" rows="6" name="configuration" [(ngModel)]="form.configuration"></textarea>
              <div class="mt-1 text-xs text-slate-500">Stored as JSONB in PostgreSQL. Keep it valid JSON (or leave blank).</div>
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
export class PaymentsPageComponent {
  query = '';

  loading = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);
  saveError = signal<string | null>(null);

  methods = signal<PaymentMethodDto[]>([]);

  editMode = signal<'create' | 'edit'>('create');
  editing = signal<PaymentMethodDto | null>(null);

  form: UpsertPaymentMethodRequest = {
    provider: 'STRIPE',
    displayName: 'Stripe',
    enabled: true,
    configuration: '{\n  "publicKey": "pk_...",\n  "secretKey": "sk_..."\n}'
  };

  filtered = computed(() => {
    const q = this.query.trim().toLowerCase();
    const list = this.methods();
    if (!q) return list;
    return list.filter((m: PaymentMethodDto) => m.provider.toLowerCase().includes(q));
  });

  constructor(private readonly api: PaymentAdminApi) {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.methods.set(await this.api.list());
    } catch (e: any) {
      this.error.set(e?.message ?? 'Failed to load payment methods');
    } finally {
      this.loading.set(false);
    }
  }

  startCreate(): void {
    this.editMode.set('create');
    this.editing.set({ id: '', provider: '', displayName: '', enabled: true, configuration: '' });
    this.form = {
      provider: 'STRIPE',
      displayName: 'Stripe',
      enabled: true,
      configuration: '{\n  "publicKey": "pk_...",\n  "secretKey": "sk_..."\n}'
    };
    this.saveError.set(null);
  }

  startEdit(m: PaymentMethodDto): void {
    this.editMode.set('edit');
    this.editing.set(m);
    this.form = {
      provider: m.provider,
      displayName: m.displayName,
      enabled: m.enabled,
      configuration: m.configuration ?? ''
    };
    this.saveError.set(null);
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  private normalizeProvider(provider: string): string {
    return provider.trim().toUpperCase();
  }

  async save(): Promise<void> {
    this.saving.set(true);
    this.saveError.set(null);

    try {
      const req: UpsertPaymentMethodRequest = {
        provider: this.normalizeProvider(this.form.provider),
        displayName: this.form.displayName.trim(),
        enabled: this.form.enabled,
        configuration: (this.form.configuration ?? '').trim() || null
      };

      // Validate JSON (if present)
      if (req.configuration) {
        JSON.parse(req.configuration);
      }

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

  async remove(m: PaymentMethodDto): Promise<void> {
    const ok = confirm(`Delete payment method ${m.provider}?`);
    if (!ok) return;

    try {
      await this.api.delete(m.id);
      await this.reload();
    } catch (e: any) {
      alert(e?.error?.message ?? e?.message ?? 'Delete failed');
    }
  }
}

