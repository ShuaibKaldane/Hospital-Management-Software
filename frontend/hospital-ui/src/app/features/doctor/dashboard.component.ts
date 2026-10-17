import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { PrescriptionService } from '../../core/services/prescription.service';
import { SalaryService } from '../../core/services/salary.service';
import { TokenService } from '../../core/services/token.service';
import { Appointment } from '../../core/models/appointment.model';
import { Prescription } from '../../core/models/prescription.model';
import { EarningsSummary } from '../../core/models/salary.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, DatePipe, PageHeaderComponent, StatCardComponent, LoadingComponent],
  template: `
  <div class="page">
    <app-page-header
      [title]="'Welcome, ' + firstName()"
      subtitle="Here's your practice at a glance.">
    </app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="grid grid-4 mb-24">
        <app-stat-card
          label="Today's appointments"
          [value]="todays().length"
          trend="Scheduled for today"
          accent="#0E7490"
          [icon]="iconCal"></app-stat-card>

        <app-stat-card
          label="Pending approval"
          [value]="pendingAppts()"
          trend="Awaiting your confirmation"
          accent="#D97706"
          [icon]="iconClock"></app-stat-card>

        <app-stat-card
          label="Total prescriptions"
          [value]="prescriptions().length"
          trend="Written by you"
          accent="#2563EB"
          [icon]="iconRx"></app-stat-card>

        <app-stat-card
          label="Net earnings"
          [value]="(earnings()?.net ?? 0) | number:'1.0-0'"
          trend="Salary + bonus − deductions"
          accent="#059669"
          [icon]="iconMoney"></app-stat-card>
      </div>

      <div class="grid grid-2">
        <section class="card">
          <div class="flex justify-between items-center mb-16">
            <h3 class="card-title">Upcoming appointments</h3>
            <a routerLink="/doctor/appointments" class="btn btn-ghost btn-sm">View all →</a>
          </div>
          <ng-container *ngIf="upcoming().length; else noAppts">
            <div class="appt" *ngFor="let a of upcoming().slice(0, 5)">
              <div class="appt-date">
                <div class="day">{{ formatDay(a.appointment_date) }}</div>
                <div class="time">{{ a.appointment_time }}</div>
              </div>
              <div class="appt-body">
                <div class="font-bold">{{ a.patient_name }}</div>
                <div class="text-muted" style="font-size:12px">{{ a.patient_email }}</div>
              </div>
              <span class="badge" [class]="badgeFor(a.status)">{{ a.status }}</span>
            </div>
          </ng-container>
          <ng-template #noAppts>
            <p class="text-muted text-center" style="padding:20px">No upcoming appointments. Take a breather ☕</p>
          </ng-template>
        </section>

        <section class="card">
          <div class="flex justify-between items-center mb-16">
            <h3 class="card-title">Recent prescriptions</h3>
            <a routerLink="/doctor/prescriptions" class="btn btn-ghost btn-sm">View all →</a>
          </div>
          <ng-container *ngIf="prescriptions().length; else noRx">
            <div class="rx" *ngFor="let p of prescriptions().slice(0, 5)">
              <div class="rx-icon">℞</div>
              <div class="rx-body">
                <div class="font-bold">{{ p.patient_name }}</div>
                <div class="text-muted" style="font-size:12px">{{ p.diagnosis }}</div>
              </div>
              <div class="text-subtle" style="font-size:11px">{{ p.created_at | date:'mediumDate' }}</div>
            </div>
          </ng-container>
          <ng-template #noRx>
            <p class="text-muted text-center" style="padding:20px">No prescriptions written yet.</p>
          </ng-template>
        </section>
      </div>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .appt {
      display: grid;
      grid-template-columns: 80px 1fr auto;
      align-items: center;
      gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid var(--color-border);
    }
    .appt:last-child { border-bottom: none; }
    .appt-date { text-align: center; padding: 8px; background: var(--color-primary-soft); border-radius: var(--radius-md); color: var(--color-primary-dark); }
    .appt-date .day { font-family: var(--font-display); font-weight: 700; font-size: 13px; }
    .appt-date .time { font-size: 11px; }

    .rx {
      display: grid;
      grid-template-columns: 40px 1fr auto;
      align-items: center;
      gap: 12px;
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border);
    }
    .rx:last-child { border-bottom: none; }
    .rx-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
      color: #1E40AF;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--radius-md);
      font-weight: 800;
      font-size: 16px;
    }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  private readonly appts = inject(AppointmentService);
  private readonly rx    = inject(PrescriptionService);
  private readonly salary = inject(SalaryService);
  private readonly tokens = inject(TokenService);

  readonly appointments   = signal<Appointment[]>([]);
  readonly prescriptions  = signal<Prescription[]>([]);
  readonly earnings       = signal<EarningsSummary | null>(null);
  readonly loading        = signal(true);

  readonly firstName = () => this.tokens.user()?.name?.split(' ')[0] ?? 'Doctor';

  readonly today = new Date().toISOString().slice(0, 10);

  readonly todays = computed(() => this.appointments().filter(a => a.appointment_date === this.today));
  readonly upcoming = computed(() => this.appointments().filter(a => a.appointment_date >= this.today));
  readonly pendingAppts = computed(() => this.appointments().filter(a => a.status === 'Pending').length);

  readonly iconCal   = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  readonly iconClock = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  readonly iconRx    = '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 4 3 9 8 9"/><path d="M12 7v5l3 2"/></svg>';
  readonly iconMoney = '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';

  ngOnInit(): void {
    let done = 0;
    const checkDone = () => { if (++done === 3) this.loading.set(false); };

    this.appts.myAppointments().subscribe({
      next: a => { this.appointments.set(a); checkDone(); },
      error: () => checkDone()
    });

    // Doctor uses /doctor/prescriptions but we have a single endpoint that returns doctor's own list.
    this.rx.myPrescriptions().subscribe({
      next: p => { this.prescriptions.set(p); checkDone(); },
      error: () => checkDone()
    });

    this.salary.myEarnings().subscribe({
      next: e => { this.earnings.set(e); checkDone(); },
      error: () => checkDone()
    });
  }

  formatDay(date: string): string {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
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