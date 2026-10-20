import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly api    = inject(ApiService);
  private readonly tokens = inject(TokenService);

  private myPrefix(): string {
    const role = this.tokens.getRole();
    if (role === 'DOCTOR') return '/doctor';
    if (role === 'ADMIN')  return '/admin';
    return '/patient';
  }

  // Patient
  book(payload: { doctor_id: number; appointment_date: string; appointment_time: string }): Observable<Appointment> {
    return this.api.post<Appointment>('/patient/appointments', payload);
  }

  // Routes to the right role's endpoint based on the current session.
  myAppointments(status?: AppointmentStatus): Observable<Appointment[]> {
    return this.api.get<Appointment[]>(`${this.myPrefix()}/appointments`, status ? { status } : undefined);
  }

  // Admin
  allAppointments(filters?: { status?: AppointmentStatus; date?: string }): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/admin/appointments', filters);
  }

  updateStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    return this.api.put<Appointment>(`${this.myPrefix()}/appointments/${id}/status`, { status });
  }
}