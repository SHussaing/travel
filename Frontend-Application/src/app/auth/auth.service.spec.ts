import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { AuthService } from './auth.service';
import { AuthState } from './auth.state';

describe('AuthService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService, AuthState]
    });
  });

  it('loginAdmin stores token via AuthState', async () => {
    const auth = TestBed.inject(AuthService);
    const state = TestBed.inject(AuthState);
    const httpMock = TestBed.inject(HttpTestingController);

    const promise = auth.loginAdmin({ username: 'admin', password: 'admin123' });

    const req = httpMock.expectOne('/auth/admin/login');
    expect(req.request.method).toBe('POST');

    req.flush({ token: 'a.b.c' });

    await promise;

    expect(state.token()).toBe('a.b.c');
  });

  it('logout clears state', () => {
    const auth = TestBed.inject(AuthService);
    const state = TestBed.inject(AuthState);

    state.setToken('a.b.c');
    auth.logout();

    expect(state.token()).toBeNull();
  });
});
