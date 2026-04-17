export type Role = 'ADMIN' | 'USER' | string;

export interface AdminUserDto {
  id: string;
  email: string;
  enabled: boolean;
  roles: Role[];
}

export interface UpsertUserRequest {
  email: string;
  enabled: boolean;
  roles: Role[];
}

