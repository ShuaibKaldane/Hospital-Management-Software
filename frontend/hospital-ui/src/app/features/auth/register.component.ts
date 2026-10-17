import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorCategory } from '../../core/models/doctor.model';

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
          <li>Verified doctors only</li>
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

        <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading() || form.invalid">
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
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);
  categories: DoctorCategory[] = [];

  form: FormGroup = this.fb.group({
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

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);

    this.auth.patientSignup(this.form.value).subscribe({
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