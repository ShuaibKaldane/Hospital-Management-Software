import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Appointment, AppointmentStatus } from '../models/appointment.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly api = inject(ApiService);

  // Patient
  book(payload: { doctor_id: number; appointment_date: string; appointment_time: string }): Observable<Appointment> {
    return this.api.post<Appointment>('/patient/appointments', payload);
  }

  // Patient or doctor — backend decides based on JWT role
  myAppointments(status?: AppointmentStatus): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/patient/appointments', status ? { status } : undefined);
  }

  // Admin
  allAppointments(filters?: { status?: AppointmentStatus; date?: string }): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/admin/appointments', filters);
  }

  updateStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    return this.api.put<Appointment>(`/patient/appointments/${id}/status`, { status });
  }
}