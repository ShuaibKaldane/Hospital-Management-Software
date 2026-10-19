import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DOCTOR' | 'PATIENT';

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
          <li>Super Admin · manage every hospital on the platform</li>
          <li>Admin · manage your hospital, doctors &amp; patients</li>
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

        <div class="role-switch role-switch-4">
          <button type="button" *ngFor="let r of roles" (click)="setRole(r)"
                  [class.active]="role() === r">
            {{ labelFor(r) }}
          </button>
        </div>

        <div class="form-group">
          <label class="form-label">Email</label>
          <input class="form-control" type="email" formControlName="email" [placeholder]="emailPlaceholder()" autocomplete="email">
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
          <span *ngIf="!loading()">Sign in as {{ labelFor(role()) }}</span>
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
      display: grid; gap: 4px;
      background: var(--color-surface-alt);
      padding: 4px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }
    .role-switch-4 { grid-template-columns: repeat(4, 1fr); }
    @media (max-width: 520px) { .role-switch-4 { grid-template-columns: repeat(2, 1fr); } }
    .role-switch button {
      padding: 10px 6px;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 12.5px;
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
  private readonly tokens = inject(TokenService);
  private readonly router = inject(Router);

  readonly roles: Role[] = ['SUPER_ADMIN', 'ADMIN', 'DOCTOR', 'PATIENT'];
  readonly role = signal<Role>('SUPER_ADMIN');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  labelFor(r: Role): string {
    return ({
      SUPER_ADMIN: 'Super Admin',
      ADMIN:       'Admin',
      DOCTOR:      'Doctor',
      PATIENT:     'Patient'
    } as Record<Role, string>)[r];
  }

  emailPlaceholder(): string {
    return this.role() === 'SUPER_ADMIN' ? 'admin@medicare.com' : 'you@hospital.com';
  }

  setRole(r: Role) {
    this.role.set(r);
    this.error.set(null);
    if (this.role() === 'SUPER_ADMIN' && !this.form.controls['email'].value) {
      this.form.patchValue({ email: 'admin@medicare.com', password: 'admin' });
    } else {
      this.form.patchValue({ email: '', password: '' });
    }
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

    const obs = role === 'SUPER_ADMIN' ? this.auth.superAdminLogin({ email, password })
              : role === 'ADMIN'       ? this.auth.adminLogin({ email, password })
              : role === 'DOCTOR'      ? this.auth.doctorLogin({ email, password })
                                       : this.auth.patientLogin({ email, password });

    obs.subscribe({
      next: (res) => {
        this.loading.set(false);
        const user = (res as any).user || (res as any).data?.user;
        const target = user.role === 'SUPER_ADMIN' ? '/super-admin'
                     : user.role === 'ADMIN'       ? '/admin'
                     : user.role === 'DOCTOR'      ? '/doctor'
                                                   : '/patient';
        this.router.navigate([target]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.message || 'Sign in failed.');
      }
    });
  }
}
