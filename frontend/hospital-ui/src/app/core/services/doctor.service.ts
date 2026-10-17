import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { DoctorCategory, DoctorProfile } from '../models/doctor.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly api = inject(ApiService);

  listCategories(): Observable<DoctorCategory[]> {
    return this.api.get<DoctorCategory[]>('/doctor-categories');
  }

  listDoctors(filters?: { status?: string; category_id?: number; search?: string; limit?: number; offset?: number }): Observable<DoctorProfile[]> {
    return this.api.get<DoctorProfile[]>('/patient/doctors', filters);
  }

  getDoctor(id: number): Observable<DoctorProfile> {
    return this.api.get<DoctorProfile>(`/patient/doctors/${id}`);
  }

  getMyProfile(): Observable<DoctorProfile> {
    return this.api.get<DoctorProfile>('/doctor/profile');
  }

  updateMyProfile(payload: Partial<DoctorProfile>): Observable<DoctorProfile> {
    return this.api.put<DoctorProfile>('/doctor/profile', payload);
  }
}