export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  data?: { token?: string; user?: User };
}

export interface StoredAuth {
  token: string;
  user: User;
}