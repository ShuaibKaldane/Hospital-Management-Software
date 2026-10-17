import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { PatientReport } from '../../core/models/payment.model';
import { Appointment } from '../../core/models/appointment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-patient-reports',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="My reports" subtitle="Upload and access your medical reports."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <section class="card">
        <h3 class="card-title mb-16">Upload a new report</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">Appointment</label>
            <select class="form-control" formControlName="appointment_id">
              <option value="">Select appointment</option>
              <option *ngFor="let a of appointments()" [value]="a.id">
                {{ a.appointment_date }} · {{ a.doctor_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Report name</label>
            <input class="form-control" formControlName="report_name" placeholder="e.g. Blood test report">
          </div>
          <div class="form-group">
            <label class="form-label">File (PDF or image, max 5 MB)</label>
            <input class="form-control" type="file" (change)="onFile($event)" accept=".pdf,image/*">
          </div>
          <div class="alert alert-success" *ngIf="success()">Report uploaded.</div>
          <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="saving() || !file() || form.invalid">
            <span *ngIf="!saving()">Upload report</span>
            <span *ngIf="saving()">Uploading…</span>
          </button>
        </form>
      </section>

      <section>
        <h3 class="card-title mb-16">My reports</h3>
        <ng-container *ngIf="!loading(); else loadingTpl">
          <div class="grid grid-2" *ngIf="reports().length; else emptyTpl" style="grid-template-columns:1fr;gap:12px">
            <article class="report-card" *ngFor="let r of reports()">
              <div class="report-icon">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <div class="report-body">
                <div class="font-bold">{{ r.report_name }}</div>
                <div class="text-muted" style="font-size:12px">Shared with {{ r.doctor_name }}</div>
                <div class="text-subtle" style="font-size:11px">{{ r.uploaded_at | date:'medium' }}</div>
              </div>
              <a [href]="fileUrl(r)" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Open</a>
            </article>
          </div>
          <ng-template #emptyTpl>
            <div class="card">
              <app-empty-state title="No reports uploaded" message="Upload a PDF or image to share with your doctor."></app-empty-state>
            </div>
          </ng-template>
        </ng-container>
        <ng-template #loadingTpl><app-loading></app-loading></ng-template>
      </section>
    </div>
  </div>
  `,
  styles: [`
    .report-card {
      display: grid;
      grid-template-columns: 48px 1fr auto;
      gap: 14px; align-items: center;
      padding: 14px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    .report-icon {
      width: 44px; height: 44px;
      border-radius: var(--radius-md);
      background: var(--color-primary-soft);
      color: var(--color-primary-dark);
      display: inline-flex; align-items: center; justify-content: center;
    }
  `]
})
export class PatientReportsComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly rpts  = inject(ReportService);
  private readonly appts = inject(AppointmentService);

  readonly reports     = signal<PatientReport[]>([]);
  readonly appointments = signal<Appointment[]>([]);
  readonly loading     = signal(true);
  readonly saving      = signal(false);
  readonly success     = signal(false);
  readonly error       = signal<string | null>(null);
  readonly file        = signal<File | null>(null);

  form: FormGroup = this.fb.group({
    appointment_id: ['', Validators.required],
    report_name:    ['', Validators.required]
  });

  ngOnInit(): void {
    this.refresh();
    this.appts.myAppointments().subscribe(a => this.appointments.set(a));
  }

  refresh(): void {
    this.rpts.myReports().subscribe({
      next: rs => { this.reports.set(rs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  onFile(ev: Event): void {
    this.file.set((ev.target as HTMLInputElement).files?.[0] || null);
  }

  submit(): void {
    const f = this.file();
    if (!this.form.valid || !f) return;
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    this.rpts.upload(Number(this.form.value['appointment_id']), this.form.value['report_name'] as string, f).subscribe({
      next: () => {
        this.success.set(true);
        this.saving.set(false);
        this.file.set(null);
        this.form.reset();
        this.refresh();
      },
      error: (err) => { this.error.set(err?.message || 'Upload failed.'); this.saving.set(false); }
    });
  }

  fileUrl(r: PatientReport): string {
    const base = environment.apiBaseUrl.replace(/\/api$/, '');
    return `${base}/${r.file_path.replace(/\\/g, '/')}`;
  }
}