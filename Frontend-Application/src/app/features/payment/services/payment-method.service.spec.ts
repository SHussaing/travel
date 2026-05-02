import { describe, it, expect, beforeEach } from 'vitest';
import { PaymentMethodService } from './payment-method.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PaymentMethod } from '../../../shared/models/entities.model';

describe('PaymentMethodService', () => {
  let service: PaymentMethodService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PaymentMethodService]
    });

    service = TestBed.inject(PaymentMethodService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should get payment methods', () => {
    const mockMethods: PaymentMethod[] = [
      {
        id: '1',
        provider: 'STRIPE',
        displayName: 'Primary Stripe',
        enabled: true,
        configuration: 'sk_live_xxx'
      }
    ];

    service.getPaymentMethods().subscribe(methods => {
      expect(methods.length).toBe(1);
      expect(methods[0].provider).toBe('STRIPE');
    });

    const req = httpMock.expectOne('/payment/admin/methods');
    expect(req.request.method).toBe('GET');
    req.flush(mockMethods);
  });

  it('should create payment method', () => {
    const newMethod = {
      provider: 'PAYPAL',
      displayName: 'PayPal Account',
      enabled: true,
      configuration: 'paypal_config'
    };

    service.createPaymentMethod(newMethod).subscribe(method => {
      expect(method.id).toBe('1');
      expect(method.provider).toBe('PAYPAL');
    });

    const req = httpMock.expectOne('/payment/admin/methods');
    expect(req.request.method).toBe('POST');
    req.flush({ id: '1', ...newMethod });
  });

  it('should update payment method', () => {
    const updateData = {
      provider: 'STRIPE',
      displayName: 'Updated Stripe',
      enabled: false,
      configuration: 'sk_live_updated'
    };

    service.updatePaymentMethod('1', updateData).subscribe(method => {
      expect(method.displayName).toBe('Updated Stripe');
    });

    const req = httpMock.expectOne('/payment/admin/methods/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ id: '1', ...updateData });
  });

  it('should delete payment method', () => {
    service.deletePaymentMethod('1').subscribe(() => {
      expect(true).toBe(true);
    });

    const req = httpMock.expectOne('/payment/admin/methods/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
