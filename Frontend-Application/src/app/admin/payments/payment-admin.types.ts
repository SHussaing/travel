export interface PaymentMethodDto {
  id: string;
  provider: string;
  displayName: string;
  enabled: boolean;
  configuration?: string | null;
}

export interface UpsertPaymentMethodRequest {
  provider: string;
  displayName: string;
  enabled: boolean;
  configuration?: string | null;
}
