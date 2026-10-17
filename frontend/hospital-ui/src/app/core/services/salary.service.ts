import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { EarningsSummary, SalaryTransaction, SalaryTxnType } from '../models/salary.model';

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private readonly api = inject(ApiService);

  // Admin
  addTransaction(payload: { doctor_id: number; amount: number; transaction_type: SalaryTxnType; reason?: string }): Observable<SalaryTransaction> {
    return this.api.post<SalaryTransaction>('/admin/salary', payload);
  }

  allTransactions(): Observable<SalaryTransaction[]> {
    return this.api.get<SalaryTransaction[]>('/admin/salary');
  }

  // Doctor
  myEarnings(): Observable<EarningsSummary> {
    return this.api.get<EarningsSummary>('/doctor/earnings');
  }

  myTransactions(): Observable<SalaryTransaction[]> {
    return this.api.get<SalaryTransaction[]>('/doctor/salary');
  }
}