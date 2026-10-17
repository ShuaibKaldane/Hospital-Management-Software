import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { PatientProfile } from '../../core/models/patient.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-patient-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent],
  template: `
  <div class="page">
    <app-page-header title="My profile" subtitle="Keep your personal information up to date."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <section class="card" *ngIf="profile() as p">
        <h3 class="card-title mb-16">Account</h3>
        <div class="kv"><span>Name</span><strong>{{ p.name }}</strong></div>
        <div class="kv"><span>Email</span><strong>{{ p.email }}</strong></div>
        <div class="kv"><span>Status</span><span class="badge badge-success">{{ p.status }}</span></div>
      </section>

      <section class="card">
        <h3 class="card-title mb-16">Edit details</h3>

        <ng-container *ngIf="!loading(); else loadingTpl">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input class="form-control" formControlName="phone">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Age</label>
                <input class="form-control" type="number" min="0" formControlName="age">
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
            <div class="form-group">
              <label class="form-label">Blood group</label>
              <select class="form-control" formControlName="blood_group">
                <option value="">Unknown</option>
                <option *ngFor="let b of ['A+','A-','B+','B-','AB+','AB-','O+','O-']" [value]="b">{{ b }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Address</label>
              <input class="form-control" formControlName="address">
            </div>
            <div class="alert alert-success" *ngIf="success()">Profile updated.</div>
            <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>
            <button type="submit" class="btn btn-primary" [disabled]="saving()">
              <span *ngIf="!saving()">Save changes</span>
              <span *ngIf="saving()">Saving…</span>
            </button>
          </form>
        </ng-container>
        <ng-template #loadingTpl><app-loading></app-loading></ng-template>
      </section>
    </div>
  </div>
  `,
  styles: [`
    .kv { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid var(--color-border); font-size: 14px; }
    .kv:last-child { border-bottom: none; }
    .kv span { color: var(--color-text-muted); }
  `]
})
export class PatientProfileComponent implements OnInit {
  private readonly fb   = inject(FormBuilder).nonNullable;
  private readonly pat  = inject(PatientService);

  readonly profile = signal<PatientProfile | null>(null);
  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly success  = signal(false);
  readonly error    = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    phone:       [''],
    age:         [null as number | null],
    gender:      [''],
    blood_group: [''],
    address:     ['']
  });

  ngOnInit(): void {
    this.pat.getMyProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.form.patchValue({
          phone: p.phone || '',
          age: p.age ?? null,
          gender: p.gender || '',
          blood_group: p.blood_group || '',
          address: p.address || ''
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const v = this.form.value;
    this.pat.updateMyProfile({
      phone: v['phone'] || undefined,
      age: v['age'] ? Number(v['age']) : undefined,
      gender: v['gender'] || undefined,
      blood_group: v['blood_group'] || undefined,
      address: v['address'] || undefined
    }).subscribe({
      next: p => { this.profile.set(p); this.success.set(true); this.saving.set(false); },
      error: (err) => { this.error.set(err?.message || 'Update failed.'); this.saving.set(false); }
    });
  }
}