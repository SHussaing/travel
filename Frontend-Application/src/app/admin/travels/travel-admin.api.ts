import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { TravelDto, UpsertTravelRequest } from './travel-admin.types';

@Injectable({ providedIn: 'root' })
export class TravelAdminApi {
  private readonly http = inject(HttpClient);

  list(): Promise<TravelDto[]> {
    return firstValueFrom(this.http.get<TravelDto[]>('/travel/admin/travels'));
  }

  create(req: UpsertTravelRequest): Promise<TravelDto> {
    return firstValueFrom(this.http.post<TravelDto>('/travel/admin/travels', req));
  }

  update(id: string, req: UpsertTravelRequest): Promise<TravelDto> {
    return firstValueFrom(this.http.put<TravelDto>(`/travel/admin/travels/${id}`, req));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/travel/admin/travels/${id}`));
  }
}

