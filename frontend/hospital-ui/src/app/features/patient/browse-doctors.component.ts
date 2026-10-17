import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { DoctorProfile, DoctorCategory } from '../../core/models/doctor.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-browse-doctors',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Find a doctor" subtitle="Browse specialists by name or category."></app-page-header>

    <div class="card mb-16">
      <form [formGroup]="form" class="filters">
        <div class="form-group">
          <label class="form-label">Search</label>
          <input class="form-control" formControlName="search" placeholder="Dr. Jane…">
        </div>
        <div class="form-group">
          <label class="form-label">Speciality</label>
          <select class="form-control" formControlName="category_id">
            <option value="">All categories</option>
            <option *ngFor="let c of categories" [value]="c.id">{{ c.category_name }}</option>
          </select>
        </div>
      </form>
    </div>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div class="grid grid-3" *ngIf="doctors().length; else emptyTpl">
        <article class="doc-card" *ngFor="let d of doctors()">
          <div class="doc-head">
            <div class="avatar">{{ initials(d.name) }}</div>
            <span class="badge badge-info">{{ d.category_name }}</span>
          </div>
          <h4>{{ d.name }}</h4>
          <p class="qual">{{ d.qualification }}</p>
          <div class="meta">
            <div><span>{{ d.experience }}</span><label>years exp.</label></div>
            <div><span>₹ {{ d.consultation_fee | number:'1.0-0' }}</span><label>consultation</label></div>
          </div>
          <button class="btn btn-primary btn-block" (click)="book(d)">Book appointment</button>
        </article>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No doctors match" message="Try clearing your filters."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .filters { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
    .filters .form-group { margin-bottom: 0; }
    @media (max-width: 700px) { .filters { grid-template-columns: 1fr; } }

    .doc-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 20px;
      box-shadow: var(--shadow-sm);
      display: flex; flex-direction: column; gap: 10px;
      transition: all .15s ease;
    }
    .doc-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
    .doc-head { display: flex; justify-content: space-between; align-items: center; }
    .avatar {
      width: 44px; height: 44px; border-radius: 50%;
      background: linear-gradient(135deg, #0E7490, #155E75);
      color: #fff; display: inline-flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 14px;
    }
    .doc-card h4 { margin: 0; }
    .qual { color: var(--color-text-muted); font-size: 13px; margin: 0; }
    .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 10px 0; border-top: 1px solid var(--color-border); border-bottom: 1px solid var(--color-border); }
    .meta span { display: block; font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; }
    .meta label { font-size: 11px; color: var(--color-text-subtle); text-transform: uppercase; letter-spacing: 0.05em; }
  `]
})
export class BrowseDoctorsComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly docs  = inject(DoctorService);
  private readonly router = inject(Router);

  readonly doctors = signal<DoctorProfile[]>([]);
  readonly loading = signal(true);
  categories: DoctorCategory[] = [];

  form: FormGroup = this.fb.group({
    search:      [''],
    category_id: ['']
  });

  ngOnInit(): void {
    this.docs.listCategories().subscribe(cs => this.categories = cs);
    this.refresh();
    this.form.valueChanges.subscribe(() => this.refresh());
  }

  refresh(): void {
    this.loading.set(true);
    const v = this.form.value;
    this.docs.listDoctors({
      status: 'ACTIVE',
      search: v['search'] || undefined,
      category_id: v['category_id'] ? Number(v['category_id']) : undefined
    }).subscribe({
      next: ds => { this.doctors.set(ds); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  book(d: DoctorProfile): void {
    this.router.navigate(['/patient/book'], { queryParams: { doctor: d.user_id } });
  }

  initials(name: string): string {
    return name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  }
}