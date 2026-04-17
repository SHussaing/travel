import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { PlaceDto, UpsertPlaceRequest } from './graph-admin.types';

@Injectable({ providedIn: 'root' })
export class GraphAdminApi {
  private readonly http = inject(HttpClient);

  list(): Promise<PlaceDto[]> {
    return firstValueFrom(this.http.get<PlaceDto[]>('/graph/admin/places'));
  }

  create(req: UpsertPlaceRequest): Promise<PlaceDto> {
    return firstValueFrom(this.http.post<PlaceDto>('/graph/admin/places', req));
  }

  update(id: string, req: UpsertPlaceRequest): Promise<PlaceDto> {
    return firstValueFrom(this.http.put<PlaceDto>(`/graph/admin/places/${id}`, req));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/graph/admin/places/${id}`));
  }
}

