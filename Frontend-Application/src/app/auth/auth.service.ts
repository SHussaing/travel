import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import type { AdminLoginRequest, AdminLoginResponse } from './auth.types';
import { getToken } from './token.storage';
import { isJwtExpired } from './jwt.util';
import { AuthState } from './auth.state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly state: AuthState
  ) {}

  async loginAdmin(req: AdminLoginRequest): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AdminLoginResponse>('/auth/admin/login', req)
    );

    this.state.setToken(res.token);
  }

  logout(): void {
    this.state.clear();
  }

  getToken(): string | null {
    return getToken();
  }

  isLoggedIn(): boolean {
    const token = getToken();
    if (!token) return false;
    return !isJwtExpired(token);
  }
}
