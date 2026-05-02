import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentMethod } from '../../../shared/models/entities.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodService {
  private baseUrl = '/payment/admin/methods';

  constructor(private http: HttpClient) {}

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return this.http.get<PaymentMethod[]>(this.baseUrl);
  }

  createPaymentMethod(method: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    return this.http.post<PaymentMethod>(this.baseUrl, method);
  }

  updatePaymentMethod(id: string, method: Omit<PaymentMethod, 'id'>): Observable<PaymentMethod> {
    return this.http.put<PaymentMethod>(`${this.baseUrl}/${id}`, method);
  }

  deletePaymentMethod(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
