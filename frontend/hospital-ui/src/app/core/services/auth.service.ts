import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { AuthResponse, User } from '../models/user.model';

interface LoginPayload  { email: string; password: string; }

interface DoctorSignup  extends LoginPayload {
  name: string;
  category_id: number;
  qualification: string;
  experience?: number;
  consultation_fee?: number;
  phone?: string;
  address?: string;
  hospital_id: number;
}

interface PatientSignup extends LoginPayload {
  name: string;
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
  blood_group?: string;
  phone?: string;
  address?: string;
  hospital_id: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api    = inject(ApiService);
  private readonly tokens = inject(TokenService);

  superAdminLogin(payload: LoginPayload): Observable<AuthResponse> {
    return this.post('/auth/super-admin/login', payload);
  }

  adminLogin(payload: LoginPayload): Observable<AuthResponse> {
    return this.post('/auth/admin/login', payload);
  }

  doctorLogin(payload: LoginPayload): Observable<AuthResponse> {
    return this.post('/auth/doctor/login', payload);
  }

  patientLogin(payload: LoginPayload): Observable<AuthResponse> {
    return this.post('/auth/patient/login', payload);
  }

  doctorSignup(payload: DoctorSignup): Observable<AuthResponse> {
    return this.post('/auth/doctor/signup', payload);
  }

  patientSignup(payload: PatientSignup): Observable<AuthResponse> {
    return this.post('/auth/patient/signup', payload);
  }

  logout(): void {
    this.tokens.clear();
  }

  /**
   * Some auth endpoints return { token, user } at the top level
   * (not inside `data`). We handle both shapes.
   */
  private post(path: string, payload: unknown): Observable<AuthResponse> {
    return this.api.post<AuthResponse>(path, payload).pipe(
      tap(res => {
        const token = (res as any).token ?? (res as any).data?.token;
        const user  = (res as any).user  ?? (res as any).data?.user;
        if (token && user) this.tokens.setSession(token, user as User);
      })
    );
  }
}
