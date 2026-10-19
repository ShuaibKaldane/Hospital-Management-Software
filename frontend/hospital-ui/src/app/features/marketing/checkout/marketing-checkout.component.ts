import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
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
          <!-- Free-trial cross-sell -->
          <div class="mkt-trial-banner">
            <div class="mkt-trial-banner__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="10"/>
              </svg>
            </div>
            <div class="mkt-trial-banner__body">
              <strong>Not ready to commit?</strong>
              Start a <a routerLink="/marketing/trial">7-day free trial</a> instead — no card details needed.
            </div>
          </div>

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
            <div class="mkt-summary__head">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Order summary
            </div>

            <div class="mkt-summary__row">
              <span class="label">Plan</span>
              <span class="amount">{{ plan.name }}</span>
            </div>
            <div class="mkt-summary__row">
              <span class="label">Billing cycle</span>
              <span class="amount">{{ cycle() === 'annual' ? 'Annual · saved 17%' : 'Monthly' }}</span>
            </div>
            <div class="mkt-summary__row">
              <span class="label">Monthly</span>
              <span class="amount">{{ formatINR(monthly()) }}</span>
            </div>
            <div class="mkt-summary__row">
              <span class="label">GST ({{ (gstRate * 100).toFixed(0) }}%)</span>
              <span class="amount">{{ formatINR(gstAmt()) }}</span>
            </div>
            <div class="mkt-summary__row mkt-summary__total">
              <span class="label">Total today</span>
              <span class="amount">{{ formatINR(total()) }}</span>
            </div>

            <div class="mkt-summary__cycle" #cycleWrap>
              <label id="cycle-label">Billing cycle</label>
              <button type="button"
                      class="mkt-cycle"
                      [class.is-open]="cycleOpen()"
                      [attr.aria-expanded]="cycleOpen()"
                      aria-labelledby="cycle-label"
                      #cycleBtn
                      (click)="toggleCycle($event)">
                <span>{{ cycle() === 'annual' ? 'Annual — save up to 17%' : 'Monthly — best for trying out' }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              @if (cycleOpen()) {
                <ul class="mkt-cycle__menu" role="listbox" aria-labelledby="cycle-label"
                    [style.top.px]="cycleMenuTop()"
                    [style.left.px]="cycleMenuLeft()"
                    [style.width.px]="cycleMenuWidth()">
                  <li role="option"
                      [class.is-selected]="cycle() === 'monthly'"
                      [attr.aria-selected]="cycle() === 'monthly'"
                      (click)="selectCycle('monthly')">
                    <span class="mkt-cycle__opt-label">Monthly</span>
                    <span class="mkt-cycle__opt-sub">Best for trying out</span>
                    @if (cycle() === 'monthly') {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mkt-cycle__check"><polyline points="20 6 9 17 4 12"/></svg>
                    }
                  </li>
                  <li role="option"
                      [class.is-selected]="cycle() === 'annual'"
                      [attr.aria-selected]="cycle() === 'annual'"
                      (click)="selectCycle('annual')">
                    <span class="mkt-cycle__opt-label">Annual</span>
                    <span class="mkt-cycle__opt-sub">Save up to 17%</span>
                    @if (cycle() === 'annual') {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="mkt-cycle__check"><polyline points="20 6 9 17 4 12"/></svg>
                    }
                  </li>
                </ul>
              }
            </div>

            <button type="submit" class="mkt-btn mkt-btn--primary mkt-btn--block mkt-btn--lg"
                    [disabled]="submitting()">
              @if (submitting()) {
                <span>Processing…</span>
              } @else {
                <span>Complete purchase</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              }
            </button>

            <p class="mkt-summary__terms">
              By completing this purchase you agree to our terms. Cancel anytime — first 7 days free.
            </p>

            <div class="mkt-summary__trial">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <div>
                <strong>Want to try first?</strong>
                <a routerLink="/marketing/trial">Start a 7-day free trial</a> — no card details.
              </div>
            </div>
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

  /** Helper for the summary template. */
  cycle(): 'monthly' | 'annual' {
    return (this.form.controls['cycle'].value as 'monthly' | 'annual') ?? 'monthly';
  }

  /** Custom billing-cycle dropdown state (replaces native <select>). */
  cycleOpen = signal(false);
  cycleMenuTop    = signal(0);
  cycleMenuLeft   = signal(0);
  cycleMenuWidth  = signal(0);

  @ViewChild('cycleBtn', { static: false }) cycleBtnRef?: ElementRef<HTMLElement>;

  /** Toggle the menu and (re)compute its fixed-position coordinates. */
  toggleCycle(event?: MouseEvent): void {
    event?.stopPropagation();
    if (this.cycleOpen()) {
      this.cycleOpen.set(false);
      return;
    }
    const btn = this.cycleBtnRef?.nativeElement;
    if (btn) {
      const r = btn.getBoundingClientRect();
      this.cycleMenuTop.set(Math.round(r.bottom + 6));
      this.cycleMenuLeft.set(Math.round(r.left));
      this.cycleMenuWidth.set(Math.round(r.width));
    }
    this.cycleOpen.set(true);
  }

  /** Reposition on scroll/resize while open. */
  @HostListener('window:scroll')
  @HostListener('window:resize')
  repositionCycle(): void {
    if (!this.cycleOpen()) return;
    const btn = this.cycleBtnRef?.nativeElement;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    this.cycleMenuTop.set(Math.round(r.bottom + 6));
    this.cycleMenuLeft.set(Math.round(r.left));
    this.cycleMenuWidth.set(Math.round(r.width));
  }

  /** Close the dropdown when the user clicks anywhere outside the menu/button. */
  @HostListener('document:click')
  closeCycle(): void {
    if (this.cycleOpen()) this.cycleOpen.set(false);
  }

  /** Choose a cycle and close the menu. */
  selectCycle(c: 'monthly' | 'annual'): void {
    this.form.controls['cycle'].setValue(c);
    this.cycleOpen.set(false);
  }

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
