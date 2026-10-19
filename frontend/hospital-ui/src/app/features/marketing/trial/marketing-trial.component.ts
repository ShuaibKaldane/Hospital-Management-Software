import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  HospitalRecord,
  MarketingStoreService
} from '../../../core/services/marketing-store.service';
import { TrialService } from '../../../core/services/trial.service';

interface TrialFormShape {
  hospitalName: string;
  adminName:    string;
  adminEmail:   string;
  phone:        string;
  city:         string;
  address:      string;
}

@Component({
  selector: 'mkt-trial',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <section class="mkt-section" style="padding-top:72px;">
    <div class="mkt-narrow">

      <div class="mkt-section__head mkt-section__head--left" style="margin-bottom:28px;">
        <span class="mkt-section__eyebrow">Free 7-day trial</span>
        <h2>Activate your hospital in under a minute.</h2>
        <p>No credit card. No payment. Get full access for 7 days — we'll generate your super-admin
           credentials instantly and your hospital will show up in the patient sign-up dropdown.</p>
      </div>

      <div class="mkt-banner" style="margin-bottom:24px;">
        <div class="mkt-banner__icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <div style="flex:1;">
          <h3>What you'll get</h3>
          <p>Full admin access for 7 days, instant credentials, and your hospital listed for patients.
             After the trial you can upgrade to any paid plan or walk away — no auto-charge, ever.</p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="mkt-card" novalidate>

        <div class="mkt-field">
          <label>Hospital name <span class="req">*</span></label>
          <input formControlName="hospitalName" placeholder="e.g. Sunshine Multispeciality Hospital">
          <div class="err" data-err="hospitalName"></div>
        </div>

        <div class="mkt-field-row">
          <div class="mkt-field">
            <label>Admin full name <span class="req">*</span></label>
            <input formControlName="adminName" placeholder="Your full name">
            <div class="err" data-err="adminName"></div>
          </div>
          <div class="mkt-field">
            <label>Admin email <span class="req">*</span></label>
            <input formControlName="adminEmail" type="email" placeholder="admin@yourhospital.com">
            <div class="hint">This becomes your super-admin login.</div>
            <div class="err" data-err="adminEmail"></div>
          </div>
        </div>

        <div class="mkt-field-row">
          <div class="mkt-field">
            <label>Phone <span class="req">*</span></label>
            <input formControlName="phone" placeholder="+91 98765 43210">
            <div class="err" data-err="phone"></div>
          </div>
          <div class="mkt-field">
            <label>City <span class="req">*</span></label>
            <input formControlName="city" placeholder="e.g. Bengaluru">
            <div class="err" data-err="city"></div>
          </div>
        </div>

        <div class="mkt-field">
          <label>Full address</label>
          <textarea formControlName="address" rows="2" placeholder="Street, area, state, PIN code (optional)"></textarea>
        </div>

        @if (serverError()) {
          <div class="mkt-note" style="border-color: var(--mkt-danger, #ef4444); color: var(--mkt-danger, #ef4444);">
            <strong>Could not activate:</strong> {{ serverError() }}
          </div>
        }

        <button type="submit" class="mkt-btn mkt-btn--primary mkt-btn--block mkt-btn--lg mkt-mt-20"
                [disabled]="submitting()">
          @if (submitting()) {
            <span>Activating your trial…</span>
          } @else {
            <span>Activate my free trial</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          }
        </button>

        <p class="mkt-text-center" style="font-size:12px; color:var(--mkt-ink-5); margin:14px 0 0;">
          By activating a trial you agree to our terms. We never charge you during the trial — you can
          upgrade to a paid plan anytime from your admin dashboard.
        </p>
      </form>

      <div class="mkt-note mkt-text-center mkt-mt-20">
        Already love MediCare+? <a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}">Skip the trial and pick a plan →</a>
      </div>
    </div>
  </section>
  `
})
export class MarketingTrialComponent {
  private readonly fb     = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly store  = inject(MarketingStoreService);
  private readonly trialApi = inject(TrialService);

  readonly submitting  = signal(false);
  readonly serverError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    hospitalName: ['', Validators.required],
    adminName:    ['', Validators.required],
    adminEmail:   ['', [Validators.required, Validators.email]],
    phone:        ['', Validators.required],
    city:         ['', Validators.required],
    address:      ['']
  });

  submit(): void {
    this.serverError.set(null);

    const required: (keyof TrialFormShape)[] = ['hospitalName', 'adminName', 'adminEmail', 'phone', 'city'];
    let valid = true;
    for (const name of required) {
      const errEl = document.querySelector(`[data-err="${name}"]`);
      const ctrl  = this.form.controls[name as keyof TrialFormShape];
      const value = String(ctrl.value ?? '').trim();
      if (!value) {
        if (errEl) errEl.textContent = 'This field is required.';
        valid = false;
      } else if (name === 'adminEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        if (errEl) errEl.textContent = 'Please enter a valid email.';
        valid = false;
      } else if (errEl) {
        errEl.textContent = '';
      }
    }
    if (!valid) return;

    this.submitting.set(true);
    const v = this.form.value as TrialFormShape;

    this.trialApi.activate({
      hospitalName: v.hospitalName.trim(),
      adminName:    v.adminName.trim(),
      adminEmail:   v.adminEmail.trim(),
      phone:        v.phone.trim(),
      city:         v.city.trim(),
      address:      (v.address ?? '').trim()
    }).subscribe({
      next: (res) => {
        // Mirror marketing-store.addHospital so the patient-register
        // dropdown picks up the new tenant immediately.
        const record: HospitalRecord = {
          id:             res.hospitalId != null ? String(res.hospitalId) : ('HSP-' + Date.now().toString(36).toUpperCase()),
          hospitalName:   res.hospitalName,
          hospitalSlug:   this.store.slugify(res.hospitalName),
          city:           v.city.trim(),
          address:        (v.address ?? '').trim(),
          phone:          v.phone.trim(),
          adminName:      v.adminName.trim(),
          adminEmail:     res.adminEmail,
          adminPassword:  res.adminPassword,
          planId:         'professional',     // visual default — trial is plan-free at signup time
          planName:       '7-day free trial',
          planPrice:      0,
          billingCycle:   'monthly',
          transactionId:  'TRIAL-' + Date.now().toString(36).toUpperCase(),
          purchaseDate:   new Date().toISOString(),
          loginUrl:       res.loginUrl || '/login'
        };
        this.store.addHospital(record);

        this.router.navigate(['/marketing/success'], {
          queryParams: {
            hospital: record.hospitalName,
            plan:     'professional',
            email:    record.adminEmail,
            pass:     record.adminPassword,
            txn:      record.transactionId,
            city:     record.city,
            price:    0
          }
        });
      },
      error: (err) => {
        this.submitting.set(false);
        this.serverError.set(err?.message || 'Something went wrong. Please try again.');
      }
    });
  }
}
