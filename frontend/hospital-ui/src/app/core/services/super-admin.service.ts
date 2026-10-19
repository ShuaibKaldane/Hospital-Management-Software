import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Hospital {
  id: number;
  name: string;
  city?: string;
  address?: string;
  phone?: string;
  admin_user_id?: number;
  admin_email?: string;
  admin_name?: string;
  plan: string;
  trial: number | boolean;
  trial_expires_at?: string | null;
  subscription_expires_at?: string | null;
  days_left?: number | null;
  created_at: string;
}

export interface PlatformStats {
  hospitals: { total: number; on_trial: number | null; paid: number | null };
  users: { role: string; count: number }[];
  revenue: { total_revenue: string; total_transactions: number };
  appointments: { status: string; count: number }[];
}

export interface SuperAdminDoctor {
  user_id: number;
  name: string;
  email: string;
  status: string;
  hospital_id: number | null;
  hospital_name: string | null;
  category_id: number;
  category_name: string;
  qualification: string;
  experience: number;
  consultation_fee: string;
  phone?: string;
  created_at: string;
}

export interface SuperAdminPatient {
  user_id: number;
  name: string;
  email: string;
  status: string;
  hospital_id: number | null;
  hospital_name: string | null;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  phone?: string;
  created_at: string;
}

export interface SuperAdminPayment {
  id: number;
  appointment_id: number;
  patient_id: number;
  doctor_id: number;
  hospital_id: number | null;
  hospital_name: string | null;
  amount: string;
  payment_method: string;
  payment_status: string;
  paid_at: string | null;
  patient_name: string;
  doctor_name: string;
}

@Injectable({ providedIn: 'root' })
export class SuperAdminService {
  private readonly api = inject(ApiService);

  getDashboard(): Observable<PlatformStats> {
    return this.api.get<PlatformStats>('/super-admin/dashboard');
  }

  listHospitals(filters?: { search?: string; plan?: string }): Observable<Hospital[]> {
    return this.api.get<Hospital[]>('/super-admin/hospitals', filters);
  }

  addHospital(payload: {
    hospitalName: string;
    adminName: string;
    adminEmail: string;
    password?: string;
    phone: string;
    city: string;
    address?: string;
    plan?: string;
    days?: number;
  }): Observable<Hospital & { adminPassword: string; adminEmail: string }> {
    return this.api.post<any>('/super-admin/hospitals', payload);
  }

  updatePlan(id: number, payload: { plan: string; days: number }): Observable<Hospital> {
    return this.api.put<Hospital>(`/super-admin/hospitals/${id}/plan`, payload);
  }

  removeHospital(id: number): Observable<{ id: number }> {
    return this.api.delete<{ id: number }>(`/super-admin/hospitals/${id}`);
  }

  listDoctors(filters?: { search?: string; status?: string; hospital_id?: number }): Observable<SuperAdminDoctor[]> {
    return this.api.get<SuperAdminDoctor[]>('/super-admin/doctors', filters);
  }

  listPatients(filters?: { search?: string; status?: string; hospital_id?: number }): Observable<SuperAdminPatient[]> {
    return this.api.get<SuperAdminPatient[]>('/super-admin/patients', filters);
  }

  listPayments(filters?: { hospital_id?: number }): Observable<SuperAdminPayment[]> {
    return this.api.get<SuperAdminPayment[]>('/super-admin/payments', filters);
  }
}
