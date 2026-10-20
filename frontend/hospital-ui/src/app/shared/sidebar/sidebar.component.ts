import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TokenService } from '../../core/services/token.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';

interface NavItem {
  label: string;
  link: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ThemeToggleComponent],
  template: `
  <aside class="sidebar">
    <div class="sidebar-header">
      <span class="dot"></span>
      <span class="role-label">{{ role() }}</span>
    </div>

    <nav class="nav">
      <a *ngFor="let item of items()"
         [routerLink]="item.link"
         routerLinkActive="active"
         [routerLinkActiveOptions]="{ exact: item.link.endsWith(rolePath()) }"
         class="nav-link">
        <span class="nav-icon" [innerHTML]="item.icon"></span>
        <span class="nav-label">{{ item.label }}</span>
      </a>
    </nav>

    <div class="sidebar-foot">
      <div class="help-card">
        <strong>Need help?</strong>
        <p>Reach support@medicare.app or call +91 800-MEDICARE.</p>
      </div>
      <app-theme-toggle></app-theme-toggle>
    </div>
  </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-w);
      background: linear-gradient(180deg, #0E7490 0%, #115E59 100%);
      color: #E0F2FE;
      padding: 22px 16px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
    }

    .sidebar-header {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 10px;
    }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: #FCD34D; box-shadow: 0 0 0 3px rgba(252, 211, 77, 0.25); }
    .role-label { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; font-size: 12px; color: #fff; }

    .nav { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }

    .nav-link {
      display: flex; align-items: center; gap: 12px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      color: rgba(255,255,255,0.85);
      font-weight: 500;
      font-size: 14px;
      transition: background 0.15s ease, color 0.15s ease;
      text-decoration: none;
    }
    .nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; text-decoration: none; }
    .nav-link.active {
      background: rgba(255,255,255,0.18);
      color: #fff;
      box-shadow: inset 3px 0 0 #FCD34D;
    }
    .nav-icon { display: inline-flex; width: 18px; height: 18px; }
    .nav-icon svg { width: 18px; height: 18px; stroke: currentColor; fill: none; stroke-width: 2; }
    .nav-label { flex: 1; }

    .sidebar-foot { margin-top: auto; }
    .help-card {
      background: rgba(255,255,255,0.08);
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      color: rgba(255,255,255,0.85);
    }
    .help-card strong { color: #fff; display: block; margin-bottom: 4px; font-size: 13px; }
    .help-card p { margin: 0; font-size: 12.5px; line-height: 1.45; color: rgba(255,255,255,0.75); }

    @media (max-width: 900px) {
      .sidebar { display: none; }
    }
  `]
})
export class SidebarComponent {
  private readonly tokens = inject(TokenService);

  readonly role = computed(() => this.tokens.user()?.role ?? 'GUEST');

  readonly rolePath = computed(() => {
    const r = this.tokens.user()?.role;
    if (!r) return '';
    if (r === 'SUPER_ADMIN') return 'super-admin';
    return r.toLowerCase();
  });

  readonly items = computed<NavItem[]>(() => {
    const r = this.role();
    const ICON = (path: string) => `<svg viewBox="0 0 24 24">${path}</svg>`;
    const DASH = ICON('<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>');
    const USERS = ICON('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>');
    const TAG = ICON('<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>');
    const CAL = ICON('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>');
    const MONEY = ICON('<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>');
    const RX = ICON('<path d="M3 12a9 9 0 1 0 9-9"/><polyline points="3 4 3 9 8 9"/><path d="M12 7v5l3 2"/>');
    const FILE = ICON('<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>');
    const PROFILE = ICON('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>');
    const BOOK = ICON('<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>');
    const CHART = ICON('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>');

    if (r === 'SUPER_ADMIN') {
      return [
        { label: 'Dashboard',   link: '/super-admin',          icon: DASH },
        { label: 'Hospitals',   link: '/super-admin/hospitals', icon: USERS },
        { label: 'Doctors',     link: '/super-admin/doctors',   icon: USERS },
        { label: 'Patients',    link: '/super-admin/patients',  icon: USERS },
        { label: 'Payments',    link: '/super-admin/payments',  icon: MONEY }
      ];
    }
    if (r === 'ADMIN') {
      return [
        { label: 'Dashboard',   link: '/admin',          icon: DASH },
        { label: 'Doctors',     link: '/admin/doctors',  icon: USERS },
        { label: 'Patients',    link: '/admin/patients', icon: USERS },
        { label: 'Categories',  link: '/admin/categories', icon: TAG },
        { label: 'Appointments',link: '/admin/appointments', icon: CAL },
        { label: 'Payments',    link: '/admin/payments', icon: MONEY },
        { label: 'Salary',      link: '/admin/salary',   icon: CHART }
      ];
    }
    if (r === 'DOCTOR') {
      return [
        { label: 'Dashboard',    link: '/doctor',            icon: DASH },
        { label: 'My Profile',   link: '/doctor/profile',    icon: PROFILE },
        { label: 'Appointments', link: '/doctor/appointments', icon: CAL },
        { label: 'Prescriptions',link: '/doctor/prescriptions', icon: RX },
        { label: 'Reports',      link: '/doctor/reports',    icon: FILE },
        { label: 'Earnings',     link: '/doctor/earnings',   icon: CHART }
      ];
    }
    if (r === 'PATIENT') {
      return [
        { label: 'Dashboard',    link: '/patient',            icon: DASH },
        { label: 'My Profile',   link: '/patient/profile',    icon: PROFILE },
        { label: 'Find Doctor',  link: '/patient/doctors',    icon: USERS },
        { label: 'Book',         link: '/patient/book',       icon: BOOK },
        { label: 'Appointments', link: '/patient/appointments', icon: CAL },
        { label: 'Prescriptions',link: '/patient/prescriptions', icon: RX },
        { label: 'Reports',      link: '/patient/reports',    icon: FILE },
        { label: 'Payments',     link: '/patient/payments',   icon: MONEY }
      ];
    }
    return [];
  });
}