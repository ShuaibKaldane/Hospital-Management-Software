import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Prescription, Medicine } from '../models/prescription.model';

interface CreatePrescription {
  appointment_id: number;
  diagnosis: string;
  medicines: Medicine[];
  advice?: string;
}

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private readonly api = inject(ApiService);

  // Doctor
  create(payload: CreatePrescription): Observable<Prescription> {
    return this.api.post<Prescription>('/doctor/prescriptions', payload);
  }

  myPrescriptions(): Observable<Prescription[]> {
    return this.api.get<Prescription[]>('/doctor/prescriptions');
  }
}