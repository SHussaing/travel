import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: Router,
          useValue: { navigate: vi.fn() }
        }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    // Clear localStorage
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeDefined();
  });

  it('should store and retrieve token', () => {
    expect(service.hasToken()).toBe(false);
    
    service.login('admin', 'admin123').subscribe(() => {
      expect(service.getToken()).toBe('test-token');
      expect(service.authState().isAuthenticated).toBe(true);
    });

    const req = httpMock.expectOne('/auth/admin/login');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'test-token',
      tokenType: 'Bearer'
    });
  });

  it('should logout and clear token', () => {
    localStorage.setItem('auth_token', 'test-token');
    localStorage.setItem('auth_username', 'admin');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.authState().isAuthenticated).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should check if token exists', () => {
    expect(service.hasToken()).toBe(false);
    localStorage.setItem('auth_token', 'test-token');
    expect(service.hasToken()).toBe(true);
  });
});
