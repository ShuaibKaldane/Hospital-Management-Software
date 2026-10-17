import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

type Role = 'ADMIN' | 'DOCTOR' | 'PATIENT';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
  <div class="auth-shell">
    <div class="auth-hero">
      <a class="brand-mark" routerLink="/" style="font-size:1.4rem;text-decoration:none;color:#fff">
        MediCare<span style="color:#FCD34D">+</span>
      </a>
      <div>
        <h1>Welcome back.<br/>Let's get you signed in.</h1>
        <p>Choose your role and enter your credentials. Your data is encrypted and protected with JWT authentication.</p>
        <ul>
          <li>Admin · manage the entire hospital</li>
          <li>Doctor · patients, prescriptions &amp; earnings</li>
          <li>Patient · appointments, reports &amp; prescriptions</li>
        </ul>
      </div>
      <div style="font-size:12px;color:rgba(255,255,255,0.6);position:relative;z-index:2">
        © 2026 MediCare+ · Crafted by Shuaib Kaldane
      </div>
    </div>

    <div class="auth-form-wrap">
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <h2>Sign in</h2>
        <p class="subtitle">Choose your role and continue.</p>

        <div class="role-switch">
          <button type="button" *ngFor="let r of roles" (click)="setRole(r)"
                  [class.active]="role() === r">
            {{ r === 'ADMIN' ? 'Admin' : r === 'DOCTOR' ? 'Doctor' : 'Patient' }}
          </button>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" type="email" formControlName="email" placeholder="you@hospital.com" autocomplete="email">
          <div class="form-error" *ngIf="form.controls['email'].touched && form.controls['email'].invalid">
            Valid email is required.
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input class="form-control" type="password" formControlName="password" placeholder="••••••••" autocomplete="current-password">
          <div class="form-error" *ngIf="form.controls['password'].touched && form.controls['password'].invalid">
            Password is required.
          </div>
        </div>

        <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>

        <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="loading()">
          <span *ngIf="!loading()">Sign in as {{ role() | titlecase }}</span>
          <span *ngIf="loading()">Signing in…</span>
        </button>

        <p class="text-muted text-center mt-16" style="font-size:13px">
          New here?
          <a routerLink="/register">Create a patient account</a>
          &nbsp;·&nbsp;
          <a routerLink="/doctor/signup">Apply as Doctor</a>
        </p>
      </form>
    </div>
  </div>
  `,
  styles: [`
    .role-switch {
      display: grid; grid-template-columns: repeat(3, 1fr);
      background: var(--color-surface-alt);
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }
    .role-switch button {
      padding: 10px 8px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      color: var(--color-text-muted);
      transition: all 0.15s ease;
    }
    .role-switch button:hover { color: var(--color-text); }
    .role-switch button.active {
      background: var(--color-surface);
      color: var(--color-primary-dark);
      box-shadow: var(--shadow-sm);
    }
  `]
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly roles: Role[] = ['ADMIN', 'DOCTOR', 'PATIENT'];
  readonly role = signal<Role>('ADMIN');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  setRole(r: Role) {
    this.role.set(r);
    this.error.set(null);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.value as { email: string; password: string };
    const role = this.role();

    const obs = role === 'ADMIN'   ? this.auth.adminLogin({ email, password })
              : role === 'DOCTOR'  ? this.auth.doctorLogin({ email, password })
                                   : this.auth.patientLogin({ email, password });

    obs.subscribe({
      next: (res) => {
        this.loading.set(false);
        const user = (res as any).user || (res as any).data?.user;
        this.router.navigate([`/${user.role.toLowerCase()}`]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Sign in failed.');
      }
    });
  }
}