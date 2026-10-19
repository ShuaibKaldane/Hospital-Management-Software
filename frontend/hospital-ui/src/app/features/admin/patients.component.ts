import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-manage-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Patients" subtitle="Patients registered with your hospital.">
      <button class="btn btn-primary" (click)="openAdd()">+ Add patient</button>
    </app-page-header>

    <div class="card mb-16">
      <div class="filters">
        <input class="form-control" placeholder="Search by name…" [formControl]="searchCtrl" (input)="reload()">
      </div>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="patients().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>Patient</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Blood</th>
              <th>Phone</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of patients()">
              <td>
                <strong>{{ p.name }}</strong>
                <div class="text-subtle" style="font-size:12px">{{ p.email }}</div>
              </td>
              <td>{{ p.age || '—' }}</td>
              <td>{{ p.gender || '—' }}</td>
              <td>{{ p.blood_group || '—' }}</td>
              <td>{{ p.phone || '—' }}</td>
              <td>{{ p.created_at | date:'mediumDate' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <ng-template #emptyTpl>
        <app-empty-state title="No patients yet" message="Add your first patient to get started."></app-empty-state>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>

  <!-- Add modal -->
  <div class="modal-backdrop" *ngIf="showAdd()" (click)="closeAdd($event)">
    <div class="modal" (click)="$event.stopPropagation()">
      <h3>Add patient</h3>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input class="form-control" formControlName="name">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input class="form-control" type="email" formControlName="email">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-control" formControlName="password">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Age</label>
            <input class="form-control" type="number" formControlName="age">
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <select class="form-select" formControlName="gender">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Blood group</label>
            <input class="form-control" formControlName="blood_group">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-control" formControlName="phone">
          </div>
        </div>

        <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:16px">
          <button type="button" class="btn btn-ghost" (click)="closeAdd()">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Adding…' : 'Add patient' }}
          </button>
        </div>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 1fr; gap: 12px; }
  `]
})
export class ManagePatientsComponent implements OnInit {
  private readonly api = inject(AdminService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly patients = signal<any[]>([]);
  readonly loading = signal(true);
  readonly searchCtrl = this.fb.control('');

  readonly showAdd = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    name:        ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(6)]],
    age:         [null],
    gender:      [''],
    blood_group: [''],
    phone:       ['']
  });

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.api.listPatients({ search: this.searchCtrl.value || undefined }).subscribe({
      next: rows => { this.patients.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openAdd(): void {
    this.error.set(null);
    this.form.reset();
    this.showAdd.set(true);
  }

  closeAdd(ev?: Event): void {
    if (ev && ev.target !== ev.currentTarget) return;
    this.showAdd.set(false);
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.error.set(null);
    this.api.addPatient(this.form.value).subscribe({
      next: () => { this.saving.set(false); this.showAdd.set(false); this.reload(); },
      error: err => { this.saving.set(false); this.error.set(err?.message || 'Failed'); }
    });
  }
}
