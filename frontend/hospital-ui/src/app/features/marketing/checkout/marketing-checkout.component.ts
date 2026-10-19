import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  GST_RATE,
  HospitalRecord,
  MarketingStoreService,
  PLANS,
  Plan,
  PlanId
} from '../../../core/services/marketing-store.service';

interface CheckoutFormShape {
  hospitalName: string;
  adminName:    string;
  adminEmail:   string;
  phone:        string;
  city:         string;
  address:      string;
  cardNumber:   string;
  cardName:     string;
  cardExpiry:   string;
  cardCvv:      string;
  cycle:        'monthly' | 'annual';
}

@Component({
  selector: 'mkt-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="mkt-section" style="padding-top:64px;">
    <div class="mkt-container">

      <div class="mkt-section__head mkt-section__head--left" style="margin-bottom:36px;">
        <span class="mkt-section__eyebrow">Activate your hospital</span>
        <h2>Complete your purchase</h2>
        <p>Fill in your hospital details and complete the (mock) payment to receive your admin credentials instantly.</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()" class="mkt-checkout" novalidate>

        <!-- LEFT: forms -->
        <div>
          <!-- 1. Hospital info -->
          <div class="mkt-card">
            <h3 class="mkt-card__title">1. Hospital details</h3>
            <p class="mkt-card__sub">These details will appear to patients when they pick your hospital during sign-up.</p>

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
              <textarea formControlName="address" rows="2" placeholder="Street, area, state, PIN code"></textarea>
            </div>
          </div>

          <!-- 2. Billing -->
          <div class="mkt-card">
            <h3 class="mkt-card__title">2. Payment</h3>
            <p class="mkt-card__sub">This is a demo checkout — no real card is charged. Payment integration with Razorpay / Stripe can be wired in later.</p>

            <div class="mkt-field-row">
              <div class="mkt-field">
                <label>Card number</label>
                <input formControlName="cardNumber" placeholder="4242 4242 4242 4242" inputmode="numeric" maxlength="19">
              </div>
              <div class="mkt-field">
                <label>Name on card</label>
                <input formControlName="cardName" placeholder="As shown on card">
              </div>
            </div>

            <div class="mkt-field-row">
              <div class="mkt-field">
                <label>Expiry (MM/YY)</label>
                <input formControlName="cardExpiry" placeholder="12/28" maxlength="5">
              </div>
              <div class="mkt-field">
                <label>CVV</label>
                <input formControlName="cardCvv" placeholder="123" inputmode="numeric" maxlength="4">
              </div>
            </div>

            <div class="mkt-note">
              <strong>Demo note:</strong> Your card is not validated and not stored. Click <em>Complete purchase</em>
              and your admin credentials will be generated instantly.
            </div>
          </div>
        </div>

        <!-- RIGHT: summary -->
        <div>
          <div class="mkt-summary">
            <h3 class="mkt-card__title" style="margin-bottom:6px;">Order summary</h3>
            <p class="mkt-card__sub">You're activating the <strong style="color:var(--mkt-ink);">{{ plan.name }}</strong> plan.</p>

            <div class="mkt-summary__row">
              <span>Plan</span>
              <span class="amount">{{ plan.name }}</span>
            </div>
            <div class="mkt-summary__row">
              <span>Monthly</span>
              <span class="amount">{{ formatINR(monthly()) }}</span>
            </div>
            <div class="mkt-summary__row">
              <span>GST ({{ (gstRate * 100).toFixed(0) }}%)</span>
              <span class="amount">{{ formatINR(gstAmt()) }}</span>
            </div>
            <div class="mkt-summary__row mkt-summary__total">
              <span>Total today</span>
              <span class="amount">{{ formatINR(total()) }}</span>
            </div>

            <div style="margin-top:22px;">
              <label style="font-size:0.85rem; font-weight:600; color:var(--mkt-ink-2); margin-bottom:8px; display:block;">Billing cycle</label>
              <select formControlName="cycle" class="mkt-field" style="margin-bottom:0;">
                <option value="monthly">Monthly · best for trying out</option>
                <option value="annual">Annual · save up to 20%</option>
              </select>
            </div>

            <button type="submit" class="mkt-btn mkt-btn--primary mkt-btn--block mkt-btn--lg mkt-mt-20"
                    [disabled]="submitting()">
              @if (submitting()) {
                <span>Processing…</span>
              } @else {
                <span>Complete purchase</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              }
            </button>

            <p class="mkt-text-center" style="font-size:12px; color:var(--mkt-ink-5); margin:14px 0 0;">
              By continuing you agree to our terms. Cancel anytime — first 7 days free.
            </p>
          </div>
        </div>

      </form>
    </div>
  </section>
  `
})
export class MarketingCheckoutComponent implements OnInit {
  private readonly fb      = inject(FormBuilder).nonNullable;
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly store   = inject(MarketingStoreService);

  readonly submitting = signal(false);
  readonly gstRate    = GST_RATE;
  readonly formatINR  = (n: number) => this.store.formatINR(n);

  plan: Plan = PLANS.professional;

  /** Effective monthly amount based on current cycle. */
  readonly monthly = signal(PLANS.professional.monthly);
  readonly gstAmt  = signal(Math.round(PLANS.professional.monthly * GST_RATE));
  readonly total   = signal(PLANS.professional.monthly + Math.round(PLANS.professional.monthly * GST_RATE));

  form: FormGroup = this.fb.group({
    hospitalName: ['', Validators.required],
    adminName:    ['', Validators.required],
    adminEmail:   ['', [Validators.required, Validators.email]],
    phone:        ['', Validators.required],
    city:         ['', Validators.required],
    address:      [''],
    cardNumber:   [''],
    cardName:     [''],
    cardExpiry:   [''],
    cardCvv:      [''],
    cycle:        ['monthly' as 'monthly' | 'annual']
  });

  ngOnInit(): void {
    const id = (this.route.snapshot.queryParamMap.get('plan') ?? 'professional') as PlanId;
    this.plan = PLANS[id] ?? PLANS.professional;

    this.form.controls['cycle'].valueChanges.subscribe((cycle: 'monthly' | 'annual') => {
      const m = this.store.monthlyFor(this.plan, cycle);
      this.monthly.set(m);
      this.gstAmt.set(this.store.gstFor(m));
      this.total.set(m + this.store.gstFor(m));
    });

    // Trigger once so summary matches initial cycle value
    const initialCycle = this.form.controls['cycle'].value as 'monthly' | 'annual';
    const m = this.store.monthlyFor(this.plan, initialCycle);
    this.monthly.set(m);
    this.gstAmt.set(this.store.gstFor(m));
    this.total.set(m + this.store.gstFor(m));
  }

  submit(): void {
    // Field validation
    const required: (keyof CheckoutFormShape)[] = ['hospitalName', 'adminName', 'adminEmail', 'phone', 'city'];
    let valid = true;
    for (const name of required) {
      const errEl = document.querySelector(`[data-err="${name}"]`);
      const ctrl  = this.form.controls[name as keyof CheckoutFormShape];
      const value = String(ctrl.value ?? '').trim();
      if (!value) {
        errEl?.textContent && (errEl.textContent = 'This field is required.');
        valid = false;
      } else if (name === 'adminEmail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errEl?.textContent && (errEl.textContent = 'Please enter a valid email.');
        valid = false;
      } else if (errEl) {
        errEl.textContent = '';
      }
    }
    if (!valid) return;

    this.submitting.set(true);

    const v = this.form.value as CheckoutFormShape;
    const adminPassword = this.store.generatePassword(12);
    const transactionId = this.store.generateTransactionId();
    const hospitalSlug  = this.store.slugify(v.hospitalName);
    const cycle         = v.cycle;
    const monthlyAmount = this.store.monthlyFor(this.plan, cycle);

    const record: HospitalRecord = {
      id:             'HSP-' + Date.now().toString(36).toUpperCase(),
      hospitalName:   v.hospitalName.trim(),
      hospitalSlug,
      city:           v.city.trim(),
      address:        (v.address ?? '').trim(),
      phone:          v.phone.trim(),
      adminName:      v.adminName.trim(),
      adminEmail:     v.adminEmail.trim(),
      adminPassword,
      planId:         this.plan.id,
      planName:       this.plan.name,
      planPrice:      monthlyAmount,
      billingCycle:   cycle,
      transactionId,
      purchaseDate:   new Date().toISOString(),
      loginUrl:       '/login'
    };

    this.store.addHospital(record);

    // Pass via query string to success page
    this.router.navigate(['/marketing/success'], {
      queryParams: {
        hospital:    record.hospitalName,
        plan:        record.planId,
        email:       record.adminEmail,
        pass:        record.adminPassword,
        txn:         record.transactionId,
        city:        record.city,
        price:       Math.round(record.planPrice)
      }
    });
  }
}
