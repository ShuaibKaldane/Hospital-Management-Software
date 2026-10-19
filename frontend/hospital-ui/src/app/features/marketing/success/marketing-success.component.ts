import { AfterViewInit, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  MarketingStoreService,
  PLANS,
  PlanId
} from '../../../core/services/marketing-store.service';
import { FileDownloadService } from '../../../core/services/file-download.service';

@Component({
  selector: 'mkt-success',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <section class="mkt-section" style="padding-top:64px;">
    <div class="mkt-narrow">

      <div class="mkt-banner">
        <div class="mkt-banner__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style="flex:1;">
          <h3>🎉 Your hospital is live on MediCare+</h3>
          <p>We've activated your account and generated your super-admin credentials. Save them somewhere safe.</p>
        </div>
      </div>

      <div class="mkt-card">
        <h3 class="mkt-card__title">Super-admin credentials</h3>
        <p class="mkt-card__sub">
          Use these details to sign in as the administrator of <strong style="color:var(--mkt-ink)">{{ hospitalName() }}</strong>.
        </p>

        <div class="mkt-field-row">
          <div class="mkt-field">
            <label>Hospital</label>
            <input [value]="hospitalName()" readonly>
          </div>
          <div class="mkt-field">
            <label>Plan</label>
            <input [value]="planDisplay()" readonly>
          </div>
        </div>

        <div class="mkt-field-row">
          <div class="mkt-field">
            <label>Admin email</label>
            <input [value]="email()" readonly>
            <button class="mkt-copy-btn" type="button" (click)="copyField('email')">
              {{ copyLabel('email') }}
            </button>
          </div>
          <div class="mkt-field">
            <label>Admin password</label>
            <input [value]="password()" readonly>
            <button class="mkt-copy-btn" type="button" (click)="copyField('password')">
              {{ copyLabel('password') }}
            </button>
          </div>
        </div>

        <div class="mkt-field-row">
          <div class="mkt-field">
            <label>Transaction ID</label>
            <input [value]="txn()" readonly>
          </div>
          <div class="mkt-field">
            <label>Activated on</label>
            <input [value]="date()" readonly>
          </div>
        </div>

        <div class="mkt-action-grid">
          <button type="button" class="mkt-btn mkt-btn--primary mkt-btn--lg" (click)="download()">
            ⬇ Download credentials (.txt)
          </button>
          <button type="button" class="mkt-btn mkt-btn--outline mkt-btn--lg" (click)="copyAll()">
            {{ copyAllLabel() }}
          </button>
          <a routerLink="/login" class="mkt-btn mkt-btn--accent mkt-btn--lg">
            🔐 Go to admin login
          </a>
        </div>

        <div class="mkt-note">
          <strong>Heads up:</strong> Your credentials are <em>only</em> stored in this download.
          MediCare+ never emails passwords in plain text. If you lose this file, you can request
          a password reset from the login screen.
        </div>
      </div>

      <!-- File preview -->
      <div class="mkt-card mkt-mt-20">
        <h3 class="mkt-card__title">Your file preview</h3>
        <p class="mkt-card__sub">
          This is the exact content saved as <code>{{ fileName() }}</code>.
        </p>
        <pre class="mkt-cred-box">{{ fileContents() }}</pre>
      </div>

      <!-- What's next -->
      <div class="mkt-card mkt-mt-20">
        <h3 class="mkt-card__title">What's next?</h3>
        <ol style="padding-left:22px; color:var(--mkt-ink-2); line-height:1.9; margin:14px 0 0;">
          <li>Open the admin login page and sign in with the email + password above.</li>
          <li>Go to <strong>Settings → Profile</strong> and change your password.</li>
          <li>Add your doctors and set their consultation fees.</li>
          <li>
            From this moment, patients across India will see
            <strong>{{ hospitalName() }}</strong> in the sign-up dropdown.
          </li>
        </ol>

        <div class="mkt-action-grid mkt-mt-20">
          <a routerLink="/marketing" class="mkt-btn mkt-btn--outline">← Back to home</a>
          <a routerLink="/marketing/pricing" class="mkt-btn mkt-btn--ghost">Manage plan</a>
          <a routerLink="/register" class="mkt-btn mkt-btn--ghost">Patient sign-up ↗</a>
        </div>
      </div>

    </div>
  </section>
  `
})
export class MarketingSuccessComponent implements OnInit, AfterViewInit {
  private readonly route    = inject(ActivatedRoute);
  private readonly store    = inject(MarketingStoreService);
  private readonly downloader = inject(FileDownloadService);

  // Reactive snapshot of the credential block
  readonly hospitalName = signal<string>('Your Hospital');
  readonly email        = signal<string>('');
  readonly password     = signal<string>('');
  readonly txn          = signal<string>('');
  readonly date         = signal<string>('');
  readonly planDisplay  = signal<string>('');
  readonly fileName     = signal<string>('credentials.txt');
  readonly fileContents = signal<string>('');

  private readonly copyLabels = signal<Record<'email' | 'password' | 'all', string>>({
    email: 'Copy', password: 'Copy', all: '📋 Copy all'
  });
  copyLabel(field: 'email' | 'password'): string { return this.copyLabels()[field]; }
  copyAllLabel(): string { return this.copyLabels().all; }

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap;
    const hospital = q.get('hospital') ?? 'Your Hospital';
    const planId   = (q.get('plan') ?? 'professional') as PlanId;
    const plan     = PLANS[planId] ?? PLANS.professional;
    const email    = q.get('email') ?? ('admin@' + this.store.slugify(hospital) + '.in');
    const pass     = q.get('pass') ?? this.store.generatePassword(12);
    const txn      = q.get('txn')  ?? this.store.generateTransactionId();
    const city     = q.get('city') ?? '';
    const price    = parseInt(q.get('price') ?? String(plan.monthly), 10);

    this.hospitalName.set(hospital);
    this.email.set(email);
    this.password.set(pass);
    this.txn.set(txn);
    this.date.set(new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' }));
    this.planDisplay.set(plan.name + (city ? `  ·  ${city}` : ''));
    this.fileName.set(`medicare-${this.store.slugify(hospital)}-credentials.txt`);
    this.fileContents.set(this.buildFileContents({
      hospital, planName: plan.name, planPrice: price,
      purchaseDate: new Date().toISOString(),
      transactionId: txn, adminEmail: email, adminPassword: pass
    }));
  }

  ngAfterViewInit(): void {
    // Trigger auto-download shortly after rendering.
    setTimeout(() => this.download(), 600);
  }

  download(): void {
    this.downloader.downloadText(this.fileName(), this.fileContents());
  }

  async copyAll(): Promise<void> {
    const ok = await this.downloader.copyToClipboard(this.fileContents());
    this.flash('all', ok ? '✓ Copied!' : '📋 Copy all');
  }

  async copyField(field: 'email' | 'password'): Promise<void> {
    const text = field === 'email' ? this.email() : this.password();
    const ok = await this.downloader.copyToClipboard(text);
    this.flash(field, ok ? '✓ Copied' : 'Copy');
  }

  private flash(field: 'email' | 'password' | 'all', label: string): void {
    const labels = { ...this.copyLabels() };
    labels[field] = label;
    this.copyLabels.set(labels);
    setTimeout(() => {
      const cur = { ...this.copyLabels() };
      cur[field] = field === 'all' ? '📋 Copy all' : 'Copy';
      this.copyLabels.set(cur);
    }, 1600);
  }

  private buildFileContents(r: {
    hospital: string; planName: string; planPrice: number;
    purchaseDate: string; transactionId: string;
    adminEmail: string; adminPassword: string;
  }): string {
    const bar  = '='.repeat(56);
    const rule = '-'.repeat(56);
    const dt   = new Date(r.purchaseDate);
    const dateStr = dt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    return [
      bar,
      '   MediCare+ Hospital Activation Details',
      bar,
      '',
      `  Hospital Name  : ${r.hospital}`,
      `  Plan           : ${r.planName}`,
      `  Plan Price     : ${this.store.formatINR(r.planPrice)} / month`,
      `  Purchase Date  : ${dateStr}`,
      `  Transaction ID : ${r.transactionId}`,
      '',
      rule,
      '    SUPER ADMIN CREDENTIALS',
      rule,
      '',
      `    Email         : ${r.adminEmail}`,
      `    Password      : ${r.adminPassword}`,
      '',
      rule,
      `  Login URL      : ${window.location.origin}/login`,
      bar,
      '',
      '  IMPORTANT:',
      '  - Keep this file in a safe place — it is the only record of your',
      '    super-admin credentials.',
      "  - Sign in and change the password from your admin profile settings",
      '    once you log in for the first time.',
      '  - Patients across India will be able to select your hospital from',
      "    the registration screen once you've activated your account.",
      ''
    ].join('\n');
  }
}
