import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentService } from '../../core/services/appointment.service';
import { PrescriptionService } from '../../core/services/prescription.service';
import { PaymentService } from '../../core/services/payment.service';
import { ReportService } from '../../core/services/report.service';
import { TokenService } from '../../core/services/token.service';
import { Appointment } from '../../core/models/appointment.model';
import { Prescription } from '../../core/models/prescription.model';
import { Payment } from '../../core/models/payment.model';
import { PatientReport } from '../../core/models/payment.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, PageHeaderComponent, StatCardComponent, LoadingComponent],
  template: `
  <div class="page">
    <app-page-header
      [title]="'Hi, ' + firstName()"
      subtitle="Your health, organised. Here's a quick look.">
    </app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="grid grid-4 mb-24">
        <app-stat-card label="Upcoming appointments" [value]="upcoming().length" trend="Scheduled" accent="#0E7490" [icon]="iconCal"></app-stat-card>
        <app-stat-card label="Prescriptions" [value]="prescriptions().length" trend="On file" accent="#2563EB" [icon]="iconRx"></app-stat-card>
        <app-stat-card label="Reports uploaded" [value]="reports().length" trend="Stored securely" accent="#D97706" [icon]="iconFile"></app-stat-card>
        <app-stat-card label="Total spent" [value]="(totalSpent()) | number:'1.0-0'" trend="On consultations" accent="#059669" [icon]="iconMoney"></app-stat-card>
      </div>

      <div class="grid grid-2">
        <section class="card">
          <div class="flex justify-between items-center mb-16">
            <h3 class="card-title">Next appointments</h3>
            <a routerLink="/patient/book" class="btn btn-primary btn-sm">+ Book new</a>
          </div>
          <ng-container *ngIf="upcoming().length; else noAppts">
            <div class="appt" *ngFor="let a of upcoming().slice(0, 5)">
              <div class="appt-date">
                <div class="day">{{ formatDay(a.appointment_date) }}</div>
                <div class="time">{{ a.appointment_time }}</div>
              </div>
              <div class="appt-body">
                <div class="font-bold">{{ a.doctor_name }}</div>
                <div class="text-muted" style="font-size:12px">{{ a.category_name || 'Doctor' }}</div>
              </div>
              <span class="badge" [class]="badgeFor(a.status)">{{ a.status }}</span>
            </div>
          </ng-container>
          <ng-template #noAppts>
            <div class="empty-state-inline">
              <p>No upcoming appointments.</p>
              <a routerLink="/patient/doctors" class="btn btn-secondary btn-sm">Find a doctor</a>
            </div>
          </ng-template>
        </section>

        <section class="card">
          <div class="flex justify-between items-center mb-16">
            <h3 class="card-title">Recent prescriptions</h3>
            <a routerLink="/patient/prescriptions" class="btn btn-ghost btn-sm">View all →</a>
          </div>
          <ng-container *ngIf="prescriptions().length; else noRx">
            <div class="rx" *ngFor="let p of prescriptions().slice(0, 5)">
              <div class="rx-icon">℞</div>
              <div class="rx-body">
                <div class="font-bold">{{ p.doctor_name }}</div>
                <div class="text-muted" style="font-size:12px">{{ p.diagnosis }}</div>
              </div>
              <div class="text-subtle" style="font-size:11px">{{ p.created_at | date:'mediumDate' }}</div>
            </div>
          </ng-container>
          <ng-template #noRx>
            <p class="text-muted text-center" style="padding:20px">No prescriptions yet.</p>
          </ng-template>
        </section>
      </div>

      <section class="card mt-24">
        <h3 class="card-title mb-16">Recent payments</h3>
        <div class="table-wrapper" *ngIf="payments().length" style="border:none;box-shadow:none">
          <table class="data-table">
            <thead><tr><th>Doctor</th><th>Method</th><th>Status</th><th class="text-right">Amount</th></tr></thead>
            <tbody>
              <tr *ngFor="let p of payments().slice(0, 5)">
                <td>{{ p.doctor_name }}</td>
                <td>{{ p.payment_method }}</td>
                <td><span class="badge" [class]="badgeForPayment(p.payment_status)">{{ p.payment_status }}</span></td>
                <td class="text-right font-bold">₹ {{ p.amount | number:'1.0-0' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p *ngIf="!payments().length" class="text-muted text-center" style="padding:20px">No payments yet.</p>
      </section>
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

    .rx { display: grid; grid-template-columns: 40px 1fr auto; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
    .rx:last-child { border-bottom: none; }
    .rx-icon {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
      color: #1E40AF;
      display: inline-flex; align-items: center; justify-content: center;
      border-radius: var(--radius-md);
      font-weight: 800; font-size: 16px;
    }

    .empty-state-inline {
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      padding: 20px; color: var(--color-text-muted);
    }
  `]
})
export class PatientDashboardComponent implements OnInit {
  private readonly appts = inject(AppointmentService);
  private readonly rx    = inject(PrescriptionService);
  private readonly pay   = inject(PaymentService);
  private readonly rpts  = inject(ReportService);
  private readonly tokens = inject(TokenService);

  readonly appointments  = signal<Appointment[]>([]);
  readonly prescriptions = signal<Prescription[]>([]);
  readonly payments      = signal<Payment[]>([]);
  readonly reports       = signal<PatientReport[]>([]);
  readonly loading       = signal(true);

  readonly firstName = () => this.tokens.user()?.name?.split(' ')[0] ?? 'there';

  readonly today = new Date().toISOString().slice(0, 10);
  readonly upcoming = computed(() => this.appointments().filter(a => a.appointment_date >= this.today));
  readonly totalSpent = computed(() => this.payments().filter(p => p.payment_status === 'Paid').reduce((s, p) => s + Number(p.amount), 0));

  readonly iconCal   = '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  readonly iconRx    = '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 4 3 9 8 9"/><path d="M12 7v5l3 2"/></svg>';
  readonly iconFile  = '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>';
  readonly iconMoney = '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';

  ngOnInit(): void {
    let done = 0;
    const check = () => { if (++done === 4) this.loading.set(false); };

    this.appts.myAppointments().subscribe({ next: a => { this.appointments.set(a); check(); }, error: () => check() });
    this.rx.myPrescriptions().subscribe({ next: p => { this.prescriptions.set(p); check(); }, error: () => check() });
    this.pay.myPayments().subscribe({ next: p => { this.payments.set(p); check(); }, error: () => check() });
    this.rpts.myReports().subscribe({ next: r => { this.reports.set(r); check(); }, error: () => check() });
  }

  formatDay(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  }

  badgeFor(status: string): string {
    return ({ 'Pending': 'badge-warning', 'Approved': 'badge-info', 'Completed': 'badge-success', 'Cancelled': 'badge-danger' } as Record<string, string>)[status] || 'badge-neutral';
  }

  badgeForPayment(status: string): string {
    return ({ 'Paid': 'badge-success', 'Pending': 'badge-warning', 'Failed': 'badge-danger', 'Refunded': 'badge-neutral' } as Record<string, string>)[status] || 'badge-neutral';
  }
}