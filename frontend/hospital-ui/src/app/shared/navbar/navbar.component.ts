import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TokenService } from '../../core/services/token.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <header class="navbar">
    <a class="brand" [routerLink]="dashboardLink()">
      <span class="brand-icon">
        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M10 3h4v6h6v4h-6v6h-4v-6H4V9h6V3z" fill="currentColor"/></svg>
      </span>
      <span class="brand-text">MediCare<span class="plus">+</span></span>
    </a>

    <div class="spacer"></div>

    <div class="user-chip" *ngIf="user() as u">
      <div class="avatar">{{ initials() }}</div>
      <div class="user-meta">
        <div class="user-name">{{ u.name }}</div>
        <div class="user-role">{{ u.role }}</div>
      </div>
    </div>

    <button class="btn btn-ghost btn-sm" (click)="logout()">Sign out</button>
  </header>
  `,
  styles: [`
    .navbar {
      height: var(--navbar-h);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      display: flex; align-items: center; gap: 14px;
      padding: 0 24px;
      position: sticky; top: 0; z-index: 10;
    }
    .brand { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--color-text); }
    .brand-icon {
      width: 36px; height: 36px;
      display: inline-flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      color: #fff;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }
    .brand-text { font-family: var(--font-display); font-weight: 800; letter-spacing: -0.02em; font-size: 1.05rem; }
    .plus { color: var(--color-accent); }
    .spacer { flex: 1; }

    .user-chip { display: flex; align-items: center; gap: 10px; padding: 4px 10px; border-radius: var(--radius-md); }
    .avatar {
      width: 38px; height: 38px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      color: #fff; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 13px;
    }
    .user-name { font-weight: 600; font-size: 13px; line-height: 1.1; }
    .user-role { font-size: 11px; color: var(--color-text-subtle); text-transform: uppercase; letter-spacing: 0.05em; }
    @media (max-width: 600px) { .user-meta { display: none; } }
  `]
})
export class NavbarComponent {
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);

  readonly user = this.tokens.user;

  readonly initials = computed(() => {
    const name = this.user()?.name || '';
    return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase() || 'U';
  });

  readonly dashboardLink = computed(() => {
    const r = this.user()?.role?.toLowerCase();
    return r ? `/${r}` : '/';
  });

  logout(): void {
    this.tokens.clear();
    this.router.navigate(['/']);
  }
}