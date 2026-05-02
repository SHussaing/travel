import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaymentMethodService } from '../services/payment-method.service';
import { PaymentMethod } from '../../../shared/models/entities.model';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-gray-900">Payment Methods</h2>
        <button
          (click)="openCreateModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Add Payment Method
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="text-center py-8">
        <p class="text-gray-600">Loading payment methods...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage() }}
      </div>

      <!-- Payment Methods Table -->
      <div *ngIf="!isLoading() && paymentMethods().length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Provider</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Display Name</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Configuration</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let method of paymentMethods()" class="border-b border-gray-200 hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ method.provider }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ method.displayName }}</td>
              <td class="px-6 py-4 text-sm">
                <span [ngClass]="method.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ method.enabled ? 'Enabled' : 'Disabled' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 truncate max-w-xs" [title]="method.configuration">
                {{ method.configuration || 'No configuration' }}
              </td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button
                  (click)="openEditModal(method)"
                  class="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Edit
                </button>
                <button
                  (click)="deletePaymentMethod(method.id)"
                  class="text-red-600 hover:text-red-800 font-semibold"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading() && paymentMethods().length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-600 text-lg">No payment methods found. Add one to get started.</p>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            {{ editingMethod() ? 'Edit Payment Method' : 'Add Payment Method' }}
          </h3>

          <form [formGroup]="methodForm" (ngSubmit)="submitForm()" class="space-y-4">
            <div>
              <label for="provider" class="block text-sm font-medium text-gray-700 mb-1">Provider*</label>
              <select
                id="provider"
                formControlName="provider"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a provider</option>
                <option value="STRIPE">Stripe</option>
                <option value="PAYPAL">PayPal</option>
                <option value="OTHER">Other</option>
              </select>
              <p *ngIf="methodForm.get('provider')?.hasError('required') && methodForm.get('provider')?.touched"
                 class="text-red-500 text-sm mt-1">
                Provider is required
              </p>
            </div>

            <div>
              <label for="displayName" class="block text-sm font-medium text-gray-700 mb-1">Display Name*</label>
              <input
                id="displayName"
                type="text"
                formControlName="displayName"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Primary Stripe Account"
              />
              <p *ngIf="methodForm.get('displayName')?.hasError('required') && methodForm.get('displayName')?.touched"
                 class="text-red-500 text-sm mt-1">
                Display name is required
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <input type="checkbox" formControlName="enabled" class="mr-2" />
                Enabled
              </label>
            </div>

            <div>
              <label for="configuration" class="block text-sm font-medium text-gray-700 mb-1">Configuration</label>
              <textarea
                id="configuration"
                formControlName="configuration"
                rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="API keys or configuration details (JSON format recommended)"
              ></textarea>
            </div>

            <div class="flex gap-4 mt-6">
              <button
                type="submit"
                [disabled]="methodForm.invalid || isSubmitting()"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
              >
                {{ isSubmitting() ? 'Saving...' : 'Save' }}
              </button>
              <button
                type="button"
                (click)="closeModal()"
                class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class PaymentMethodsComponent implements OnInit {
  private paymentMethodService = inject(PaymentMethodService);
  private fb = inject(FormBuilder);

  paymentMethods = signal<PaymentMethod[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  showModal = signal(false);
  editingMethod = signal<PaymentMethod | null>(null);

  methodForm: FormGroup;

  constructor() {
    this.methodForm = this.fb.group({
      provider: ['', Validators.required],
      displayName: ['', Validators.required],
      enabled: [true],
      configuration: ['']
    });
  }

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.paymentMethodService.getPaymentMethods().subscribe({
      next: (data) => {
        const safeMethods = Array.isArray(data) ? data : [];
        this.paymentMethods.set(safeMethods);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load payment methods:', error);
        this.errorMessage.set('Failed to load payment methods');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingMethod.set(null);
    this.methodForm.reset({ enabled: true });
    this.showModal.set(true);
  }

  openEditModal(method: PaymentMethod): void {
    this.editingMethod.set(method);
    this.methodForm.patchValue(method);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingMethod.set(null);
    this.methodForm.reset();
  }

  submitForm(): void {
    if (this.methodForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.methodForm.value;

    const request = this.editingMethod()
      ? this.paymentMethodService.updatePaymentMethod(this.editingMethod()!.id, formValue)
      : this.paymentMethodService.createPaymentMethod(formValue);

    request.subscribe({
      next: () => {
        this.loadPaymentMethods();
        this.closeModal();
      },
      error: (error) => {
        console.error('Failed to save payment method:', error);
        this.errorMessage.set('Failed to save payment method');
        this.isSubmitting.set(false);
      }
    });
  }

  deletePaymentMethod(id: string): void {
    if (confirm('Are you sure you want to delete this payment method?')) {
      this.paymentMethodService.deletePaymentMethod(id).subscribe({
        next: () => {
          this.loadPaymentMethods();
        },
        error: (error) => {
          console.error('Failed to delete payment method:', error);
          this.errorMessage.set('Failed to delete payment method');
        }
      });
    }
  }
}
