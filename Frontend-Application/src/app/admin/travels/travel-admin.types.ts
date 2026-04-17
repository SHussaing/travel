export interface TravelDto {
  id: string;
  destination: string;
  startDate: string; // ISO
  endDate: string; // ISO
  durationDays: number;
  activities?: string | null;
  accommodation?: string | null;
  transportation?: string | null;
}

export interface UpsertTravelRequest {
  destination: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  activities?: string | null;
  accommodation?: string | null;
  transportation?: string | null;
}

