import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorProfile } from '../../core/models/doctor.model';
import { DoctorCategory } from '../../core/models/doctor.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent],
  template: `
  <div class="page">
    <app-page-header title="My profile" subtitle="Update your professional information visible to patients."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <section class="card" *ngIf="profile() as p">
        <h3 class="card-title mb-16">Read-only info</h3>
        <div class="kv"><span>Name</span><strong>{{ p.name }}</strong></div>
        <div class="kv"><span>Email</span><strong>{{ p.email }}</strong></div>
        <div class="kv"><span>Status</span><span class="badge" [class]="badgeFor(p.status)">{{ p.status }}</span></div>
        <div class="kv"><span>Joined</span><strong>{{ p.created_at | date:'mediumDate' }}</strong></div>
      </section>

      <section class="card">
        <h3 class="card-title mb-16">Edit details</h3>

        <ng-container *ngIf="!loading(); else loadingTpl">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label class="form-label">Speciality</label>
              <select class="form-control" formControlName="category_id">
                <option value="">Select category</option>
                <option *ngFor="let c of categories" [value]="c.id">{{ c.category_name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Qualification</label>
              <input class="form-control" formControlName="qualification">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Experience (years)</label>
                <input class="form-control" type="number" min="0" formControlName="experience">
              </div>
              <div class="form-group">
                <label class="form-label">Consultation fee (₹)</label>
                <input class="form-control" type="number" min="0" formControlName="consultation_fee">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Phone</label>
              <input class="form-control" formControlName="phone">
            </div>
            <div class="form-group">
              <label class="form-label">Clinic address</label>
              <input class="form-control" formControlName="address">
            </div>
            <div class="alert alert-success" *ngIf="success()">Profile updated.</div>
            <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>
            <button type="submit" class="btn btn-primary" [disabled]="saving() || form.invalid">
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
export class DoctorProfileComponent implements OnInit {
  private readonly fb   = inject(FormBuilder).nonNullable;
  private readonly docs = inject(DoctorService);

  readonly profile = signal<DoctorProfile | null>(null);
  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly success  = signal(false);
  readonly error    = signal<string | null>(null);

  categories: DoctorCategory[] = [];

  form: FormGroup = this.fb.group({
    category_id:      [''],
    qualification:    ['', Validators.required],
    experience:       [0],
    consultation_fee: [0],
    phone:            [''],
    address:          ['']
  });

  ngOnInit(): void {
    this.docs.listCategories().subscribe(cs => this.categories = cs);
    this.docs.getMyProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.form.patchValue({
          category_id: p.category_id,
          qualification: p.qualification,
          experience: p.experience,
          consultation_fee: p.consultation_fee,
          phone: p.phone || '',
          address: p.address || ''
        });
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const v = this.form.value;
    this.docs.updateMyProfile({
      category_id: v['category_id'] ? Number(v['category_id']) : undefined,
      qualification: v['qualification'],
      experience: Number(v['experience']),
      consultation_fee: Number(v['consultation_fee']),
      phone: v['phone'],
      address: v['address']
    }).subscribe({
      next: p => { this.profile.set(p); this.success.set(true); this.saving.set(false); },
      error: (err) => { this.error.set(err?.message || 'Update failed.'); this.saving.set(false); }
    });
  }

  badgeFor(status?: string): string {
    return ({
      'ACTIVE': 'badge-success',
      'PENDING': 'badge-warning',
      'BLOCKED': 'badge-danger'
    } as Record<string, string>)[status || ''] || 'badge-neutral';
  }
}