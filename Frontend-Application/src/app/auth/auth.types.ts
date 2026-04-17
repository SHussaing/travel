export type Role = 'ADMIN' | 'USER' | string;

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  expiresAt?: string;
}

