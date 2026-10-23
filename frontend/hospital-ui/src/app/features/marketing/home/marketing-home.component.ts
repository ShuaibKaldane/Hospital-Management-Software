import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface FeatureTile {
  icon: SafeHtml;
  title: string;
  copy: string;
  cta: string;
  /** Blue-family accent variant (icon tint + CTA color). */
  tone?: 'blue' | 'indigo' | 'sky' | 'cyan' | 'violet' | 'royal';
}

interface RoleCard {
  label: string;
  title: string;
  copy: string;
  bullets: string[];
}

interface UseCase {
  name: string;
  count: string;
}

@Component({
  selector: 'mkt-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <!-- ============================== HERO ============================== -->
  <section class="mkt-hero">
    <div class="mkt-hero__bg"></div>
    <div class="mkt-container mkt-hero__inner">

      <div class="mkt-hero__copy">
        <span class="mkt-eyebrow">
          <span class="dot"></span>
          Now powering 250+ hospitals across India
        </span>

        <h1 class="mkt-hero__title">
          One platform for every
          <span class="accent">hospital</span> workflow.
        </h1>

        <p class="mkt-hero__lead">
          From the front desk to the prescription pad — appointments, doctors,
          payments, salaries and reports, all in one place. Built for Indian
          hospitals. Priced in rupees. Ready the same day.
        </p>

        <div class="mkt-hero__ctas">
          <a routerLink="/marketing/pricing" class="mkt-btn mkt-btn--primary mkt-btn--lg">
            See plans &amp; pricing
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <a routerLink="/register" class="mkt-btn mkt-btn--outline mkt-btn--lg">
            Patient sign-up
          </a>
        </div>

        <div class="mkt-hero__meta">
          <div class="check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            7-day free trial
          </div>
          <div class="check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            No credit card required
          </div>
          <div class="check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Same-day setup
          </div>
        </div>
      </div>

      <div class="mkt-hero__art">
        <svg viewBox="0 0 600 480" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs>
            <linearGradient id="brand" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stop-color="#3B82F6"/>
              <stop offset="100%" stop-color="#1D4ED8"/>
            </linearGradient>
            <linearGradient id="brand-soft" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="var(--mkt-art-blue-soft, #DBEAFE)"/>
              <stop offset="100%" stop-color="var(--mkt-art-blue-tint, #EFF6FF)"/>
            </linearGradient>
            <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="var(--mkt-art-blue, #3B82F6)" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="var(--mkt-art-blue, #3B82F6)" stop-opacity="0"/>
            </linearGradient>
            <linearGradient id="skyFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="var(--mkt-art-sky, #0EA5E9)" stop-opacity="0.25"/>
              <stop offset="100%" stop-color="var(--mkt-art-sky, #0EA5E9)" stop-opacity="0"/>
            </linearGradient>
            <filter id="card" x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow dx="0" dy="14" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.16"/>
            </filter>
            <filter id="float" x="-30%" y="-30%" width="160%" height="180%">
              <feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.14"/>
            </filter>
          </defs>

          <!-- Page canvas -->
          <rect width="600" height="480" fill="var(--mkt-art-canvas, #FAFBFC)"/>

          <!-- ===================== Main dashboard panel ===================== -->
          <g filter="url(#card)">
            <rect x="36" y="60" width="470" height="370" rx="12" fill="var(--mkt-art-surface, #FFFFFF)"/>

            <!-- Browser chrome -->
            <rect x="36" y="60" width="470" height="34" fill="var(--mkt-art-chrome, #F8FAFC)" rx="12"/>
            <rect x="36" y="78" width="470" height="16" fill="var(--mkt-art-chrome, #F8FAFC)"/>
            <circle cx="54" cy="77" r="4" fill="#FF5F57"/>
            <circle cx="68" cy="77" r="4" fill="#FEBC2E"/>
            <circle cx="82" cy="77" r="4" fill="#28C840"/>
            <rect x="124" y="68" width="290" height="20" rx="10" fill="var(--mkt-art-surface, #FFFFFF)"/>
            <text x="142" y="82" font-family="Inter, sans-serif" font-size="10.5" fill="var(--mkt-art-muted, #64748B)">app.medicare-plus.in/admin/dashboard</text>

            <!-- Sidebar -->
            <rect x="36" y="94" width="112" height="336" fill="var(--mkt-art-surface, #FFFFFF)"/>
            <rect x="148" y="94" width="1" height="336" fill="var(--mkt-art-border, #E5EAF1)"/>

            <!-- Brand inside sidebar -->
            <g transform="translate(54, 110)">
              <rect width="22" height="22" rx="6" fill="url(#brand)"/>
              <path d="M7 11 h8 M11 7 v8" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <text x="30" y="11" font-family="Inter, sans-serif" font-size="12" font-weight="700" fill="var(--mkt-art-text, #0B1220)">MediCare+</text>
              <text x="30" y="22" font-family="Inter, sans-serif" font-size="9" fill="var(--mkt-art-subtle, #94A3B8)">Admin</text>
            </g>

            <!-- Active nav item -->
            <g transform="translate(46, 156)">
              <rect width="92" height="30" rx="8" fill="var(--mkt-art-blue-tint, #EFF6FF)"/>
              <rect x="8" y="8" width="14" height="14" rx="3" fill="url(#brand)"/>
              <rect x="13" y="11" width="4" height="2" fill="#FFFFFF"/>
              <rect x="14" y="10" width="2" height="4" fill="#FFFFFF"/>
              <text x="30" y="19" font-family="Inter, sans-serif" font-size="10.5" font-weight="600" fill="var(--mkt-art-blue-strong, #1D4ED8)">Dashboard</text>
            </g>

            <!-- Other nav items -->
            <g font-family="Inter, sans-serif" font-size="10.5" fill="var(--mkt-art-muted, #64748B)">
              <g transform="translate(46, 196)">
                <rect x="8" y="8" width="14" height="14" rx="3" fill="none" stroke="var(--mkt-art-outline, #CBD5E1)" stroke-width="1.4"/>
                <text x="30" y="19">Doctors</text>
              </g>
              <g transform="translate(46, 226)">
                <rect x="8" y="8" width="14" height="14" rx="3" fill="none" stroke="var(--mkt-art-outline, #CBD5E1)" stroke-width="1.4"/>
                <text x="30" y="19">Patients</text>
              </g>
              <g transform="translate(46, 256)">
                <rect x="8" y="8" width="14" height="14" rx="3" fill="none" stroke="var(--mkt-art-outline, #CBD5E1)" stroke-width="1.4"/>
                <text x="30" y="19">Appointments</text>
              </g>
              <g transform="translate(46, 286)">
                <rect x="8" y="8" width="14" height="14" rx="3" fill="none" stroke="var(--mkt-art-outline, #CBD5E1)" stroke-width="1.4"/>
                <text x="30" y="19">Reports</text>
              </g>
              <g transform="translate(46, 316)">
                <rect x="8" y="8" width="14" height="14" rx="3" fill="none" stroke="var(--mkt-art-outline, #CBD5E1)" stroke-width="1.4"/>
                <text x="30" y="19">Settings</text>
              </g>
            </g>

            <!-- Main content -->
            <!-- Page title -->
            <text x="166" y="116" font-family="Inter, sans-serif" font-size="14" font-weight="700" fill="var(--mkt-art-text, #0B1220)">Good morning, Dr. Ramesh 👋</text>
            <text x="166" y="133" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Here's what's happening at your hospital today.</text>

            <!-- Avatar (top right) -->
            <circle cx="478" cy="118" r="14" fill="url(#brand)"/>
            <text x="478" y="122" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" font-weight="700" fill="#FFFFFF">RP</text>

            <!-- 3 stat cards -->
            <g transform="translate(166, 148)">
              <rect width="106" height="72" rx="8" fill="var(--mkt-art-surface, #FFFFFF)" stroke="var(--mkt-art-border, #E5EAF1)"/>
              <text x="12" y="22" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Patients</text>
              <text x="12" y="48" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="var(--mkt-art-text, #0B1220)">128</text>
              <text x="56" y="48" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="var(--mkt-art-success, #059669)">↑ 12%</text>
              <polyline points="12,64 28,58 44,60 60,52 76,46 92,40" fill="none" stroke="var(--mkt-art-blue, #3B82F6)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </g>

            <g transform="translate(282, 148)">
              <rect width="106" height="72" rx="8" fill="var(--mkt-art-surface, #FFFFFF)" stroke="var(--mkt-art-border, #E5EAF1)"/>
              <text x="12" y="22" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Appointments</text>
              <text x="12" y="48" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="var(--mkt-art-text, #0B1220)">86</text>
              <text x="46" y="48" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="var(--mkt-art-success, #059669)">↑ 5%</text>
              <polyline points="12,64 28,60 44,55 60,52 76,55 92,48" fill="none" stroke="var(--mkt-art-sky, #0EA5E9)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </g>

            <g transform="translate(398, 148)">
              <rect width="92" height="72" rx="8" fill="var(--mkt-art-surface, #FFFFFF)" stroke="var(--mkt-art-border, #E5EAF1)"/>
              <text x="12" y="22" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Earnings</text>
              <text x="12" y="48" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="var(--mkt-art-text, #0B1220)">₹12.4L</text>
              <text x="64" y="48" font-family="Inter, sans-serif" font-size="10" font-weight="600" fill="var(--mkt-art-success, #059669)">↑ 8%</text>
              <polyline points="12,64 24,60 36,55 48,48 60,52 72,42 84,38" fill="none" stroke="var(--mkt-art-success, #10B981)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </g>

            <!-- Chart card -->
            <g transform="translate(166, 232)">
              <rect width="324" height="184" rx="8" fill="var(--mkt-art-surface, #FFFFFF)" stroke="var(--mkt-art-border, #E5EAF1)"/>
              <text x="14" y="22" font-family="Inter, sans-serif" font-size="11.5" font-weight="700" fill="var(--mkt-art-text, #0B1220)">Monthly visits</text>
              <text x="310" y="22" text-anchor="end" font-family="Inter, sans-serif" font-size="9.5" fill="var(--mkt-art-subtle, #94A3B8)">Last 6 months</text>

              <!-- Legend -->
              <g transform="translate(216, 16)">
                <circle cx="0" cy="0" r="4" fill="var(--mkt-art-blue, #3B82F6)"/>
                <text x="9" y="3" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Visits</text>
                <circle cx="58" cy="0" r="4" fill="var(--mkt-art-sky, #0EA5E9)"/>
                <text x="67" y="3" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Bookings</text>
              </g>

              <!-- Grid lines -->
              <g stroke="var(--mkt-art-grid, #F1F5F9)" stroke-width="1">
                <line x1="14" y1="68" x2="310" y2="68" stroke-dasharray="2 3"/>
                <line x1="14" y1="108" x2="310" y2="108" stroke-dasharray="2 3"/>
                <line x1="14" y1="148" x2="310" y2="148" stroke-dasharray="2 3"/>
                <line x1="14" y1="164" x2="310" y2="164"/>
              </g>

              <!-- Bars (Bookings) -->
              <g fill="var(--mkt-art-sky-soft, #BAE6FD)" rx="2">
                <rect x="38"  y="118" width="14" height="46" rx="2"/>
                <rect x="84"  y="102" width="14" height="62" rx="2"/>
                <rect x="130" y="110" width="14" height="54" rx="2"/>
                <rect x="176" y="92"  width="14" height="72" rx="2"/>
                <rect x="222" y="80"  width="14" height="84" rx="2"/>
                <rect x="268" y="58"  width="14" height="106" rx="2"/>
              </g>

              <!-- Highlighted current bar -->
              <rect x="268" y="58" width="14" height="106" rx="2" fill="var(--mkt-art-sky, #0EA5E9)"/>

              <!-- Line chart (Visits) with fill -->
              <path d="M45 130 L91 110 L137 118 L183 92 L229 76 L275 48 L275 164 L45 164 Z" fill="url(#lineFill)"/>
              <polyline points="45,130 91,110 137,118 183,92 229,76 275,48"
                       fill="none" stroke="var(--mkt-art-blue, #3B82F6)" stroke-width="2.2"
                       stroke-linecap="round" stroke-linejoin="round"/>

              <!-- Data points -->
              <g fill="var(--mkt-art-surface, #FFFFFF)" stroke="var(--mkt-art-blue, #3B82F6)" stroke-width="2">
                <circle cx="45"  cy="130" r="3"/>
                <circle cx="91"  cy="110" r="3"/>
                <circle cx="137" cy="118" r="3"/>
                <circle cx="183" cy="92"  r="3"/>
                <circle cx="229" cy="76"  r="3"/>
                <circle cx="275" cy="48"  r="4" fill="var(--mkt-art-blue, #3B82F6)" stroke="var(--mkt-art-surface, #FFFFFF)" stroke-width="2.5"/>
              </g>

              <!-- X axis labels -->
              <g font-family="Inter, sans-serif" font-size="9" fill="var(--mkt-art-subtle, #94A3B8)" text-anchor="middle">
                <text x="45"  y="178">May</text>
                <text x="91"  y="178">Jun</text>
                <text x="137" y="178">Jul</text>
                <text x="183" y="178">Aug</text>
                <text x="229" y="178">Sep</text>
                <text x="275" y="178">Oct</text>
              </g>
            </g>
          </g>

          <!-- ===================== Floating card 1 — Notification (top right) ===================== -->
          <g filter="url(#float)">
            <rect x="380" y="32" width="186" height="56" rx="12" fill="var(--mkt-art-surface, #FFFFFF)"/>
            <circle cx="406" cy="60" r="14" fill="var(--mkt-art-success-soft, #D1FAE5)"/>
            <path d="M400 60 l4 4 l8 -8" stroke="var(--mkt-art-success, #059669)" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="430" y="56" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="var(--mkt-art-text, #0B1220)">Payment received</text>
            <text x="430" y="72" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Dr. Aanya Verma · ₹1,200</text>
          </g>

          <!-- ===================== Floating card 2 — Earnings w/ sparkline (right middle) ===================== -->
          <g filter="url(#float)">
            <rect x="382" y="100" width="190" height="100" rx="14" fill="var(--mkt-art-surface, #FFFFFF)"/>
            <text x="402" y="124" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Earnings this month</text>
            <text x="402" y="154" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="var(--mkt-art-text, #0B1220)">₹12.4L</text>
            <g transform="translate(498, 144)">
              <rect width="48" height="18" rx="9" fill="var(--mkt-art-success-soft, #D1FAE5)"/>
              <text x="24" y="13" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" font-weight="700" fill="var(--mkt-art-success, #059669)">↑ 8.2%</text>
            </g>
            <!-- Sparkline area -->
            <path d="M402 188 L420 182 L438 178 L456 170 L474 168 L492 162 L510 156 L528 152 L546 144 L562 138 L562 196 L402 196 Z" fill="url(#skyFill)"/>
            <polyline points="402,188 420,182 438,178 456,170 474,168 492,162 510,156 528,152 546,144 562,138"
                      fill="none" stroke="var(--mkt-art-sky, #0EA5E9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="562" cy="138" r="3.5" fill="var(--mkt-art-surface, #FFFFFF)" stroke="var(--mkt-art-sky, #0EA5E9)" stroke-width="2"/>
          </g>

          <!-- ===================== Floating card 3 — Doctor active (bottom right) ===================== -->
          <g filter="url(#float)">
            <rect x="358" y="216" width="222" height="60" rx="12" fill="var(--mkt-art-surface, #FFFFFF)"/>
            <circle cx="385" cy="246" r="16" fill="url(#brand-soft)"/>
            <circle cx="385" cy="241" r="5" fill="var(--mkt-art-blue-strong, #1D4ED8)"/>
            <path d="M374 254 a11 11 0 0 1 22 0" fill="var(--mkt-art-blue-strong, #1D4ED8)"/>
            <text x="410" y="240" font-family="Inter, sans-serif" font-size="12" font-weight="600" fill="var(--mkt-art-text, #0B1220)">Dr. Aanya Verma</text>
            <text x="410" y="256" font-family="Inter, sans-serif" font-size="10" fill="var(--mkt-art-muted, #64748B)">Cardiology · 14 yrs exp</text>
            <g transform="translate(528, 234)">
              <rect width="42" height="20" rx="10" fill="var(--mkt-art-success-soft, #D1FAE5)"/>
              <text x="21" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="700" fill="var(--mkt-art-success-strong, #065F46)">Active</text>
            </g>
          </g>
        </svg>
      </div>

    </div>
  </section>

  <!-- ============================== STATS BAND ============================== -->
  <section class="mkt-stats-band">
    <div class="mkt-container">
      <div class="mkt-stats">
        <div class="mkt-stat">
          <div class="num"><span>250</span><sup>+</sup></div>
          <div class="lbl">Hospitals onboarded</div>
        </div>
        <div class="mkt-stat">
          <div class="num"><span>2,000</span><sup>+</sup></div>
          <div class="lbl">Doctors using it daily</div>
        </div>
        <div class="mkt-stat">
          <div class="num"><span>1.2</span><span class="unit">M</span></div>
          <div class="lbl">Appointments booked</div>
        </div>
        <div class="mkt-stat">
          <div class="num"><span>4.8</span><span class="unit">/5</span></div>
          <div class="lbl">Customer rating</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================== FEATURES BAND (dark) ============================== -->
  <section class="mkt-band mkt-band--clean">
    <div class="mkt-container">
      <div class="mkt-band__head">
        <span class="mkt-section__eyebrow mkt-section__eyebrow--accent">Built for the way you work</span>
        <h2>Every workflow your hospital runs — in one place.</h2>
        <p>Microsoft-grade reliability. Healthcare-grade security. The features your front desk, doctors and finance team actually use.</p>
      </div>

      <div class="mkt-feature-grid">
        @for (f of features; track f.title) {
          <a class="mkt-tile"
             [class]="'mkt-tile--' + (f.tone || 'blue')"
             [routerLink]="['/marketing/pricing']">

            <div class="mkt-tile__icon" [innerHTML]="f.icon"></div>

            <h3 class="mkt-tile__title">{{ f.title }}</h3>
            <p class="mkt-tile__copy">{{ f.copy }}</p>

            <span class="mkt-tile__cta">
              {{ f.cta }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </span>
          </a>
        }
      </div>
    </div>
  </section>

  <!-- ============================== ROLES ============================== -->
  <section class="mkt-section">
    <div class="mkt-container">
      <div class="mkt-band__head" style="text-align:left;">
        <span class="mkt-section__eyebrow">Built for everyone</span>
        <h2>One login. Three experiences.</h2>
        <p>Every user — admin, doctor or patient — gets a dashboard tailored to their day.</p>
      </div>

      <div class="mkt-role-grid">
        @for (r of roles; track r.label) {
          <article class="mkt-role-card">
            <div class="mkt-role-card__bar"></div>
            <div class="mkt-role-card__label">{{ r.label }}</div>
            <h3 class="mkt-role-card__title">{{ r.title }}</h3>
            <p class="mkt-role-card__copy">{{ r.copy }}</p>

            <ul class="mkt-role-card__list">
              @for (b of r.bullets; track b) {
                <li>{{ b }}</li>
              }
            </ul>

            <a [routerLink]="r.label === 'Patient' ? '/register' : (r.label === 'Doctor' ? '/doctor/signup' : '/login')"
               class="mkt-role-card__cta">
              {{ r.label === 'Patient' ? 'Sign up as patient' : (r.label === 'Doctor' ? 'Apply as doctor' : 'Admin sign-in') }}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </article>
        }
      </div>
    </div>
  </section>

  <!-- ============================== USE CASES ============================== -->
  <section class="mkt-section mkt-section--alt">
    <div class="mkt-container">
      <div class="mkt-band__head">
        <span class="mkt-section__eyebrow">Built for every kind of hospital</span>
        <h2>From solo practitioners to enterprise chains.</h2>
      </div>

      <div class="mkt-cases">
        @for (u of useCases; track u.name) {
          <a [routerLink]="['/marketing/pricing']" class="mkt-case">
            <div class="mkt-case__name">{{ u.name }}</div>
            <div class="mkt-case__count">{{ u.count }}</div>
            <div class="mkt-case__cta">
              See plans
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </div>
          </a>
        }
      </div>
    </div>
  </section>

  <!-- ============================== HOW IT WORKS ============================== -->
  <section class="mkt-section">
    <div class="mkt-container">
      <div class="mkt-band__head">
        <span class="mkt-section__eyebrow">How it works</span>
        <h2>From sign-up to your first patient.</h2>
        <p>Four steps. Your hospital is live the same day.</p>
      </div>

      <div class="mkt-flow">
        <div class="mkt-flow__step">
          <div class="mkt-flow__num">01</div>
          <h4>Pick a plan</h4>
          <p>Choose Basic, Professional or Enterprise based on your hospital's size.</p>
        </div>
        <div class="mkt-flow__step">
          <div class="mkt-flow__num">02</div>
          <h4>Pay &amp; activate</h4>
          <p>Pay in INR with UPI, card or net-banking. Download your admin credentials.</p>
        </div>
        <div class="mkt-flow__step">
          <div class="mkt-flow__num">03</div>
          <h4>Set up</h4>
          <p>Sign in, add doctors, set consultation fees and appointment timings.</p>
        </div>
        <div class="mkt-flow__step">
          <div class="mkt-flow__num">04</div>
          <h4>Go live</h4>
          <p>Patients find your hospital and book appointments. You're managing care.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================== TESTIMONIAL ============================== -->
  <section class="mkt-band mkt-band--clean">
    <div class="mkt-container mkt-narrow">
      <div class="mkt-quote">
        <div class="mkt-quote__rating" aria-label="5 out of 5 stars">
          @for (s of [1,2,3,4,5]; track s) {
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          }
          <span class="mkt-quote__rating-label">5.0 · 200+ admins</span>
        </div>

        <svg class="mkt-quote__mark" viewBox="0 0 56 44" fill="none" aria-hidden="true">
          <path d="M0 26C0 16 6 6 18 0L22 6C14 10 10 18 10 26h8v18H0V26zm32 0c0-10 6-20 18-26l4 6c-8 4-12 12-12 20h8v18H32V26z" fill="currentColor"/>
        </svg>

        <p class="mkt-quote__text">
          We switched to MediCare+ last quarter. Appointment no-shows dropped 38%,
          our doctors get their salary slips on time, and the front desk finally
          stopped drowning in paper. It paid for itself in the first month.
        </p>

        <div class="mkt-quote__rule"></div>

        <div class="mkt-quote__who">
          <div class="mkt-quote__avatar">RP</div>
          <div class="mkt-quote__meta">
            <div class="mkt-quote__name">Dr. Ramesh Patel</div>
            <div class="mkt-quote__role">Director, Sunshine Multispeciality Hospital · Bengaluru</div>
          </div>
          <div class="mkt-quote__verified" title="Verified admin">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Verified
          </div>
        </div>

        <div class="mkt-quote__trust">
          <span class="mkt-quote__trust-label">Trusted by administrators at</span>
          <div class="mkt-quote__trust-list">
            <span>Sunshine Hospital</span>
            <span class="dot"></span>
            <span>Apollo Clinic</span>
            <span class="dot"></span>
            <span>Care &amp; Cure</span>
            <span class="dot"></span>
            <span>Medanta</span>
            <span class="dot"></span>
            <span>Fortis</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================== PRICING TEASER ============================== -->
  <section class="mkt-section">
    <div class="mkt-container">
      <div class="mkt-band__head">
        <span class="mkt-section__eyebrow">Pricing</span>
        <h2>Simple plans in Indian Rupees.<br/>Cancel anytime.</h2>
        <p>Three plans that grow with your hospital. Annual billing saves you up to 20%.</p>
      </div>

      <div class="mkt-mini-plans">
        <div class="mkt-mini-plan mkt-mini-plan--trial">
          <div class="ribbon ribbon--trial">7 days</div>
          <div class="name">Free Trial</div>
          <div class="price"><span class="cur">₹</span><span class="amt num">0</span><span class="per">/7 days</span></div>
          <div class="tag">No card required. Cancel anytime.</div>
          <a routerLink="/marketing/trial" class="mkt-btn mkt-btn--primary mkt-btn--block">Start free trial</a>
        </div>
        <div class="mkt-mini-plan">
          <div class="name">Basic</div>
          <div class="price"><span class="cur">₹</span><span class="amt num">4,999</span><span class="per">/mo</span></div>
          <div class="tag">For small clinics &amp; solo practitioners</div>
          <a routerLink="/marketing/checkout" [queryParams]="{plan: 'basic'}" class="mkt-btn mkt-btn--outline mkt-btn--block">Choose Basic</a>
        </div>
        <div class="mkt-mini-plan is-featured">
          <div class="ribbon">Most popular</div>
          <div class="name">Professional</div>
          <div class="price"><span class="cur">₹</span><span class="amt num">14,999</span><span class="per">/mo</span></div>
          <div class="tag">For growing hospitals &amp; specialty clinics</div>
          <a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}" class="mkt-btn mkt-btn--primary mkt-btn--block">Choose Professional</a>
        </div>
        <div class="mkt-mini-plan">
          <div class="name">Enterprise</div>
          <div class="price"><span class="cur">₹</span><span class="amt num">49,999</span><span class="per">/mo</span></div>
          <div class="tag">For hospital chains &amp; large networks</div>
          <a routerLink="/marketing/checkout" [queryParams]="{plan: 'enterprise'}" class="mkt-btn mkt-btn--outline mkt-btn--block">Choose Enterprise</a>
        </div>
      </div>

      <div class="mkt-text-center mkt-mt-40">
        <a routerLink="/marketing/pricing" class="mkt-text-link">
          See the full feature comparison
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>
      </div>
    </div>
  </section>

  <!-- ============================== FINAL CTA ============================== -->
  <section class="mkt-final-cta">
    <!-- Decorative background marks -->
    <svg class="mkt-final-cta__deco mkt-final-cta__deco--left" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
      <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <path d="M100 60v80M60 100h80" stroke="rgba(255,255,255,0.10)" stroke-width="2" stroke-linecap="round"/>
    </svg>
    <svg class="mkt-final-cta__deco mkt-final-cta__deco--right" viewBox="0 0 200 200" fill="none" aria-hidden="true">
      <circle cx="100" cy="100" r="80" stroke="rgba(255,255,255,0.06)" stroke-width="1.5"/>
      <circle cx="100" cy="100" r="50" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      <path d="M100 60v80M60 100h80" stroke="rgba(255,255,255,0.10)" stroke-width="2" stroke-linecap="round"/>
    </svg>

    <div class="mkt-container mkt-narrow">
      <div class="mkt-final-cta__inner">
        <span class="mkt-final-cta__eyebrow">
          <span class="dot"></span>
          Ready when you are
        </span>

        <h2>Run your hospital the modern way.</h2>
        <p>
          Activate MediCare+ for your hospital today — most teams are taking appointments
          by tomorrow morning. 7-day free trial, no credit card, cancel anytime.
        </p>

        <div class="mkt-final-cta__buttons">
          <a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}"
             class="mkt-btn mkt-btn--accent mkt-btn--lg">
            Start your free trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <a routerLink="/marketing/pricing" class="mkt-btn mkt-btn--outline mkt-btn--lg">
            See all plans
          </a>
        </div>

        <div class="mkt-final-cta__trust">
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            7-day free trial
          </div>
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            No credit card
          </div>
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Same-day setup
          </div>
          <div class="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Cancel anytime
          </div>
        </div>

        <div class="mkt-final-cta__divider"></div>

        <div class="mkt-final-cta__stats">
          <div class="stat">
            <div class="num">250<span>+</span></div>
            <div class="lbl">Hospitals onboarded</div>
          </div>
          <div class="stat">
            <div class="num">2,000<span>+</span></div>
            <div class="lbl">Doctors on platform</div>
          </div>
          <div class="stat">
            <div class="num">4.8<span>★</span></div>
            <div class="lbl">Average admin rating</div>
          </div>
          <div class="stat">
            <div class="num">99.9<span>%</span></div>
            <div class="lbl">Uptime SLA</div>
          </div>
        </div>
      </div>
    </div>
  </section>
  `
})
export class MarketingHomeComponent {
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Wrap raw SVG markup in `SafeHtml` so Angular's HTML sanitizer
   * doesn't strip the `<svg>` element when injected via `[innerHTML]`.
   * The icons are static author-authored strings, so this is safe.
   */
  private trust = (svg: string): SafeHtml => this.sanitizer.bypassSecurityTrustHtml(svg);

  readonly features: FeatureTile[] = [
    {
      icon: this.trust(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`),
      title: 'Smart appointments',
      copy: 'Online slots, calendar view, automated SMS reminders. Patients book from your page; your front desk sees it instantly.',
      cta: 'See how it works',
      tone: 'blue'
    },
    {
      icon: this.trust(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`),
      title: 'Digital prescriptions',
      copy: 'Doctors write once. Patients view forever. Print, share or email.',
      cta: 'See sample Rx',
      tone: 'indigo'
    },
    {
      icon: this.trust(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="6" x2="12" y2="12"/><line x1="12" y1="12" x2="16" y2="14"/></svg>`),
      title: 'Salary & payroll',
      copy: 'Doctor payouts, consultation splits, monthly payroll, all on time.',
      cta: 'Explore payroll',
      tone: 'sky'
    },
    {
      icon: this.trust(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`),
      title: 'Secure payments',
      copy: 'UPI, cards, cash — every fee tracked with full audit trail.',
      cta: 'See payments',
      tone: 'cyan'
    },
    {
      icon: this.trust(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 13l4-4 4 4 5-5"/></svg>`),
      title: 'Reports & analytics',
      copy: 'Visits, revenue, doctor performance, patient outcomes — at a glance.',
      cta: 'See sample reports',
      tone: 'violet'
    },
    {
      icon: this.trust(`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2C20 17.5 12 22 12 22z"/><circle cx="12" cy="10" r="3"/></svg>`),
      title: 'Indian-first',
      copy: 'Pricing in INR, GST invoicing, Indian phone & address formats.',
      cta: 'See India benefits',
      tone: 'royal'
    }
  ];

  readonly roles: RoleCard[] = [
    {
      label: 'Admin',
      title: 'Full control of the hospital',
      copy: 'Manage doctors, approve signups, run payroll, view reports — all from one dashboard.',
      bullets: [
        'Add / edit doctors and categories',
        'Approve or reject doctor applications',
        'Manage salaries and consultation splits',
        'Detailed revenue & visit analytics'
      ]
    },
    {
      label: 'Doctor',
      title: 'Focus on patients, not paperwork',
      copy: 'See today\'s queue, write prescriptions in seconds, track every earning.',
      bullets: [
        'Today\'s appointments at a glance',
        'Patient history & uploaded reports',
        'Write & manage prescriptions',
        'Consultation earnings & salary tracker'
      ]
    },
    {
      label: 'Patient',
      title: 'Your health, organised',
      copy: 'Pick your hospital, book appointments online, store reports and prescriptions forever.',
      bullets: [
        'Find a doctor by category & city',
        'Book and reschedule with one click',
        'Upload medical reports securely',
        'Pay consultation fees online'
      ]
    }
  ];

  readonly useCases: UseCase[] = [
    { name: 'Multi-speciality hospitals', count: '40% of customers' },
    { name: 'Single-speciality clinics', count: '25% of customers' },
    { name: 'Dental & eye hospitals',   count: '15% of customers' },
    { name: 'Day-care & surgical centres', count: '10% of customers' },
    { name: 'Diagnostic labs',          count: '7%  of customers' },
    { name: 'Hospital chains',          count: '3%  of customers' }
  ];
}
