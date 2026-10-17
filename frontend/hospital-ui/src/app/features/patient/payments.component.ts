import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { PaymentService } from '../../core/services/payment.service';
import { Payment } from '../../core/models/payment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-patient-payments',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="My payments" subtitle="Your consultation payments and receipts."></app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="card mb-16" *ngIf="totalPaid() !== null">
        <div class="grid grid-3">
          <div>
            <div class="text-subtle" style="font-size:12px;text-transform:uppercase">Total paid</div>
            <div class="amount">₹ {{ totalPaid() | number:'1.0-0' }}</div>
          </div>
          <div>
            <div class="text-subtle" style="font-size:12px;text-transform:uppercase">Transactions</div>
            <div class="amount">{{ payments().length }}</div>
          </div>
          <div>
            <div class="text-subtle" style="font-size:12px;text-transform:uppercase">Last payment</div>
            <div class="amount" style="font-size:1.05rem">{{ lastPaidAt() | date:'mediumDate' }}</div>
          </div>
        </div>
      </div>

      <div class="table-wrapper" *ngIf="payments().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid at</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments()">
              <td class="font-bold">{{ p.doctor_name }}</td>
              <td>{{ p.payment_method }}</td>
              <td>₹ {{ p.amount | number:'1.0-0' }}</td>
              <td><span class="badge" [class]="badgeFor(p.payment_status)">{{ p.payment_status }}</span></td>
              <td class="text-muted">{{ p.paid_at | date:'medium' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No payments yet" message="After booking an appointment, your payment will show here."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .amount { font-family: var(--font-display); font-weight: 800; font-size: 1.4rem; color: var(--color-text); }
  `]
})
export class PatientPaymentsComponent implements OnInit {
  private readonly pay = inject(PaymentService);

  readonly payments = signal<Payment[]>([]);
  readonly loading  = signal(true);

  ngOnInit(): void {
    this.pay.myPayments().subscribe({
      next: ps => { this.payments.set(ps); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  totalPaid(): number | null {
    return this.payments()
      .filter(p => p.payment_status === 'Paid')
      .reduce((s, p) => s + Number(p.amount), 0);
  }

  lastPaidAt(): string | null {
    const paid = this.payments().filter(p => p.paid_at);
    return paid.length ? paid[0].paid_at as string : null;
  }

  badgeFor(status: string): string {
    return ({ 'Paid': 'badge-success', 'Pending': 'badge-warning', 'Failed': 'badge-danger', 'Refunded': 'badge-neutral' } as Record<string, string>)[status] || 'badge-neutral';
  }
}