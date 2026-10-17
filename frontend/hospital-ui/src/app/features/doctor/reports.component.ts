import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ReportService } from '../../core/services/report.service';
import { PatientReport } from '../../core/models/payment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-doctor-reports',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Patient reports" subtitle="Medical reports patients have uploaded."></app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="grid grid-2" *ngIf="reports().length; else emptyTpl">
        <article class="report-card" *ngFor="let r of reports()">
          <div class="report-icon">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div class="report-body">
            <div class="font-bold">{{ r.report_name }}</div>
            <div class="text-muted" style="font-size:12px">From {{ r.patient_name }}</div>
            <div class="text-subtle" style="font-size:11px">{{ r.uploaded_at | date:'medium' }}</div>
          </div>
          <a [href]="fileUrl(r)" target="_blank" rel="noopener" class="btn btn-secondary btn-sm">Open</a>
        </article>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No reports uploaded yet" message="Patients can attach reports when booking appointments."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .report-card {
      display: grid;
      grid-template-columns: 56px 1fr auto;
      gap: 16px; align-items: center;
      padding: 18px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
    }
    .report-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      background: var(--color-primary-soft);
      color: var(--color-primary-dark);
      display: inline-flex; align-items: center; justify-content: center;
    }
  `]
})
export class DoctorReportsComponent implements OnInit {
  private readonly reportsSvc = inject(ReportService);

  readonly reports = signal<PatientReport[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.reportsSvc.myReports().subscribe({
      next: rs => { this.reports.set(rs); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  /** Backend stores uploads on disk; expose a direct link to the static folder. */
  fileUrl(r: PatientReport): string {
    // server.js serves /uploads via express.static in a real deployment;
    // here we just link to the path the backend writes (relative to API host).
    const base = environment.apiBaseUrl.replace(/\/api$/, '');
    return `${base}/${r.file_path.replace(/\\/g, '/')}`;
  }
}