import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { PrescriptionService } from '../../core/services/prescription.service';
import { Prescription, Medicine } from '../../core/models/prescription.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-patient-prescriptions',
  standalone: true,
  imports: [CommonModule, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="My prescriptions" subtitle="Digital prescriptions from your doctors."></app-page-header>

    <ng-container *ngIf="!loading(); else loadingTpl">
      <div *ngIf="prescriptions().length; else emptyTpl">
        <article class="rx-card" *ngFor="let p of prescriptions()">
          <div class="rx-head">
            <div>
              <div class="font-bold">{{ p.doctor_name }}</div>
              <div class="text-muted" style="font-size:12px">{{ p.created_at | date:'medium' }}</div>
            </div>
            <span class="badge badge-info">Prescription</span>
          </div>
          <p class="mt-8"><strong>Diagnosis:</strong> {{ p.diagnosis }}</p>
          <ul class="meds">
            <li *ngFor="let m of asArray(p.medicines)">
              <strong>{{ m.name }}</strong>
              <span *ngIf="m.dosage"> · {{ m.dosage }}</span>
              <span *ngIf="m.frequency"> · {{ m.frequency }}</span>
              <span *ngIf="m.duration"> · {{ m.duration }}</span>
            </li>
          </ul>
          <p *ngIf="p.advice" class="advice"><em>“{{ p.advice }}”</em></p>
        </article>
      </div>
      <ng-template #emptyTpl>
        <div class="card">
          <app-empty-state title="No prescriptions yet" message="Once your doctor writes one, it will appear here."></app-empty-state>
        </div>
      </ng-template>
    </ng-container>

    <ng-template #loadingTpl><app-loading></app-loading></ng-template>
  </div>
  `,
  styles: [`
    .rx-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 22px;
      box-shadow: var(--shadow-sm);
      margin-bottom: 14px;
    }
    .rx-head { display: flex; justify-content: space-between; align-items: center; }
    .meds { padding-left: 18px; margin: 8px 0; }
    .meds li { font-size: 13.5px; color: var(--color-text-muted); margin-bottom: 2px; }
    .advice { font-size: 13px; color: var(--color-text-muted); border-left: 3px solid var(--color-primary-soft); padding-left: 10px; margin-top: 8px; }
  `]
})
export class PatientPrescriptionsComponent implements OnInit {
  private readonly rx = inject(PrescriptionService);

  readonly prescriptions = signal<Prescription[]>([]);
  readonly loading       = signal(true);

  ngOnInit(): void {
    this.rx.myPrescriptions().subscribe({
      next: p => { this.prescriptions.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  asArray(m: Medicine[] | string | undefined): Medicine[] {
    if (!m) return [];
    if (Array.isArray(m)) return m;
    try { return JSON.parse(m); } catch { return []; }
  }
}