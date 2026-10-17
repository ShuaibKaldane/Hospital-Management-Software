import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PatientProfile } from '../models/patient.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly api = inject(ApiService);

  getMyProfile(): Observable<PatientProfile> {
    return this.api.get<PatientProfile>('/patient/profile');
  }

  updateMyProfile(payload: Partial<PatientProfile>): Observable<PatientProfile> {
    return this.api.put<PatientProfile>('/patient/profile', payload);
  }
}