import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DoctorService } from '../../core/services/doctor.service';
import { HospitalService, HospitalOption } from '../../core/services/hospital.service';
import { DoctorCategory } from '../../core/models/doctor.model';

@Component({
  selector: 'app-doctor-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-shell">
    <div class="auth-hero">
      <a class="brand-mark" routerLink="/" style="font-size:1.4rem;text-decoration:none;color:#fff">
        MediCare<span style="color:#FCD34D">+</span>
      </a>
      <div>
        <h1>Join as a Doctor.</h1>
        <p>Build your digital practice. Patients can find you, book consultations, and you manage everything from one dashboard.</p>
        <ul>
          <li>Apply to a specific hospital</li>
          <li>Hospital admin approval required</li>
          <li>Set your own consultation fee</li>
          <li>Manage appointments &amp; prescriptions</li>
        </ul>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.6);position:relative;z-index:2">
        Already approved? <a routerLink="/login" style="color:#FCD34D">Sign in</a>
      </div>
    </div>

    <div class="auth-form-wrap">
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Doctor application</h2>
        <p class="subtitle">Your account stays pending until the hospital admin approves you.</p>

        <div class="form-group">
          <label class="form-label">Hospital</label>
          <select class="form-control" #hospitalSel (change)="selectedHospitalId.set($any(hospitalSel).value)">
            <option value="">Select hospital</option>
            <option *ngFor="let h of hospitals()" [value]="h.id">{{ h.hospitalName }}{{ h.city ? ' · ' + h.city : '' }}</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full name</label>
            <input class="form-control" formControlName="name" placeholder="Dr. Jane Doe">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-control" formControlName="phone" placeholder="+91 98765 43210">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" type="email" formControlName="email" placeholder="you@hospital.com">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Speciality</label>
            <select class="form-control" formControlName="category_id">
              <option value="">Select category</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.category_name }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Qualification</label>
            <input class="form-control" formControlName="qualification" placeholder="MBBS, MD">
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Experience (yrs)</label>
            <input class="form-control" type="number" min="0" formControlName="experience">
          </div>
          <div class="form-group">
            <label class="form-label">Consultation fee (₹)</label>
            <input class="form-control" type="number" min="0" formControlName="consultation_fee" placeholder="e.g. 500">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Clinic address</label>
          <input class="form-control" formControlName="address" placeholder="City, state">
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-control" type="password" formControlName="password" placeholder="At least 6 characters">
        </div>

        <div class="alert alert-info" *ngIf="info()">{{ info() }}</div>
        <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading() || form.invalid">
          <span *ngIf="!loading()">Submit application</span>
          <span *ngIf="loading()">Submitting…</span>
        </button>
      </form>
    </div>
  </div>
  `
})
export class DoctorSignupComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly auth  = inject(AuthService);
  private readonly docs  = inject(DoctorService);
  private readonly hospitalsSvc = inject(HospitalService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  readonly info    = signal<string | null>(null);
  readonly selectedHospitalId = signal<string>('');

  categories: DoctorCategory[] = [];
  readonly hospitals = this.hospitalsSvc.hospitals;

  form: FormGroup = this.fb.group({
    name:             ['', Validators.required],
    email:            ['', [Validators.required, Validators.email]],
    password:         ['', [Validators.required, Validators.minLength(6)]],
    phone:            [''],
    category_id:      [null as number | null, Validators.required],
    qualification:    ['', Validators.required],
    experience:       [0],
    consultation_fee: [0],
    address:          ['']
  });

  ngOnInit(): void {
    this.docs.listCategories().subscribe({
      next: cs => this.categories = cs
    });
    // Re-fetch in case the page was opened before the initial load finished.
    this.hospitalsSvc.refresh();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const hospitalId = Number(this.selectedHospitalId());
    if (!Number.isFinite(hospitalId) || hospitalId <= 0) {
      this.error.set('Please pick a hospital.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.info.set(null);

    const v = this.form.value as any;
    const payload = { ...v, hospital_id: hospitalId };

    this.auth.doctorSignup(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.info.set('Application submitted! The hospital admin will review and approve your account. You will be able to sign in once approved.');
        this.form.reset();
        this.selectedHospitalId.set('');
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Submission failed.');
      }
    });
  }
}
