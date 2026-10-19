import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SuperAdminService, PlatformStats } from '../../core/services/super-admin.service';
import { TokenService } from '../../core/services/token.service';
import { StatCardComponent } from '../../shared/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DecimalPipe, StatCardComponent, PageHeaderComponent, LoadingComponent],
  template: `
  <div class="page">
    <app-page-header
      title="Welcome, {{ name() }}"
      subtitle="Platform-wide overview of every hospital on MediCare+.">
    </app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="grid grid-4 mb-24">
        <app-stat-card
          label="Hospitals"
          [value]="stats()?.hospitals?.total ?? 0"
          [trend]="(stats()?.hospitals?.on_trial ?? 0) + ' on trial · ' + (stats()?.hospitals?.paid ?? 0) + ' paid'"
          accent="#0E7490"
          [icon]="iconBuilding"></app-stat-card>

        <app-stat-card
          label="Total Doctors"
          [value]="countByRole('DOCTOR')"
          trend="Across all hospitals"
          accent="#155E75"
          [icon]="iconUser"></app-stat-card>

        <app-stat-card
          label="Total Patients"
          [value]="countByRole('PATIENT')"
          trend="Registered accounts"
          accent="#059669"
          [icon]="iconUser"></app-stat-card>

        <app-stat-card
          label="Platform Revenue"
          [value]="(stats()?.revenue?.total_revenue || 0) | number:'1.0-0'"
          [trend]="(stats()?.revenue?.total_transactions || 0) + ' transactions'"
          accent="#2563EB"
          [icon]="iconMoney"></app-stat-card>
      </div>

      <div class="grid grid-2">
        <section class="card">
          <h3 class="card-title mb-16">Appointments by status</h3>
          <div class="bar-list" *ngIf="stats()?.appointments?.length; else emptyAppts">
            <div class="bar-row" *ngFor="let a of stats()?.appointments">
              <div class="bar-label">{{ a.status }}</div>
              <div class="bar-track">
                <div class="bar-fill" [style.width.%]="apptPct(a.count)" [class]="barClass(a.status)"></div>
              </div>
              <div class="bar-count">{{ a.count }}</div>
            </div>
          </div>
          <ng-template #emptyAppts>
            <p class="text-muted text-center" style="padding:24px 0">No appointments yet.</p>
          </ng-template>
        </section>

        <section class="card">
          <h3 class="card-title mb-16">Users by role</h3>
          <div class="table-wrapper" style="border:none;box-shadow:none">
            <table class="data-table">
              <thead><tr><th>Role</th><th class="text-right">Count</th></tr></thead>
              <tbody>
                <tr *ngFor="let u of stats()?.users">
                  <td><span class="badge" [class]="badgeForRole(u.role)">{{ u.role }}</span></td>
                  <td class="text-right font-bold">{{ u.count }}</td>
                </tr>
                <tr *ngIf="!stats()?.users?.length"><td colspan="2" class="text-muted text-center">No data yet.</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section class="card mt-24">
        <h3 class="card-title">Quick actions</h3>
        <div class="quick-actions">
          <a routerLink="/super-admin/hospitals" class="qa">
            <span class="qa-icon" style="background:#ECFEFF;color:#155E75">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>
            </span>
            <div>
              <strong>Manage hospitals</strong>
              <p>Add, remove &amp; update plans</p>
            </div>
          </a>
          <a routerLink="/super-admin/doctors" class="qa">
            <span class="qa-icon" style="background:#FEF3C7;color:#92400E">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <div>
              <strong>All doctors</strong>
              <p>Across every hospital</p>
            </div>
          </a>
          <a routerLink="/super-admin/patients" class="qa">
            <span class="qa-icon" style="background:#D1FAE5;color:#065F46">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <div>
              <strong>All patients</strong>
              <p>Across every hospital</p>
            </div>
          </a>
          <a routerLink="/super-admin/payments" class="qa">
            <span class="qa-icon" style="background:#DBEAFE;color:#1E40AF">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </span>
            <div>
              <strong>Payments</strong>
              <p>Platform-wide transactions</p>
            </div>
          </a>
        </div>
      </section>
    </ng-container>

    <ng-template #loadingTpl>
      <app-loading></app-loading>
    </ng-template>
  </div>
  `,
  styles: [`
    .bar-list { display: flex; flex-direction: column; gap: 14px; }
    .bar-row { display: grid; grid-template-columns: 100px 1fr 40px; align-items: center; gap: 12px; font-size: 14px; }
    .bar-label { font-weight: 600; color: var(--color-text-muted); }
    .bar-track { background: var(--color-surface-alt); border-radius: 999px; height: 10px; overflow: hidden; }
    .bar-fill  { height: 100%; border-radius: 999px; transition: width .4s ease; }
    .bar-fill.bar-success { background: var(--color-success); }
    .bar-fill.bar-warning { background: var(--color-warning); }
    .bar-fill.bar-danger  { background: var(--color-danger); }
    .bar-fill.bar-info    { background: var(--color-info); }
    .bar-fill.bar-neutral { background: var(--color-text-subtle); }
    .bar-count { text-align: right; font-weight: 700; }

    .quick-actions { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 12px; }
    @media (max-width: 700px) { .quick-actions { grid-template-columns: 1fr; } }
    .qa {
      display: flex; gap: 14px; align-items: center;
      padding: 14px; border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-surface);
      text-decoration: none; color: inherit;
      transition: all .15s ease;
    }
    .qa:hover { border-color: var(--color-primary); box-shadow: var(--shadow-sm); text-decoration: none; }
    .qa strong { display: block; font-size: 14px; }
    .qa p { margin: 2px 0 0; font-size: 12.5px; color: var(--color-text-subtle); }
    .qa-icon {
      width: 44px; height: 44px; border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
  private readonly api = inject(SuperAdminService);
  private readonly tokens = inject(TokenService);

  readonly stats = signal<PlatformStats | null>(null);
  readonly loading = signal(true);

  readonly name = () => this.tokens.user()?.name?.split(' ')[0] ?? 'Super Admin';

  readonly iconBuilding = '<svg viewBox="0 0 24 24"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01"/></svg>';
  readonly iconUser     = '<svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
  readonly iconMoney    = '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>';

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: s => { this.stats.set(s); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  countByRole(role: string): number {
    return (this.stats()?.users || [])
      .filter(u => u.role === role)
      .reduce((sum, u) => sum + u.count, 0);
  }

  apptPct(count: number): number {
    const total = (this.stats()?.appointments || []).reduce((s, a) => s + a.count, 0) || 1;
    return Math.round((count / total) * 100);
  }

  barClass(status: string): string {
    return ({
      'Pending': 'bar-warning',
      'Approved': 'bar-info',
      'Completed': 'bar-success',
      'Cancelled': 'bar-danger'
    } as Record<string, string>)[status] || 'bar-neutral';
  }

  badgeForRole(role: string): string {
    return ({
      'SUPER_ADMIN': 'badge-primary',
      'ADMIN':       'badge-info',
      'DOCTOR':      'badge-success',
      'PATIENT':     'badge-warning'
    } as Record<string, string>)[role] || 'badge-neutral';
  }
}
