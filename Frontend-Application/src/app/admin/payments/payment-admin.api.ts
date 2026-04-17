import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { PaymentMethodDto, UpsertPaymentMethodRequest } from './payment-admin.types';

@Injectable({ providedIn: 'root' })
export class PaymentAdminApi {
  private readonly http = inject(HttpClient);

  list(): Promise<PaymentMethodDto[]> {
    return firstValueFrom(this.http.get<PaymentMethodDto[]>('/payment/admin/methods'));
  }

  create(req: UpsertPaymentMethodRequest): Promise<PaymentMethodDto> {
    return firstValueFrom(this.http.post<PaymentMethodDto>('/payment/admin/methods', req));
  }

  update(id: string, req: UpsertPaymentMethodRequest): Promise<PaymentMethodDto> {
    return firstValueFrom(this.http.put<PaymentMethodDto>(`/payment/admin/methods/${id}`, req));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/payment/admin/methods/${id}`));
  }
}

