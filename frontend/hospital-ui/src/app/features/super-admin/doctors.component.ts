import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SuperAdminService, SuperAdminDoctor } from '../../core/services/super-admin.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-super-admin-doctors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header
      title="Doctors"
      subtitle="Every doctor across every hospital on the platform.">
    </app-page-header>

    <div class="card mb-16">
      <div class="filters">
        <input class="form-control" placeholder="Search by name…" [formControl]="searchCtrl" (input)="reload()">
        <select class="form-select" [formControl]="statusCtrl" (change)="reload()">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="doctors().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Hospital</th>
              <th>Category</th>
              <th>Experience</th>
              <th>Fee</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of doctors()">
              <td>
                <strong>{{ d.name }}</strong>
                <div class="text-subtle" style="font-size:12px">{{ d.email }}</div>
              </td>
              <td>{{ d.hospital_name || '—' }}</td>
              <td>{{ d.category_name }}</td>
              <td>{{ d.experience }} yrs</td>
              <td>₹ {{ d.consultation_fee }}</td>
              <td><span class="badge" [class]="badgeFor(d.status)">{{ d.status }}</span></td>
              <td>{{ d.created_at | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyTpl>
        <app-empty-state title="No doctors yet" message="Once hospitals add doctors, they will appear here."></app-empty-state>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 1fr 200px; gap: 12px; }
    @media (max-width: 600px) { .filters { grid-template-columns: 1fr; } }
  `]
})
export class SuperAdminDoctorsComponent implements OnInit {
  private readonly api = inject(SuperAdminService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly doctors = signal<SuperAdminDoctor[]>([]);
  readonly loading = signal(true);
  readonly searchCtrl = this.fb.control('');
  readonly statusCtrl = this.fb.control('');

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.api.listDoctors({
      search: this.searchCtrl.value || undefined,
      status: this.statusCtrl.value || undefined
    }).subscribe({
      next: rows => { this.doctors.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  badgeFor(status: string): string {
    return ({ ACTIVE: 'badge-success', PENDING: 'badge-warning', BLOCKED: 'badge-danger' } as Record<string, string>)[status] || 'badge-neutral';
  }
}
