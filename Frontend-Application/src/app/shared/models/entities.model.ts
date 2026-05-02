export interface User {
  id: string;
  email: string;
  enabled: boolean;
  roles: Set<string>;
}

export interface Travel {
  id: string;
  destination: string;
  startDate: string; // ISO date format
  endDate: string;   // ISO date format
  durationDays: number;
  activities: string;
  accommodation: string;
  transportation: string;
}

export interface PaymentMethod {
  id: string;
  provider: string;
  displayName: string;
  enabled: boolean;
  configuration: string;
}
