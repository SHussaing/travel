import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed bottom-4 right-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      <div
        *ngFor="let t of toastService.toasts()"
        class="rounded-lg border bg-white p-3 text-sm shadow"
        [class.border-red-300]="t.type === 'error'"
        [class.border-emerald-300]="t.type === 'success'"
        [class.border-slate-200]="t.type === 'info'"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="font-medium" [class.text-red-700]="t.type==='error'" [class.text-emerald-700]="t.type==='success'">
            {{ t.type.toUpperCase() }}
          </div>
          <button class="rounded-md border px-2 py-0.5 text-xs" (click)="toastService.dismiss(t.id)">Close</button>
        </div>
        <div class="mt-1 text-slate-700">{{ t.message }}</div>
      </div>
    </div>
  `
})
export class ToastHostComponent {
  readonly toastService = inject(ToastService);
}

