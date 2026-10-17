import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { DoctorCategory } from '../../core/models/doctor.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-manage-categories',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Doctor categories" subtitle="Manage medical specializations available on the platform."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <!-- Add form -->
      <section class="card">
        <h3 class="card-title mb-16">Add new category</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">Category name</label>
            <input class="form-control" formControlName="category_name" placeholder="e.g. Cardiologist">
          </div>
          <div class="form-group">
            <label class="form-label">Description (optional)</label>
            <textarea class="form-control" rows="3" formControlName="description" placeholder="Short description…"></textarea>
          </div>
          <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>
          <button type="submit" class="btn btn-primary" [disabled]="loading()">
            <span *ngIf="!loading()">Add category</span>
            <span *ngIf="loading()">Adding…</span>
          </button>
        </form>
      </section>

      <!-- List -->
      <section>
        <ng-container *ngIf="!initialLoading(); else loadingTpl">
          <div class="table-wrapper" *ngIf="categories().length; else emptyTpl">
            <table class="data-table">
              <thead>
                <tr><th>Name</th><th>Description</th><th class="text-right">Actions</th></tr>
              </thead>
              <tbody>
                <tr *ngFor="let c of categories()">
                  <td class="font-bold">{{ c.category_name }}</td>
                  <td class="text-muted">{{ c.description || '—' }}</td>
                  <td class="text-right">
                    <button class="btn btn-ghost btn-sm" (click)="edit(c)">Edit</button>
                    <button class="btn btn-ghost btn-sm" style="color:var(--color-danger)" (click)="remove(c)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <ng-template #emptyTpl>
            <div class="card">
              <app-empty-state title="No categories yet" message="Add your first category to get started."></app-empty-state>
            </div>
          </ng-template>
        </ng-container>
        <ng-template #loadingTpl><app-loading></app-loading></ng-template>
      </section>
    </div>

    <!-- Edit modal -->
    <div class="modal-backdrop" *ngIf="editing()" (click)="cancelEdit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>Edit category</h3>
        <form [formGroup]="editForm" (ngSubmit)="saveEdit()">
          <div class="form-group">
            <label class="form-label">Name</label>
            <input class="form-control" formControlName="category_name">
          </div>
          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea class="form-control" rows="3" formControlName="description"></textarea>
          </div>
          <div class="flex gap-12 justify-between">
            <button type="button" class="btn btn-secondary" (click)="cancelEdit()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  </div>
  `
})
export class ManageCategoriesComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly admin = inject(AdminService);

  readonly categories    = signal<DoctorCategory[]>([]);
  readonly loading       = signal(false);
  readonly initialLoading = signal(true);
  readonly error         = signal<string | null>(null);
  readonly editing       = signal<DoctorCategory | null>(null);

  form: FormGroup = this.fb.group({
    category_name: ['', Validators.required],
    description:   ['']
  });

  editForm: FormGroup = this.fb.group({
    category_name: ['', Validators.required],
    description:   ['']
  });

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.admin.listCategories().subscribe({
      next: cs => { this.categories.set(cs); this.initialLoading.set(false); },
      error: () => this.initialLoading.set(false)
    });
  }

  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.loading.set(true);
    this.error.set(null);
    this.admin.createCategory(this.form.value).subscribe({
      next: () => { this.form.reset(); this.loading.set(false); this.refresh(); },
      error: (err) => { this.loading.set(false); this.error.set(err?.message || 'Failed to add.'); }
    });
  }

  edit(c: DoctorCategory): void {
    this.editing.set(c);
    this.editForm.patchValue({ category_name: c.category_name, description: c.description || '' });
  }

  saveEdit(): void {
    const target = this.editing();
    if (!target || this.editForm.invalid) return;
    this.admin.updateCategory(target.id, this.editForm.value).subscribe({
      next: () => { this.editing.set(null); this.refresh(); },
      error: (err) => alert(err?.message || 'Update failed')
    });
  }

  cancelEdit(): void { this.editing.set(null); }

  remove(c: DoctorCategory): void {
    if (!confirm(`Delete category "${c.category_name}"? This will fail if any doctor is using it.`)) return;
    this.admin.deleteCategory(c.id).subscribe({
      next: () => this.refresh(),
      error: (err) => alert(err?.message || 'Delete failed')
    });
  }
}