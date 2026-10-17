import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-doctor-appointments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="My appointments" subtitle="Review and manage your patient appointments."></app-page-header>

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
      </form>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="table-wrapper" *ngIf="appointments().length; else emptyTpl">
        <table class="data-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Patient</th>
              <th>Status</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of appointments()">
              <td>
                <div class="font-bold">{{ a.appointment_date | date:'mediumDate' }}</div>
                <div class="text-subtle" style="font-size:12px">{{ a.appointment_time }}</div>
              </td>
              <td>
                <div class="font-bold">{{ a.patient_name }}</div>
                <div class="text-subtle" style="font-size:12px">{{ a.patient_email }}</div>
              </td>
              <td><span class="badge" [class]="badgeFor(a.status)">{{ a.status }}</span></td>
              <td class="text-right">
                <button *ngIf="a.status === 'Pending'"   class="btn btn-primary btn-sm" (click)="setStatus(a, 'Approved')">Approve</button>
                <button *ngIf="a.status === 'Approved'"  class="btn btn-primary btn-sm" (click)="setStatus(a, 'Completed')">Complete</button>
                <button *ngIf="a.status !== 'Cancelled' && a.status !== 'Completed'" class="btn btn-ghost btn-sm" style="color:var(--color-danger)" (click)="setStatus(a, 'Cancelled')">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No appointments match" message="When patients book, they'll show up here."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .filters { max-width: 300px; }
    .filters .form-group { margin-bottom: 0; }
  `]
})
export class DoctorAppointmentsComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly appts = inject(AppointmentService);

  readonly appointments = signal<Appointment[]>([]);
  readonly loading      = signal(true);

  form: FormGroup = this.fb.group({ status: [''] });

  ngOnInit(): void {
    this.refresh();
    this.form.valueChanges.subscribe(() => this.refresh());
  }

  refresh(): void {
    this.loading.set(true);
    const status = this.form.value['status'] || undefined;
    this.appts.myAppointments(status || undefined).subscribe({
      next: a => { this.appointments.set(a); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setStatus(a: Appointment, status: Appointment['status']): void {
    this.appts.updateStatus(a.id, status).subscribe(() => this.refresh());
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