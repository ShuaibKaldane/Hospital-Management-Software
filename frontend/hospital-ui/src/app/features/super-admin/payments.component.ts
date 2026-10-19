import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { SuperAdminService, SuperAdminPayment } from '../../core/services/super-admin.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-super-admin-payments',
  standalone: true,
  imports: [CommonModule, DecimalPipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header
      title="Payments"
      subtitle="Platform-wide payment transactions and revenue.">
    </app-page-header>

    <div class="grid grid-3 mb-24">
      <div class="card stat-tile">
        <div class="stat-label">Total revenue</div>
        <div class="stat-value">₹ {{ totalRevenue() | number:'1.0-2' }}</div>
        <div class="stat-sub">{{ paidCount() }} paid · {{ pendingCount() }} pending</div>
      </div>
      <div class="card stat-tile">
        <div class="stat-label">Paid transactions</div>
        <div class="stat-value">{{ paidCount() }}</div>
      </div>
      <div class="card stat-tile">
        <div class="stat-label">Refunded / failed</div>
        <div class="stat-value">{{ refundedCount() + failedCount() }}</div>
      </div>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="payments().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Hospital</th>
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
              <td>{{ p.id }}</td>
              <td>{{ p.hospital_name || '—' }}</td>
              <td>{{ p.patient_name }}</td>
              <td>{{ p.doctor_name }}</td>
              <td>{{ p.payment_method }}</td>
              <td>₹ {{ p.amount }}</td>
              <td><span class="badge" [class]="badgeFor(p.payment_status)">{{ p.payment_status }}</span></td>
              <td>{{ p.paid_at ? (p.paid_at | date:'medium') : '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyTpl>
        <app-empty-state title="No payments yet" message="Payments made by patients will appear here."></app-empty-state>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .stat-tile { padding: 18px 20px; }
    .stat-label { font-size: 12px; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 700; }
    .stat-value { font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: var(--color-text); margin: 4px 0; }
    .stat-sub   { font-size: 12.5px; color: var(--color-text-subtle); }
  `]
})
export class SuperAdminPaymentsComponent implements OnInit {
  private readonly api = inject(SuperAdminService);

  readonly payments = signal<SuperAdminPayment[]>([]);
  readonly loading = signal(true);

  readonly paidCount     = computed(() => this.payments().filter(p => p.payment_status === 'Paid').length);
  readonly pendingCount  = computed(() => this.payments().filter(p => p.payment_status === 'Pending').length);
  readonly refundedCount = computed(() => this.payments().filter(p => p.payment_status === 'Refunded').length);
  readonly failedCount   = computed(() => this.payments().filter(p => p.payment_status === 'Failed').length);
  readonly totalRevenue  = computed(() =>
    this.payments()
      .filter(p => p.payment_status === 'Paid')
      .reduce((sum, p) => sum + Number(p.amount || 0), 0)
  );

  ngOnInit(): void {
    this.api.listPayments().subscribe({
      next: rows => { this.payments.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  badgeFor(status: string): string {
    return ({
      Paid: 'badge-success',
      Pending: 'badge-warning',
      Failed: 'badge-danger',
      Refunded: 'badge-info'
    } as Record<string, string>)[status] || 'badge-neutral';
  }
}
