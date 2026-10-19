import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { SuperAdminService, SuperAdminPatient } from '../../core/services/super-admin.service';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-super-admin-patients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header
      title="Patients"
      subtitle="Every patient registered on the platform.">
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
              <th>Hospital</th>
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
              <td>{{ p.hospital_name || '—' }}</td>
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
        <app-empty-state title="No patients yet" message="Once patients sign up, they will appear here."></app-empty-state>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 1fr; gap: 12px; }
  `]
})
export class SuperAdminPatientsComponent implements OnInit {
  private readonly api = inject(SuperAdminService);
  private readonly fb = inject(FormBuilder).nonNullable;

  readonly patients = signal<SuperAdminPatient[]>([]);
  readonly loading = signal(true);
  readonly searchCtrl = this.fb.control('');

  ngOnInit(): void { this.reload(); }

  reload(): void {
    this.loading.set(true);
    this.api.listPatients({ search: this.searchCtrl.value || undefined }).subscribe({
      next: rows => { this.patients.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
