import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SuperAdminService, Hospital } from '../../core/services/super-admin.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-super-admin-hospitals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header
      title="Hospitals"
      subtitle="Add, update plans, or remove hospitals from the platform.">
      <button class="btn btn-primary" (click)="openAdd()">+ Add hospital</button>
    </app-page-header>

    <div class="card mb-16">
      <div class="filters">
        <input class="form-control" placeholder="Search by name…" [formControl]="searchCtrl" (input)="reload()">
        <select class="form-select" [formControl]="planCtrl" (change)="reload()">
          <option value="">All plans</option>
          <option value="trial">Trial</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="hospitals().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>Hospital</th>
              <th>City</th>
              <th>Admin</th>
              <th>Plan</th>
              <th>Days left</th>
              <th>Created</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let h of hospitals()">
              <td>
                <strong>{{ h.name }}</strong>
                <div class="text-subtle" style="font-size:12px">{{ h.phone || '—' }}</div>
              </td>
              <td>{{ h.city || '—' }}</td>
              <td>
                <div>{{ h.admin_name || '—' }}</div>
                <div class="text-subtle" style="font-size:12px">{{ h.admin_email || '' }}</div>
              </td>
              <td>
                <span class="badge" [class]="planBadge(h.plan)">{{ h.plan | titlecase }}</span>
                <span class="badge badge-neutral" *ngIf="h.trial">trial</span>
              </td>
              <td>
                <span class="badge" [class]="daysBadge(h.days_left)">
                  {{ h.days_left === null ? '—' : h.days_left + ' d' }}
                </span>
              </td>
              <td>{{ h.created_at | date:'mediumDate' }}</td>
              <td class="text-right">
                <button class="btn btn-sm btn-secondary" (click)="openPlan(h)">Plan</button>
                <button class="btn btn-sm btn-danger" style="margin-left:6px" (click)="remove(h)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyTpl>
        <app-empty-state title="No hospitals yet" message="Add your first hospital to get started."></app-empty-state>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>

  <!-- Add modal -->
  <div class="modal-backdrop" *ngIf="showAdd()" (click)="closeAdd($event)">
    <div class="modal" (click)="$event.stopPropagation()">
      <h3>Add hospital</h3>
      <p class="text-muted">A hospital admin user is created automatically. Share the credentials with them.</p>
      <form [formGroup]="addForm" (ngSubmit)="submitAdd()">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Hospital name</label>
            <input class="form-control" formControlName="hospitalName">
          </div>
          <div class="form-group">
            <label class="form-label">City</label>
            <input class="form-control" formControlName="city">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-control" formControlName="phone">
          </div>
          <div class="form-group">
            <label class="form-label">Plan</label>
            <select class="form-select" formControlName="plan">
              <option value="trial">Trial (7 days)</option>
              <option value="basic">Basic (30 days)</option>
              <option value="pro">Pro (30 days)</option>
              <option value="enterprise">Enterprise (30 days)</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Address</label>
          <input class="form-control" formControlName="address">
        </div>
        <div class="form-group">
          <label class="form-label">Days</label>
          <input class="form-control" type="number" formControlName="days" min="1" max="3650">
        </div>
        <hr style="margin:16px 0;border:none;border-top:1px solid var(--color-border)">
        <h4 style="margin-bottom:8px">Admin user</h4>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Admin name</label>
            <input class="form-control" formControlName="adminName">
          </div>
          <div class="form-group">
            <label class="form-label">Admin email</label>
            <input class="form-control" type="email" formControlName="adminEmail">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password (optional — auto-generated if blank)</label>
          <input class="form-control" formControlName="password">
        </div>

        <div class="alert alert-error" *ngIf="addError()">{{ addError() }}</div>
        <div class="alert alert-success" *ngIf="added()">
          Hospital created. Admin email: <strong>{{ added()?.adminEmail }}</strong>,
          password: <strong>{{ added()?.adminPassword }}</strong>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button type="button" class="btn btn-ghost" (click)="closeAdd()">Close</button>
          <button type="submit" class="btn btn-primary" [disabled]="addForm.invalid || addSaving()">
            {{ addSaving() ? 'Adding…' : 'Add hospital' }}
          </button>
        </div>
      </form>
    </div>
  </div>

  <!-- Plan modal -->
  <div class="modal-backdrop" *ngIf="showPlan()" (click)="closePlan($event)">
    <div class="modal" (click)="$event.stopPropagation()">
      <h3>Update plan</h3>
      <p class="text-muted" *ngIf="planTarget()">Hospital: <strong>{{ planTarget()?.name }}</strong></p>
      <form [formGroup]="planForm" (ngSubmit)="submitPlan()">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Plan</label>
            <select class="form-select" formControlName="plan">
              <option value="trial">Trial</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Days</label>
            <input class="form-control" type="number" formControlName="days" min="1" max="3650">
          </div>
        </div>
        <div class="alert alert-error" *ngIf="planError()">{{ planError() }}</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button type="button" class="btn btn-ghost" (click)="closePlan()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="planSaving()">
            {{ planSaving() ? 'Saving…' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 1fr 200px; gap: 12px; }
    @media (max-width: 600px) { .filters { grid-template-columns: 1fr; } }
  `]
})
export class SuperAdminHospitalsComponent implements OnInit {
  private readonly api = inject(SuperAdminService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly hospitals = signal<Hospital[]>([]);
  readonly loading = signal(true);
  readonly searchCtrl = this.fb.control('');
  readonly planCtrl = this.fb.control('');

  readonly showAdd = signal(false);
  readonly addSaving = signal(false);
  readonly addError = signal<string | null>(null);
  readonly added = signal<(Hospital & { adminPassword: string; adminEmail: string }) | null>(null);

  readonly showPlan = signal(false);
  readonly planSaving = signal(false);
  readonly planError = signal<string | null>(null);
  readonly planTarget = signal<Hospital | null>(null);

  addForm: FormGroup = this.fb.group({
    hospitalName: ['', Validators.required],
    city:         ['', Validators.required],
    phone:        ['', Validators.required],
    address:      [''],
    plan:         ['trial'],
    days:         [7],
    adminName:    ['', Validators.required],
    adminEmail:   ['', [Validators.required, Validators.email]],
    password:     ['']
  });

  planForm: FormGroup = this.fb.group({
    plan: ['basic', Validators.required],
    days: [30, [Validators.required, Validators.min(1)]]
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.api.listHospitals({
      search: this.searchCtrl.value || undefined,
      plan: this.planCtrl.value || undefined
    }).subscribe({
      next: rows => { this.hospitals.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openAdd(): void {
    this.addError.set(null);
    this.added.set(null);
    this.addForm.reset({ plan: 'trial', days: 7 });
    this.showAdd.set(true);
  }

  closeAdd(ev?: Event): void {
    if (ev && ev.target !== ev.currentTarget) return;
    this.showAdd.set(false);
  }

  submitAdd(): void {
    if (this.addForm.invalid) { this.addForm.markAllAsTouched(); return; }
    this.addSaving.set(true);
    this.addError.set(null);
    this.added.set(null);
    this.api.addHospital(this.addForm.value as any).subscribe({
      next: res => {
        this.added.set(res as any);
        this.addSaving.set(false);
        this.reload();
      },
      error: err => {
        this.addSaving.set(false);
        this.addError.set(err?.message || 'Failed to add hospital');
      }
    });
  }

  openPlan(h: Hospital): void {
    this.planTarget.set(h);
    this.planError.set(null);
    this.planForm.reset({ plan: h.plan === 'trial' ? 'basic' : h.plan, days: 30 });
    this.showPlan.set(true);
  }

  closePlan(ev?: Event): void {
    if (ev && ev.target !== ev.currentTarget) return;
    this.showPlan.set(false);
  }

  submitPlan(): void {
    const target = this.planTarget();
    if (!target) return;
    this.planSaving.set(true);
    this.planError.set(null);
    this.api.updatePlan(target.id, this.planForm.value).subscribe({
      next: () => { this.planSaving.set(false); this.showPlan.set(false); this.reload(); },
      error: err => {
        this.planSaving.set(false);
        this.planError.set(err?.message || 'Failed to update plan');
      }
    });
  }

  remove(h: Hospital): void {
    if (!confirm(`Remove hospital "${h.name}"? This unlinks all its users but keeps their accounts.`)) return;
    this.api.removeHospital(h.id).subscribe({
      next: () => this.reload(),
      error: err => alert(err?.message || 'Failed to remove')
    });
  }

  planBadge(plan: string): string {
    return ({
      trial: 'badge-warning',
      basic: 'badge-info',
      pro: 'badge-primary',
      enterprise: 'badge-success'
    } as Record<string, string>)[plan] || 'badge-neutral';
  }

  daysBadge(days: number | null | undefined): string {
    if (days === null || days === undefined) return 'badge-neutral';
    if (days <= 3)  return 'badge-danger';
    if (days <= 10) return 'badge-warning';
    return 'badge-success';
  }
}
