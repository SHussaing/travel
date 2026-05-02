import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { User } from '../../../shared/models/entities.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold text-gray-900">Users Management</h2>
        <button
          (click)="openCreateModal()"
          class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          + Add User
        </button>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading()" class="text-center py-8">
        <p class="text-gray-600">Loading users...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="errorMessage()" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {{ errorMessage() }}
      </div>

      <!-- Users Table -->
      <div *ngIf="!isLoading() && users().length > 0" class="bg-white rounded-lg shadow-md overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50 border-b border-gray-200">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Roles</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users()" class="border-b border-gray-200 hover:bg-gray-50">
              <td class="px-6 py-4 text-sm text-gray-900">{{ user.id }}</td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ user.email }}</td>
              <td class="px-6 py-4 text-sm">
                <span [ngClass]="user.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                      class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ user.enabled ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ Array.from(user.roles).join(', ') || 'No roles' }}
              </td>
              <td class="px-6 py-4 text-sm space-x-2">
                <button
                  (click)="openEditModal(user)"
                  class="text-blue-600 hover:text-blue-800 font-semibold"
                >
                  Edit
                </button>
                <button
                  (click)="deleteUser(user.id)"
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
      <div *ngIf="!isLoading() && users().length === 0" class="text-center py-12 bg-white rounded-lg">
        <p class="text-gray-600 text-lg">No users found. Create one to get started.</p>
      </div>

      <!-- Modal -->
      <div *ngIf="showModal()" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-8 w-full max-w-md max-h-96 overflow-y-auto">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">
            {{ editingUser() ? 'Edit User' : 'Create New User' }}
          </h3>

          <form [formGroup]="userForm" (ngSubmit)="submitForm()" class="space-y-4">
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                id="email"
                type="email"
                formControlName="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="user@example.com"
              />
              <p *ngIf="userForm.get('email')?.hasError('email') && userForm.get('email')?.touched"
                 class="text-red-500 text-sm mt-1">
                Please enter a valid email
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <input type="checkbox" formControlName="enabled" class="mr-2" />
                Enabled
              </label>
            </div>

            <div>
              <label for="roles" class="block text-sm font-medium text-gray-700 mb-1">Roles</label>
              <input
                id="roles"
                type="text"
                formControlName="roles"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Comma-separated roles (e.g., ADMIN, USER)"
              />
            </div>

            <div class="flex gap-4 mt-6">
              <button
                type="submit"
                [disabled]="userForm.invalid || isSubmitting()"
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
export class UsersComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users = signal<User[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  showModal = signal(false);
  editingUser = signal<User | null>(null);

  userForm: FormGroup;

  constructor() {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      enabled: [true],
      roles: ['USER']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Failed to load users:', error);
        this.errorMessage.set('Failed to load users');
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal(): void {
    this.editingUser.set(null);
    this.userForm.reset({ enabled: true, roles: 'USER' });
    this.showModal.set(true);
  }

  openEditModal(user: User): void {
    this.editingUser.set(user);
    this.userForm.patchValue({
      email: user.email,
      enabled: user.enabled,
      roles: Array.from(user.roles).join(', ')
    });
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  submitForm(): void {
    if (this.userForm.invalid) return;

    this.isSubmitting.set(true);
    const formValue = this.userForm.value;
    const roles: Set<string> = new Set(
      formValue.roles
        .split(',')
        .map((r: string) => r.trim())
        .filter((r: string) => r.length > 0)
    );

    const userData = {
      email: formValue.email,
      enabled: formValue.enabled,
      roles: roles
    };

    const request = this.editingUser()
      ? this.userService.updateUser(this.editingUser()!.id, userData)
      : this.userService.createUser(userData);

    request.subscribe({
      next: () => {
        this.loadUsers();
        this.closeModal();
      },
      error: (error) => {
        console.error('Failed to save user:', error);
        this.errorMessage.set('Failed to save user');
        this.isSubmitting.set(false);
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.loadUsers();
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          this.errorMessage.set('Failed to delete user');
        }
      });
    }
  }

  Array = Array;
}
