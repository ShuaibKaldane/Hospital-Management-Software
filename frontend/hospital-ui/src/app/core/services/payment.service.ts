import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Payment, PaymentStatus } from '../models/payment.model';

interface MakePayment {
  appointment_id: number;
  payment_method: string;
  amount?: number;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly api = inject(ApiService);

  // Patient
  pay(payload: MakePayment): Observable<Payment> {
    return this.api.post<Payment>('/patient/payments', payload);
  }

  myPayments(): Observable<Payment[]> {
    return this.api.get<Payment[]>('/patient/payments');
  }

  // Admin
  updateStatus(id: number, payment_status: PaymentStatus): Observable<{ id: number; payment_status: PaymentStatus }> {
    return this.api.put<{ id: number; payment_status: PaymentStatus }>(`/admin/payments/${id}/status`, { payment_status });
  }
}