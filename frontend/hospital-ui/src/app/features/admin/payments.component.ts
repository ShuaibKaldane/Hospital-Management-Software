import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { Payment } from '../../core/models/payment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-all-payments',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Payments" subtitle="All transactions across the platform."></app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="card mb-16" *ngIf="totals()">
        <div class="grid grid-3">
          <div><div class="text-subtle" style="font-size:12px;text-transform:uppercase">Total collected</div><div class="amount">₹ {{ totals()!.collected | number:'1.0-0' }}</div></div>
          <div><div class="text-subtle" style="font-size:12px;text-transform:uppercase">Pending</div><div class="amount" style="color:var(--color-warning)">₹ {{ totals()!.pending | number:'1.0-0' }}</div></div>
          <div><div class="text-subtle" style="font-size:12px;text-transform:uppercase">Refunded</div><div class="amount" style="color:var(--color-danger)">₹ {{ totals()!.refunded | number:'1.0-0' }}</div></div>
        </div>
      </div>

      <div class="table-wrapper" *ngIf="payments().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Paid at</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of payments()">
              <td>{{ p.patient_name }}</td>
              <td>{{ p.doctor_name }}</td>
              <td>{{ p.payment_method }}</td>
              <td class="font-bold">₹ {{ p.amount | number:'1.0-0' }}</td>
              <td><span class="badge" [class]="badgeFor(p.payment_status)">{{ p.payment_status }}</span></td>
              <td class="text-muted">{{ p.paid_at ? (p.paid_at | date:'medium') : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No payments yet" message="Payments will appear here as patients pay their consultation fees."></app-empty-state>
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
export class AllPaymentsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  readonly payments = signal<Payment[]>([]);
  readonly loading  = signal(true);

  ngOnInit(): void {
    this.admin.listPayments().subscribe({
      next: ps => { this.payments.set(ps); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  totals() {
    const ps = this.payments();
    if (!ps.length) return null;
    return {
      collected: ps.filter(p => p.payment_status === 'Paid').reduce((s, p) => s + Number(p.amount), 0),
      pending:   ps.filter(p => p.payment_status === 'Pending').reduce((s, p) => s + Number(p.amount), 0),
      refunded:  ps.filter(p => p.payment_status === 'Refunded').reduce((s, p) => s + Number(p.amount), 0)
    };
  }

  badgeFor(status: string): string {
    return ({
      'Paid': 'badge-success',
      'Pending': 'badge-warning',
      'Failed': 'badge-danger',
      'Refunded': 'badge-neutral'
    } as Record<string, string>)[status] || 'badge-neutral';
  }
}