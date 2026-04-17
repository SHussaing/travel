import { Injectable, signal } from '@angular/core';

import { clearToken, getToken, setToken } from './token.storage';
import { parseJwt } from './jwt.util';

@Injectable({ providedIn: 'root' })
export class AuthState {
  readonly token = signal<string | null>(getToken());
  readonly subject = signal<string | null>(parseJwt(getToken() ?? '')?.sub ?? null);

  setToken(token: string): void {
    setToken(token);
    this.token.set(token);
    this.subject.set(parseJwt(token)?.sub ?? null);
  }

  clear(): void {
    clearToken();
    this.token.set(null);
    this.subject.set(null);
  }
}

