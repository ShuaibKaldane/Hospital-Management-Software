import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <!-- ===================== HERO ===================== -->
  <section class="hero">
    <div class="hero-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="grid-overlay"></div>
    </div>

    <nav class="top-nav">
      <a class="brand" routerLink="/">
        <span class="brand-icon">
          <svg viewBox="0 0 24 24" width="20" height="20"><path d="M10 3h4v6h6v4h-6v6h-4v-6H4V9h6V3z" fill="currentColor"/></svg>
        </span>
        <span class="brand-text">MediCare<span class="plus">+</span></span>
      </a>
      <div class="nav-actions">
        <a routerLink="/login"  class="btn btn-ghost">Sign in</a>
        <a routerLink="/register" class="btn btn-primary">Get started</a>
      </div>
    </nav>

    <div class="hero-inner">
      <span class="kicker">Hospital Management · v1.0</span>
      <h1>Run your hospital like a <span class="grad">modern clinic.</span></h1>
      <p>
        One platform for admins, doctors and patients — appointments, prescriptions,
        payments, reports, and salary management, all secured with role-based access.
      </p>
      <div class="hero-cta">
        <a routerLink="/login" class="btn btn-primary btn-lg">Sign in to dashboard</a>
        <a routerLink="/register" class="btn btn-secondary btn-lg">Create patient account</a>
      </div>

      <div class="hero-stats">
        <div><strong>3</strong><span>role-specific dashboards</span></div>
        <div><strong>JWT</strong><span>secure authentication</span></div>
        <div><strong>MySQL</strong><span>production database</span></div>
        <div><strong>REST</strong><span>documented API</span></div>
      </div>
    </div>
  </section>

  <!-- ===================== FEATURE STRIP ===================== -->
  <section class="features">
    <div class="feature-grid">
      <article class="feature" *ngFor="let f of features">
        <div class="feature-icon" [innerHTML]="f.icon"></div>
        <h3>{{ f.title }}</h3>
        <p>{{ f.body }}</p>
      </article>
    </div>
  </section>

  <!-- ===================== ROLES ===================== -->
  <section class="roles">
    <div class="roles-head">
      <span class="kicker">Choose your dashboard</span>
      <h2>Three portals, one platform</h2>
    </div>
    <div class="role-grid">
      <article class="role role-admin">
        <div class="role-head">
          <span class="role-badge">Admin</span>
          <h3>Full control</h3>
        </div>
        <ul>
          <li>Approve &amp; manage doctors</li>
          <li>Manage doctor categories</li>
          <li>View all appointments &amp; payments</li>
          <li>Issue salary, bonus &amp; deductions</li>
          <li>Track revenue &amp; report cards</li>
        </ul>
        <a routerLink="/login" class="btn btn-primary">Admin sign in</a>
      </article>

      <article class="role role-doctor">
        <div class="role-head">
          <span class="role-badge">Doctor</span>
          <h3>Practice toolkit</h3>
        </div>
        <ul>
          <li>Build &amp; update your profile</li>
          <li>Approve patient appointments</li>
          <li>Write digital prescriptions</li>
          <li>Review uploaded medical reports</li>
          <li>Track consultation earnings</li>
        </ul>
        <a routerLink="/doctor/signup" class="btn btn-secondary">Apply as Doctor</a>
      </article>

      <article class="role role-patient">
        <div class="role-head">
          <span class="role-badge">Patient</span>
          <h3>Care in your hand</h3>
        </div>
        <ul>
          <li>Browse doctors by category</li>
          <li>Book appointments online</li>
          <li>Upload &amp; view reports</li>
          <li>Read prescriptions anytime</li>
          <li>Pay consultation fees securely</li>
        </ul>
        <a routerLink="/register" class="btn btn-secondary">Create patient account</a>
      </article>
    </div>
  </section>

  <!-- ===================== FOOTER ===================== -->
  <footer class="foot">
    <div>
      <span class="brand-text">MediCare<span class="plus">+</span></span>
      <span class="foot-tag">Hospital Management System · Built with Angular, Node.js &amp; MySQL</span>
    </div>
    <div>© 2026 MediCare+ · Crafted by Shuaib Kaldane</div>
  </footer>
  `,
  styles: [`
    :host { display: block; }

    /* === HERO === */
    .hero {
      position: relative;
      overflow: hidden;
      background: linear-gradient(160deg, #0E7490 0%, #115E59 55%, #064E3B 100%);
      color: #fff;
      padding: 0 24px 96px;
    }
    .hero-bg { position: absolute; inset: 0; pointer-events: none; }
    .blob { position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.45; }
    .blob-1 { width: 480px; height: 480px; background: #14B8A6; top: -120px; left: -100px; }
    .blob-2 { width: 420px; height: 420px; background: #F59E0B; bottom: -160px; right: -80px; opacity: 0.3; }
    .grid-overlay {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 48px 48px;
      mask-image: radial-gradient(circle at center, black 30%, transparent 70%);
    }

    .top-nav {
      position: relative; z-index: 2;
      max-width: 1200px; margin: 0 auto;
      display: flex; justify-content: space-between; align-items: center;
      padding: 22px 0;
    }
    .brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; }
    .brand-icon {
      width: 36px; height: 36px;
      background: rgba(255,255,255,0.15);
      border-radius: var(--radius-md);
      display: inline-flex; align-items: center; justify-content: center;
      backdrop-filter: blur(10px);
    }
    .brand-text { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; letter-spacing: -0.02em; }
    .plus { color: #FCD34D; }
    .nav-actions { display: flex; gap: 8px; }
    .nav-actions .btn-ghost { color: #fff; }
    .nav-actions .btn-ghost:hover { background: rgba(255,255,255,0.1); }

    .hero-inner {
      position: relative; z-index: 2;
      max-width: 1200px; margin: 0 auto;
      padding-top: 64px;
      text-align: center;
    }
    .kicker {
      display: inline-block;
      background: rgba(255,255,255,0.12);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 12px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      font-weight: 600;
      backdrop-filter: blur(8px);
      margin-bottom: 18px;
    }
    .hero-inner h1 {
      font-size: clamp(2.2rem, 5.5vw, 3.6rem);
      line-height: 1.1;
      letter-spacing: -0.025em;
      color: #fff;
      max-width: 880px;
      margin: 0 auto 18px;
    }
    .grad {
      background: linear-gradient(135deg, #FCD34D 0%, #FB923C 100%);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .hero-inner p {
      max-width: 640px; margin: 0 auto 28px;
      color: rgba(255,255,255,0.86);
      font-size: 1.05rem;
    }
    .hero-cta { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

    .hero-stats {
      margin-top: 56px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      max-width: 900px; margin-left: auto; margin-right: auto;
    }
    .hero-stats > div {
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255,255,255,0.12);
      padding: 18px 16px;
      border-radius: var(--radius-lg);
      text-align: center;
    }
    .hero-stats strong {
      display: block;
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 800;
      color: #FCD34D;
    }
    .hero-stats span { font-size: 12.5px; color: rgba(255,255,255,0.8); }
    @media (max-width: 700px) { .hero-stats { grid-template-columns: repeat(2, 1fr); } }

    /* === FEATURES === */
    .features {
      max-width: 1200px;
      margin: -64px auto 0;
      padding: 0 24px;
      position: relative;
      z-index: 3;
    }
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 900px) { .feature-grid { grid-template-columns: 1fr; } }

    .feature {
      background: var(--color-surface);
      padding: 24px;
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-md);
      border: 1px solid var(--color-border);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .feature:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }
    .feature-icon {
      width: 44px; height: 44px;
      border-radius: var(--radius-md);
      background: var(--color-primary-soft);
      color: var(--color-primary-dark);
      display: inline-flex; align-items: center; justify-content: center;
      margin-bottom: 14px;
    }
    .feature-icon svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2; }
    .feature h3 { margin-bottom: 6px; }
    .feature p { font-size: 14px; margin: 0; }

    /* === ROLES === */
    .roles {
      max-width: 1200px;
      margin: 96px auto 64px;
      padding: 0 24px;
    }
    .roles-head { text-align: center; margin-bottom: 32px; }
    .roles-head h2 { font-size: clamp(1.6rem, 3.5vw, 2.2rem); }

    .role-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    @media (max-width: 900px) { .role-grid { grid-template-columns: 1fr; } }

    .role {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 28px;
      box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .role:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); }

    .role-head { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .role-badge {
      align-self: flex-start;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    .role-admin  .role-badge { background: var(--color-primary-soft); color: var(--color-primary-dark); }
    .role-doctor .role-badge { background: var(--color-info-soft);    color: #1E40AF; }
    .role-patient .role-badge { background: var(--color-success-soft); color: #065F46; }

    .role ul { list-style: none; padding: 0; margin: 0 0 24px; }
    .role li {
      padding: 6px 0 6px 22px;
      position: relative;
      font-size: 14px;
      color: var(--color-text-muted);
    }
    .role li::before {
      content: '✓';
      position: absolute; left: 0; top: 6px;
      width: 16px; height: 16px;
      background: var(--color-success-soft); color: var(--color-success);
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      font-size: 10px; font-weight: 800;
    }
    .role .btn { margin-top: auto; }

    /* === FOOT === */
    .foot {
      max-width: 1200px; margin: 0 auto;
      padding: 32px 24px;
      display: flex; justify-content: space-between; align-items: center;
      color: var(--color-text-muted); font-size: 13px;
      border-top: 1px solid var(--color-border);
      flex-wrap: wrap; gap: 12px;
    }
    .foot .brand-text { color: var(--color-text); }
    .foot-tag { margin-left: 12px; }
  `]
})
export class HomeComponent {
  readonly features = [
    {
      title: 'Smart appointments',
      body: 'Patients browse doctors, pick a slot and book in seconds. Doctors approve with one click.',
      icon: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>'
    },
    {
      title: 'Digital records',
      body: 'Upload medical reports and write prescriptions online — no paper, no lost files.',
      icon: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>'
    },
    {
      title: 'Secure payments',
      body: 'Pay consultation fees online. Doctors track every consultation earning in real time.',
      icon: '<svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
    }
  ];
}