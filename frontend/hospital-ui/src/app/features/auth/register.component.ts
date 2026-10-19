import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DoctorService } from '../../core/services/doctor.service';
import { HospitalService } from '../../core/services/hospital.service';
import { DoctorCategory } from '../../core/models/doctor.model';
import { HospitalOption } from '../../core/models/hospital.model';
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-shell">
    <div class="auth-hero">
      <a class="brand-mark" routerLink="/" style="font-size:1.4rem;text-decoration:none;color:#fff">
        MediCare<span style="color:#FCD34D">+</span>
      </a>
      <div>
        <h1>Join as a Patient.</h1>
        <p>Create your account in seconds. Book appointments with verified specialists and access your medical history anywhere.</p>
        <ul>
          <li>Free to create · No credit card</li>
          <li>Pick the hospital you want to register with</li>
          <li>Secure data · GDPR-aware</li>
        </ul>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.6);position:relative;z-index:2">
        Already a member? <a routerLink="/login" style="color:#FCD34D">Sign in</a>
      </div>
    </div>

    <div class="auth-form-wrap">
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Create patient account</h2>
        <p class="subtitle">Tell us a bit about yourself.</p>

        <!-- Hospital selection -->
        <div class="form-group">
          <label class="form-label">
            Register with hospital
            <span *ngIf="hospitals().length === 0" class="text-muted" style="font-weight:400"> — none yet</span>
          </label>

          <select class="form-control" formControlName="hospital_id">
            <option [ngValue]="''" disabled>
              {{ hospitals().length === 0
                  ? 'No hospitals available — buy a plan first'
                  : 'Select a hospital' }}
            </option>
            <option *ngFor="let h of hospitals()" [ngValue]="h.id">
              {{ h.hospitalName }}<ng-container *ngIf="h.city">  —  {{ h.city }}</ng-container>
              <ng-container *ngIf="h.planName">  ·  {{ h.planName }}</ng-container>
            </option>
          </select>

          <div *ngIf="hospitals().length === 0" class="text-muted" style="font-size:12px; margin-top:6px;">
            Hospitals appear here once they purchase a plan from
            <a href="../marketing-site/" target="_blank" rel="noopener">our pricing page</a>.
            Or click below to seed a few demo hospitals.
          </div>

          <button type="button" *ngIf="hospitals().length === 0"
                  class="btn btn-ghost btn-sm" style="margin-top:8px;"
                  (click)="seedDemoHospitals()">
            + Seed demo hospitals
          </button>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full name</label>
            <input class="form-control" formControlName="name" placeholder="Your full name">
          </div>
          <div class="form-group">
            <label class="form-label">Phone</label>
            <input class="form-control" formControlName="phone" placeholder="+91 98765 43210">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" type="email" formControlName="email" placeholder="you@example.com">
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Age</label>
            <input class="form-control" type="number" min="0" formControlName="age" placeholder="e.g. 32">
          </div>
          <div class="form-group">
            <label class="form-label">Gender</label>
            <select class="form-control" formControlName="gender">
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Blood group</label>
            <select class="form-control" formControlName="blood_group">
              <option value="">Unknown</option>
              <option *ngFor="let b of ['A+','A-','B+','B-','AB+','AB-','O+','O-']" [value]="b">{{ b }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <input class="form-control" type="password" formControlName="password" placeholder="At least 6 characters">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Address</label>
          <input class="form-control" formControlName="address" placeholder="City, state">
        </div>

        <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>

        <button type="submit" class="btn btn-primary btn-block btn-lg"
                [disabled]="loading() || form.invalid">
          <span *ngIf="!loading()">Create account</span>
          <span *ngIf="loading()">Creating…</span>
        </button>

        <p class="text-muted text-center mt-16" style="font-size:13px">
          By signing up you agree to our terms.
        </p>
      </form>
    </div>
  </div>
  `
})
export class RegisterComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly auth  = inject(AuthService);
  private readonly docs  = inject(DoctorService);
  private readonly hospitalsSvc = inject(HospitalService);
  private readonly router = inject(Router);

  readonly loading    = signal(false);
  readonly error      = signal<string | null>(null);
  readonly hospitals  = this.hospitalsSvc.hospitals;

  categories: DoctorCategory[] = [];

  form: FormGroup = this.fb.group({
    hospital_id: ['', Validators.required],
    name:        ['', Validators.required],
    email:       ['', [Validators.required, Validators.email]],
    password:    ['', [Validators.required, Validators.minLength(6)]],
    phone:       [''],
    age:         [null as number | null],
    gender:      [''],
    blood_group: [''],
    address:     ['']
  });

  ngOnInit(): void {
    this.docs.listCategories().subscribe({
      next: cs => this.categories = cs
    });
  }

  /** Insert a few sample hospitals so the dropdown has content for the demo. */
  seedDemoHospitals(): void {
    const existing = JSON.parse(localStorage.getItem('medicare_hospitals') ?? '[]');
    const samples: HospitalOption[] = [
      {
        id: 'HSP-DEMO-001',
        hospitalName: 'Sunshine Multispeciality Hospital',
        city: 'Bengaluru',
        planName: 'Professional'
      },
      {
        id: 'HSP-DEMO-002',
        hospitalName: 'Apollo City Clinic',
        city: 'Mumbai',
        planName: 'Basic'
      },
      {
        id: 'HSP-DEMO-003',
        hospitalName: 'Care & Cure Hospital',
        city: 'Delhi',
        planName: 'Enterprise'
      }
    ];
    const merged = [...existing, ...samples];
    localStorage.setItem('medicare_hospitals', JSON.stringify(merged));
    this.hospitalsSvc.refresh();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    const v = this.form.value as {
      hospital_id: string;
      name: string; email: string; password: string;
      phone?: string; age?: number | null; gender?: string;
      blood_group?: string; address?: string;
    };

    // Attach the chosen hospital's name so the backend (and any
    // downstream screens) know which hospital the patient belongs to.
    const hospital = this.hospitalsSvc.getById(v.hospital_id);

    // Normalize null → undefined and add hospital context.
    // The extra `hospital_id` / `hospital_name` fields travel along
    // harmlessly even when the backend ignores them.
    const payload = {
      name:          v.name,
      email:         v.email,
      password:      v.password,
      phone:         v.phone || undefined,
      age:           v.age ?? undefined,
      gender:        v.gender || undefined,
      blood_group:   v.blood_group || undefined,
      address:       v.address || undefined,
      hospital_id:   Number(v.hospital_id),
      hospital_name: hospital?.hospitalName ?? null
    } as unknown as Parameters<AuthService['patientSignup']>[0];

    this.auth.patientSignup(payload).subscribe({
      next: (res) => {
        this.loading.set(false);
        const user = (res as any).user ?? (res as any).data?.user;
        if (user) this.router.navigate(['/patient']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Registration failed.');
      }
    });
  }
}
