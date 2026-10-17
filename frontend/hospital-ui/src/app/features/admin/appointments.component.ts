import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { Appointment } from '../../core/models/appointment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-all-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="All appointments" subtitle="Filter and manage every booking on the platform."></app-page-header>

    <div class="card mb-16">
      <form [formGroup]="form" class="filters">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" formControlName="status">
            <option value="">All</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Date</label>
          <input class="form-control" type="date" formControlName="date">
        </div>
      </form>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="appointments().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of appointments()">
              <td>
                <div class="font-bold">{{ a.appointment_date }}</div>
                <div class="text-subtle" style="font-size:12px">{{ a.appointment_time }}</div>
              </td>
              <td>{{ a.patient_name }}</td>
              <td>{{ a.doctor_name }}</td>
              <td><span class="badge" [class]="badgeFor(a.status)">{{ a.status }}</span></td>
              <td class="text-right">
                <select class="form-control" style="display:inline-block;width:auto;padding:6px 10px" [value]="a.status" (change)="changeStatus(a, $event)">
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No appointments yet" message="When patients book, they'll appear here."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; max-width: 600px; }
    .filters .form-group { margin-bottom: 0; }
    @media (max-width: 600px) { .filters { grid-template-columns: 1fr; } }
  `]
})
export class AllAppointmentsComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly admin = inject(AdminService);

  readonly appointments = signal<Appointment[]>([]);
  readonly loading      = signal(true);

  form: FormGroup = this.fb.group({
    status: [''],
    date:   ['']
  });

  ngOnInit(): void {
    this.refresh();
    this.form.valueChanges.subscribe(() => this.refresh());
  }

  refresh(): void {
    this.loading.set(true);
    const v = this.form.value;
    this.admin.listAppointments({
      status: v['status'] || undefined,
      date:   v['date']   || undefined
    }).subscribe({
      next: a => { this.appointments.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  changeStatus(a: Appointment, ev: Event): void {
    const status = (ev.target as HTMLSelectElement).value as Appointment['status'];
    this.admin.updateAppointmentStatus(a.id, status).subscribe(() => this.refresh());
  }

  badgeFor(status: string): string {
    return ({
      'Pending': 'badge-warning',
      'Approved': 'badge-info',
      'Completed': 'badge-success',
      'Cancelled': 'badge-danger'
    } as Record<string, string>)[status] || 'badge-neutral';
  }
}