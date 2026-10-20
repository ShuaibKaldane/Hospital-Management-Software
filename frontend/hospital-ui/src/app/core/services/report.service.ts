import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { TokenService } from './token.service';
import { PatientReport } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api    = inject(ApiService);
  private readonly tokens = inject(TokenService);

  private myPrefix(): string {
    const role = this.tokens.getRole();
    if (role === 'DOCTOR') return '/doctor';
    if (role === 'ADMIN')  return '/admin';
    return '/patient';
  }

  /** Patient uploads; doctor/admin list. */
  myReports(): Observable<PatientReport[]> {
    return this.api.get<PatientReport[]>(`${this.myPrefix()}/reports`);
  }

  /** Patient-only upload. */
  upload(appointmentId: number, reportName: string, file: File): Observable<PatientReport> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('appointment_id', String(appointmentId));
    fd.append('report_name', reportName);
    return this.api.postForm<PatientReport>('/patient/reports', fd);
  }
}