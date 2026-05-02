import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TravelService } from '../services/travel.service';
import { Travel } from '../../../shared/models/entities.model';

@Component({
  selector: 'app-travels',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-gray-900">Travels Management</h2>
        <button
          (click)="openCreateModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Add Travel
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="text-center py-8">
        <p class="text-gray-600">Loading travels...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage() }}
      </div>

      <!-- Travels Table -->
      <div *ngIf="!isLoading() && travels().length > 0" class="bg-white rounded-lg shadow-md overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Destination</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Dates</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Activities</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let travel of travels()" class="border-b border-gray-200 hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ travel.destination }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ travel.startDate }} to {{ travel.endDate }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ travel.durationDays }} days</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ travel.activities || 'N/A' }}</td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button
                  (click)="openEditModal(travel)"
                  class="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Edit
                </button>
                <button
                  (click)="deleteTravel(travel.id)"
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
      <div *ngIf="!isLoading() && travels().length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-600 text-lg">No travels found. Create one to get started.</p>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            {{ editingTravel() ? 'Edit Travel' : 'Create New Travel' }}
          </h3>

          <form [formGroup]="travelForm" (ngSubmit)="submitForm()" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="destination" class="block text-sm font-medium text-gray-700 mb-1">Destination*</label>
                <input
                  id="destination"
                  type="text"
                  formControlName="destination"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Paris, France"
                />
              </div>

              <div>
                <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date*</label>
                <input
                  id="startDate"
                  type="date"
                  formControlName="startDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date*</label>
                <input
                  id="endDate"
                  type="date"
                  formControlName="endDate"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label for="durationDays" class="block text-sm font-medium text-gray-700 mb-1">Duration (days)*</label>
                <input
                  id="durationDays"
                  type="number"
                  formControlName="durationDays"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label for="activities" class="block text-sm font-medium text-gray-700 mb-1">Activities</label>
              <input
                id="activities"
                type="text"
                formControlName="activities"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Sightseeing, Museums, Dining"
              />
            </div>

            <div>
              <label for="accommodation" class="block text-sm font-medium text-gray-700 mb-1">Accommodation</label>
              <input
                id="accommodation"
                type="text"
                formControlName="accommodation"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Hotel de Luxe, 5-star"
              />
            </div>

            <div>
              <label for="transportation" class="block text-sm font-medium text-gray-700 mb-1">Transportation</label>
              <input
                id="transportation"
                type="text"
                formControlName="transportation"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g., Flight, Train, Car"
              />
            </div>

            <div class="flex gap-4 mt-6">
              <button
                type="submit"
                [disabled]="travelForm.invalid || isSubmitting()"
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
export class TravelsComponent implements OnInit {
  private travelService = inject(TravelService);
  private fb = inject(FormBuilder);

  travels = signal<Travel[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  showModal = signal(false);
  editingTravel = signal<Travel | null>(null);

  travelForm: FormGroup;

  constructor() {
    this.travelForm = this.fb.group({
      destination: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      durationDays: [0, Validators.required],
      activities: [''],
      accommodation: [''],
      transportation: ['']
    });
  }

  ngOnInit(): void {
    this.loadTravels();
  }

  loadTravels(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.travelService.getTravels().subscribe({
      next: (data) => {
        const safeTravels = Array.isArray(data) ? data : [];
        this.travels.set(safeTravels);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load travels:', error);
        this.errorMessage.set('Failed to load travels');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingTravel.set(null);
    this.travelForm.reset({
      durationDays: 0,
      activities: '',
      accommodation: '',
      transportation: ''
    });
    this.showModal.set(true);
  }

  openEditModal(travel: Travel): void {
    this.editingTravel.set(travel);
    this.travelForm.patchValue(travel);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingTravel.set(null);
    this.travelForm.reset();
  }

  submitForm(): void {
    if (this.travelForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.travelForm.value;

    const request = this.editingTravel()
      ? this.travelService.updateTravel(this.editingTravel()!.id, formValue)
      : this.travelService.createTravel(formValue);

    request.subscribe({
      next: () => {
        this.loadTravels();
        this.closeModal();
      },
      error: (error) => {
        console.error('Failed to save travel:', error);
        this.errorMessage.set('Failed to save travel');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteTravel(id: string): void {
    if (confirm('Are you sure you want to delete this travel?')) {
      this.travelService.deleteTravel(id).subscribe({
        next: () => {
          this.loadTravels();
        },
        error: (error) => {
          console.error('Failed to delete travel:', error);
          this.errorMessage.set('Failed to delete travel');
        }
      });
    }
  }
}
