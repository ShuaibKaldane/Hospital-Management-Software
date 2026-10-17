import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { PatientReport } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly api = inject(ApiService);

  myReports(): Observable<PatientReport[]> {
    return this.api.get<PatientReport[]>('/patient/reports');
  }

  upload(appointmentId: number, reportName: string, file: File): Observable<PatientReport> {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('appointment_id', String(appointmentId));
    fd.append('report_name', reportName);
    return this.api.postForm<PatientReport>('/patient/reports', fd);
  }
}