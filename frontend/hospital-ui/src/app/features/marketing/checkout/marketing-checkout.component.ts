import { Component, DestroyRef, ElementRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  GST_RATE,
  HospitalRecord,
  MarketingStoreService,
  PLANS,
  Plan,
  PlanId
} from '../../../core/services/marketing-store.service';
import { CheckoutService } from '../../../core/services/checkout.service';

/** Marketing plan ids map to backend ids. Professional uses 'pro'. */
const PLAN_MAP: Record<PlanId, 'basic' | 'pro' | 'enterprise'> = {
  basic:        'basic',
  professional: 'pro',
  enterprise:   'enterprise'
};

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
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './marketing-checkout.component.html'
})
export class MarketingCheckoutComponent implements OnInit {
  private readonly fb      = inject(FormBuilder).nonNullable;
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly store   = inject(MarketingStoreService);
  private readonly checkoutApi = inject(CheckoutService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly submitting  = signal(false);
  readonly serverError = signal<string | null>(null);
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

  get annualSavingsPercent(): number {
    return Math.round((1 - this.plan.annualPerMonth / this.plan.monthly) * 100);
  }

  get includedFeatures(): string[] {
    return this.plan.features.filter(feature => feature.on).slice(0, 3).map(feature => feature.text);
  }

  subtotal(): number {
    return this.monthly() * (this.cycle() === 'annual' ? 12 : 1);
  }

  fieldError(name: string): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) return null;
    return name === 'adminEmail' && !control.hasError('required')
      ? 'Enter a valid email address.'
      : 'This field is required.';
  }

  private updateSummary(): void {
    this.monthly.set(this.store.monthlyFor(this.plan, this.cycle()));
    this.gstAmt.set(this.store.gstFor(this.subtotal()));
    this.total.set(this.subtotal() + this.gstAmt());
  }

  form: FormGroup = this.fb.group({
    hospitalName: ['', [Validators.required, Validators.pattern(/\S/)]],
    adminName:    ['', [Validators.required, Validators.pattern(/\S/)]],
    adminEmail:   ['', [Validators.required, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phone:        ['', [Validators.required, Validators.pattern(/\S/)]],
    city:         ['', [Validators.required, Validators.pattern(/\S/)]],
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

    const initialCycle = this.route.snapshot.queryParamMap.get('cycle') === 'annual' ? 'annual' : 'monthly';
    this.form.controls['cycle'].setValue(initialCycle);
    this.form.controls['cycle'].valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateSummary());
    this.updateSummary();
  }

  submit(): void {
    if (this.submitting()) return;
    this.form.markAllAsTouched();
    this.serverError.set(null);
    if (this.form.invalid) {
      const firstInvalid = Object.keys(this.form.controls).find(name => this.form.controls[name].invalid);
      this.element.nativeElement.querySelector<HTMLElement>(`[formControlName="${firstInvalid}"]`)?.focus();
      return;
    }

    this.submitting.set(true);

    const v = this.form.value as CheckoutFormShape;

    this.checkoutApi.activate({
      hospitalName: v.hospitalName.trim(),
      adminName:    v.adminName.trim(),
      adminEmail:   v.adminEmail.trim(),
      phone:        v.phone.trim(),
      city:         v.city.trim(),
      address:      (v.address ?? '').trim(),
      plan:         PLAN_MAP[this.plan.id],
      days:         v.cycle === 'annual' ? 365 : 30
    }).subscribe({
      next: (res) => {
        const transactionId = this.store.generateTransactionId();
        const cycle         = v.cycle;
        const monthlyAmount = this.store.monthlyFor(this.plan, cycle);

        // Mirror record to local store with the DB-assigned numeric id so
        // the doctor/patient signup dropdowns see the new tenant instantly.
        const record: HospitalRecord = {
          id:             String(res.hospitalId),
          hospitalName:   res.hospitalName,
          hospitalSlug:   this.store.slugify(res.hospitalName),
          city:           res.city,
          address:        res.address,
          phone:          res.phone,
          adminName:      v.adminName.trim(),
          adminEmail:     res.adminEmail,
          adminPassword:  res.adminPassword,
          planId:         this.plan.id,
          planName:       this.plan.name,
          planPrice:      monthlyAmount,
          billingCycle:   cycle,
          transactionId,
          purchaseDate:   new Date().toISOString(),
          loginUrl:       res.loginUrl
        };
        this.store.addHospital(record);

        this.router.navigate(['/marketing/success'], {
          queryParams: {
            hospital: record.hospitalName,
            plan:     record.planId,
            email:    record.adminEmail,
            pass:     record.adminPassword,
            txn:      record.transactionId,
            city:     record.city,
            price:    Math.round(record.planPrice)
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
