import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DoctorCategory } from '../models/doctor.model';
import { DoctorProfile } from '../models/doctor.model';
import { Appointment, AppointmentStatus } from '../models/appointment.model';
import { AdminDashboardStats } from '../models/admin-stats.model';
import { Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  // Dashboard
  getDashboard(): Observable<AdminDashboardStats> {
    return this.api.get<AdminDashboardStats>('/admin/dashboard');
  }

  // Doctors
  listDoctors(filters?: { status?: string; category_id?: number; search?: string; limit?: number; offset?: number }): Observable<DoctorProfile[]> {
    return this.api.get<DoctorProfile[]>('/admin/doctors', filters);
  }

  approveDoctor(id: number): Observable<{ id: number; status: string }> {
    return this.api.put<{ id: number; status: string }>(`/admin/doctors/${id}/approve`, {});
  }

  blockDoctor(id: number): Observable<{ id: number; status: string }> {
    return this.api.put<{ id: number; status: string }>(`/admin/doctors/${id}/block`, {});
  }

  // Categories
  listCategories(): Observable<DoctorCategory[]> {
    return this.api.get<DoctorCategory[]>('/doctor-categories');
  }

  createCategory(payload: { category_name: string; description?: string }): Observable<DoctorCategory> {
    return this.api.post<DoctorCategory>('/doctor-categories', payload);
  }

  updateCategory(id: number, payload: { category_name: string; description?: string }): Observable<DoctorCategory> {
    return this.api.put<DoctorCategory>(`/doctor-categories/${id}`, payload);
  }

  deleteCategory(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(`/doctor-categories/${id}`);
  }

  // Appointments
  listAppointments(filters?: { status?: AppointmentStatus; date?: string }): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/admin/appointments', filters);
  }

  updateAppointmentStatus(id: number, status: AppointmentStatus): Observable<Appointment> {
    return this.api.put<Appointment>(`/admin/appointments/${id}/status`, { status });
  }

  // Payments
  listPayments(): Observable<Payment[]> {
    return this.api.get<Payment[]>('/admin/payments');
  }
}