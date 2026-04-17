import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { AdminUserDto, UpsertUserRequest } from './user-admin.types';

@Injectable({ providedIn: 'root' })
export class UserAdminApi {
  private readonly http = inject(HttpClient);

  list(): Promise<AdminUserDto[]> {
    return firstValueFrom(this.http.get<AdminUserDto[]>('/users/admin/users'));
  }

  create(req: UpsertUserRequest): Promise<AdminUserDto> {
    return firstValueFrom(this.http.post<AdminUserDto>('/users/admin/users', req));
  }

  update(id: string, req: UpsertUserRequest): Promise<AdminUserDto> {
    return firstValueFrom(this.http.put<AdminUserDto>(`/users/admin/users/${id}`, req));
  }

  async delete(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`/users/admin/users/${id}`));
  }
}

