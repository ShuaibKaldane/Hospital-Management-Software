import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { SalaryService } from '../../core/services/salary.service';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorProfile } from '../../core/models/doctor.model';
import { SalaryTransaction } from '../../core/models/salary.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-salary-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Salary &amp; bonuses" subtitle="Issue payments to doctors and track payouts."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <section class="card">
        <h3 class="card-title mb-16">New transaction</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">Doctor</label>
            <select class="form-control" formControlName="doctor_id">
              <option value="">Select doctor</option>
              <option *ngFor="let d of doctors" [value]="d.user_id">{{ d.name }} · {{ d.category_name }}</option>
            </select>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select class="form-control" formControlName="transaction_type">
                <option value="Salary">Salary</option>
                <option value="Bonus">Bonus</option>
                <option value="Deduction">Deduction</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Amount (₹)</label>
              <input class="form-control" type="number" min="0" formControlName="amount">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Reason / note</label>
            <input class="form-control" formControlName="reason" placeholder="e.g. October salary, performance bonus…">
          </div>
          <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="loading() || form.invalid">
            <span *ngIf="!loading()">Record transaction</span>
            <span *ngIf="loading()">Saving…</span>
          </button>
        </form>
      </section>

      <section>
        <ng-container *ngIf="!initialLoading(); else loadingTpl">
          <div class="table-wrapper" *ngIf="transactions().length; else emptyTpl">
            <table class="data-table">
              <thead>
                <tr><th>Date</th><th>Doctor</th><th>Type</th><th class="text-right">Amount</th><th>Reason</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let t of transactions()">
                  <td class="text-muted">{{ t.created_at | date:'mediumDate' }}</td>
                  <td class="font-bold">{{ t.doctor_name }}</td>
                  <td><span class="badge" [class]="badgeFor(t.transaction_type)">{{ t.transaction_type }}</span></td>
                  <td class="text-right font-bold" [class.negative]="t.transaction_type === 'Deduction'">
                    {{ t.transaction_type === 'Deduction' ? '-' : '+' }} ₹ {{ t.amount | number:'1.0-0' }}
                  </td>
                  <td class="text-muted">{{ t.reason || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #emptyTpl>
            <div class="card">
              <app-empty-state title="No transactions yet" message="Record your first salary, bonus or deduction to get started."></app-empty-state>
            </div>
          </ng-template>
        </ng-container>
        <ng-template #loadingTpl><app-loading></app-loading></ng-template>
      </section>
    </div>
  </div>
  `,
  styles: [`
    .negative { color: var(--color-danger); }
  `]
})
export class SalaryManagementComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly admin = inject(AdminService);
  private readonly salary = inject(SalaryService);
  private readonly docs   = inject(DoctorService);

  readonly transactions  = signal<SalaryTransaction[]>([]);
  readonly loading       = signal(false);
  readonly initialLoading = signal(true);
  readonly error         = signal<string | null>(null);
  doctors: DoctorProfile[] = [];

  form: FormGroup = this.fb.group({
    doctor_id:        ['', Validators.required],
    transaction_type: ['Salary', Validators.required],
    amount:           [0, [Validators.required, Validators.min(0)]],
    reason:           ['']
  });

  ngOnInit(): void {
    this.admin.listDoctors({ status: 'ACTIVE', limit: 100 }).subscribe(ds => this.doctors = ds);
    this.refresh();
  }

  refresh(): void {
    this.salary.allTransactions().subscribe({
      next: ts => { this.transactions.set(ts); this.initialLoading.set(false); },
      error: () => this.initialLoading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.loading.set(true);
    this.error.set(null);
    this.salary.addTransaction({
      doctor_id: Number(this.form.value['doctor_id']),
      transaction_type: this.form.value['transaction_type'] as any,
      amount: Number(this.form.value['amount']),
      reason: this.form.value['reason']
    }).subscribe({
      next: () => { this.form.reset({ transaction_type: 'Salary', amount: 0 }); this.loading.set(false); this.refresh(); },
      error: (err) => { this.loading.set(false); this.error.set(err?.message || 'Failed to record.'); }
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