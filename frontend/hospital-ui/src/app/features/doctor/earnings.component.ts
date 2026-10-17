import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { SalaryService } from '../../core/services/salary.service';
import { EarningsSummary, SalaryTransaction } from '../../core/models/salary.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-doctor-earnings',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, PageHeaderComponent, StatCardComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Earnings &amp; salary" subtitle="Your consultation earnings and salary transactions."></app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="grid grid-3 mb-24">
        <app-stat-card label="Net earnings" [value]="(earnings()?.net ?? 0) | number:'1.0-0'" accent="#059669" trend="Salary + bonus − deductions" [icon]="iconUp"></app-stat-card>
        <app-stat-card label="Credits" [value]="(earnings()?.credits ?? 0) | number:'1.0-0'" accent="#0E7490" trend="Salary + bonus" [icon]="iconPlus"></app-stat-card>
        <app-stat-card label="Deductions" [value]="(earnings()?.debits ?? 0) | number:'1.0-0'" accent="#DC2626" trend="Adjustments" [icon]="iconDown"></app-stat-card>
      </div>

      <section class="card">
        <h3 class="card-title mb-16">Transaction history</h3>
        <div class="table-wrapper" *ngIf="transactions().length; else emptyTpl" style="border:none;box-shadow:none">
          <table class="data-table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Reason</th><th class="text-right">Amount</th></tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of transactions()">
                <td class="text-muted">{{ t.created_at | date:'mediumDate' }}</td>
                <td><span class="badge" [class]="badgeFor(t.transaction_type)">{{ t.transaction_type }}</span></td>
                <td class="text-muted">{{ t.reason || '—' }}</td>
                <td class="text-right font-bold" [class.negative]="t.transaction_type === 'Deduction'">
                  {{ t.transaction_type === 'Deduction' ? '-' : '+' }} ₹ {{ t.amount | number:'1.0-0' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <ng-template #emptyTpl>
          <app-empty-state title="No transactions yet" message="Your salary, bonus and deduction entries will show up here."></app-empty-state>
        </ng-template>
      </section>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .negative { color: var(--color-danger); }
  `]
})
export class DoctorEarningsComponent implements OnInit {
  private readonly salary = inject(SalaryService);

  readonly earnings     = signal<EarningsSummary | null>(null);
  readonly transactions = signal<SalaryTransaction[]>([]);
  readonly loading      = signal(true);

  readonly iconUp   = '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
  readonly iconDown = '<svg viewBox="0 0 24 24"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>';
  readonly iconPlus = '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';

  ngOnInit(): void {
    let done = 0;
    const checkDone = () => { if (++done === 2) this.loading.set(false); };
    this.salary.myEarnings().subscribe({
      next: e => { this.earnings.set(e); checkDone(); },
      error: () => checkDone()
    });
    this.salary.myTransactions().subscribe({
      next: t => { this.transactions.set(t); checkDone(); },
      error: () => checkDone()
    });
  }

  badgeFor(type: string): string {
    return ({
      'Salary': 'badge-primary',
      'Bonus': 'badge-success',
      'Deduction': 'badge-danger'
    } as Record<string, string>)[type] || 'badge-neutral';
  }
}