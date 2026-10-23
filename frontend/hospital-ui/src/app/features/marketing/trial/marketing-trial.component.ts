import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
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

const requiredText: ValidatorFn = (control) =>
  String(control.value ?? '').trim() ? null : { required: true };

@Component({
  selector: 'mkt-trial',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './marketing-trial.component.html',
  styleUrl: './marketing-trial.component.css'
})
export class MarketingTrialComponent {
  private readonly fb     = inject(FormBuilder).nonNullable;
  private readonly router = inject(Router);
  private readonly store  = inject(MarketingStoreService);
  private readonly trialApi = inject(TrialService);
  private readonly trialForm = viewChild<ElementRef<HTMLFormElement>>('trialForm');

  readonly submitting  = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.group({
    hospitalName: ['', requiredText],
    adminName:    ['', requiredText],
    adminEmail:   ['', [requiredText, Validators.email, Validators.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)]],
    phone:        ['', requiredText],
    city:         ['', requiredText],
    address:      ['']
  });

  fieldError(name: keyof TrialFormShape): string | null {
    const control = this.form.controls[name];
    if (!control.touched || control.valid) return null;
    return control.hasError('required')
      ? 'This field is required.'
      : 'Please enter a valid email address.';
  }

  submit(): void {
    if (this.submitting()) return;
    this.serverError.set(null);

    const values = this.form.getRawValue();
    for (const name of Object.keys(values) as (keyof TrialFormShape)[]) {
      this.form.controls[name].setValue(values[name].trim());
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.trialForm()?.nativeElement.querySelector<HTMLInputElement>('input.ng-invalid')?.focus();
      return;
    }

    this.submitting.set(true);
    const v = this.form.getRawValue();

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
