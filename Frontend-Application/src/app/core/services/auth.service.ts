import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  tokenType: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  username: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USERNAME_KEY = 'auth_username';

  authState = signal<AuthState>({
    isAuthenticated: this.hasToken(),
    token: this.getToken(),
    username: this.getUsername()
  });

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(username: string, password: string): Observable<TokenResponse> {
    return this.http.post<TokenResponse>('/auth/admin/login', {
      username,
      password
    }).pipe(
      tap(response => {
        this.setToken(response.token);
        this.setUsername(username);
        this.authState.set({
          isAuthenticated: true,
          token: response.token,
          username: username
        });
      })
    );
  }

  logout(): void {
    this.clearToken();
    this.clearUsername();
    this.authState.set({
      isAuthenticated: false,
      token: null,
      username: null
    });
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private getUsername(): string | null {
    return localStorage.getItem(this.USERNAME_KEY);
  }

  private setUsername(username: string): void {
    localStorage.setItem(this.USERNAME_KEY, username);
  }

  private clearUsername(): void {
    localStorage.removeItem(this.USERNAME_KEY);
  }
}
