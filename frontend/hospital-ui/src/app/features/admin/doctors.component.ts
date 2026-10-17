import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { DoctorProfile } from '../../core/models/doctor.model';
import { DoctorCategory } from '../../core/models/doctor.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-manage-doctors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Doctors" subtitle="Approve, block, and review doctor accounts."></app-page-header>

    <div class="card mb-16">
      <form [formGroup]="form" class="filters">
        <div class="form-group">
          <label class="form-label">Search by name</label>
          <input class="form-control" formControlName="search" placeholder="Dr. Jane…">
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" formControlName="status">
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <select class="form-control" formControlName="category_id">
            <option value="">All</option>
            <option *ngFor="let c of categories" [value]="c.id">{{ c.category_name }}</option>
          </select>
        </div>
      </form>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="doctors().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Category</th>
              <th>Fee</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let d of doctors()">
              <td>
                <div class="doctor-cell">
                  <div class="avatar">{{ initials(d.name) }}</div>
                  <div>
                    <div class="font-bold">{{ d.name }}</div>
                    <div class="text-subtle" style="font-size:12px">{{ d.email }}</div>
                  </div>
                </div>
              </td>
              <td>{{ d.category_name }}</td>
              <td>₹ {{ d.consultation_fee }}</td>
              <td><span class="badge" [class]="badgeFor(d.status)">{{ d.status }}</span></td>
              <td class="text-right">
                <button *ngIf="d.status !== 'ACTIVE'"  class="btn btn-primary btn-sm" (click)="approve(d)">Approve</button>
                <button *ngIf="d.status !== 'BLOCKED'" class="btn btn-danger btn-sm"  (click)="block(d)" style="margin-left:6px">Block</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No doctors match your filters" message="Try clearing search filters."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 14px; }
    @media (max-width: 700px) { .filters { grid-template-columns: 1fr; } }
    .filters .form-group { margin-bottom: 0; }
    .doctor-cell { display: flex; align-items: center; gap: 12px; }
    .avatar {
      width: 36px; height: 36px; border-radius: 50%;
      background: linear-gradient(135deg, #0E7490, #155E75);
      color: #fff; display: inline-flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 12px;
      flex-shrink: 0;
    }
  `]
})
export class ManageDoctorsComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly admin = inject(AdminService);

  readonly doctors = signal<DoctorProfile[]>([]);
  readonly loading = signal(true);
  categories: DoctorCategory[] = [];

  form: FormGroup = this.fb.group({
    search:      [''],
    status:      [''],
    category_id: ['']
  });

  ngOnInit(): void {
    this.admin.listCategories().subscribe(cs => this.categories = cs);
    this.refresh();

    this.form.valueChanges.subscribe(() => this.refresh());
  }

  refresh(): void {
    this.loading.set(true);
    const v = this.form.value;
    this.admin.listDoctors({
      search: v['search'] || undefined,
      status: v['status'] || undefined,
      category_id: v['category_id'] ? Number(v['category_id']) : undefined
    }).subscribe({
      next: ds => { this.doctors.set(ds); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  approve(d: DoctorProfile): void {
    if (!confirm(`Approve Dr. ${d.name}?`)) return;
    this.admin.approveDoctor(d.user_id).subscribe(() => this.refresh());
  }

  block(d: DoctorProfile): void {
    if (!confirm(`Block Dr. ${d.name}? They will not be able to sign in.`)) return;
    this.admin.blockDoctor(d.user_id).subscribe(() => this.refresh());
  }

  initials(name: string): string {
    return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }

  badgeFor(status?: string): string {
    return ({
      'ACTIVE': 'badge-success',
      'PENDING': 'badge-warning',
      'BLOCKED': 'badge-danger'
    } as Record<string, string>)[status || ''] || 'badge-neutral';
  }
}