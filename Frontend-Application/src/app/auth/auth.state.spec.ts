import { describe, expect, it, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { AuthState } from './auth.state';

describe('AuthState', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('setToken stores token and exposes subject', () => {
    const state = TestBed.inject(AuthState);

    const token =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiJ9.signature';

    state.setToken(token);

    expect(localStorage.getItem('travel_admin_jwt')).toBe(token);
    expect(state.token()).toBe(token);
    expect(state.subject()).toBe('admin');
  });

  it('clear clears state and localStorage', () => {
    const state = TestBed.inject(AuthState);
    state.setToken('a.b.c');

    state.clear();

    expect(localStorage.getItem('travel_admin_jwt')).toBeNull();
    expect(state.token()).toBeNull();
    expect(state.subject()).toBeNull();
  });
});

