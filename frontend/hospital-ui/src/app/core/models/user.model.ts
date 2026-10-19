export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'BLOCKED';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  hospital_id?: number | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  data?: { token?: string; user?: User };
  status?: number;
}

export interface StoredAuth {
  token: string;
  user: User;
}
