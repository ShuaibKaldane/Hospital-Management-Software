import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray, FormControl } from '@angular/forms';
import { PrescriptionService } from '../../core/services/prescription.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { Prescription, Medicine } from '../../core/models/prescription.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-doctor-prescriptions',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, PageHeaderComponent, LoadingComponent, EmptyStateComponent],
  template: `
  <div class="page">
    <app-page-header title="Prescriptions" subtitle="Write new prescriptions and review your history."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <!-- Write new -->
      <section class="card">
        <h3 class="card-title mb-16">Write prescription</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">Appointment</label>
            <select class="form-control" formControlName="appointment_id">
              <option value="">Select an approved appointment</option>
              <option *ngFor="let a of eligibleAppts()" [value]="a.id">
                {{ a.appointment_date }} {{ a.appointment_time }} · {{ a.patient_name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Diagnosis</label>
            <textarea class="form-control" rows="3" formControlName="diagnosis" placeholder="Patient diagnosis…"></textarea>
          </div>

          <label class="form-label">Medicines</label>
          <div formArrayName="medicines">
              <div class="med-row" *ngFor="let m of medicines.controls; let i = index" [formGroupName]="i">
                <input class="form-control" placeholder="Medicine" formControlName="name">
                <input class="form-control" placeholder="Dosage" formControlName="dosage">
                <input class="form-control" placeholder="Frequency" formControlName="frequency">
                <input class="form-control" placeholder="Duration" formControlName="duration">
                <button type="button" class="btn btn-ghost btn-sm" (click)="removeMedicine(i)" [disabled]="medicines.length === 1">✕</button>
              </div>
            </div>
          <button type="button" class="btn btn-ghost btn-sm" (click)="addMedicine()" style="margin-bottom:14px">+ Add medicine</button>

          <div class="form-group">
            <label class="form-label">Advice (optional)</label>
            <textarea class="form-control" rows="2" formControlName="advice" placeholder="Lifestyle advice, follow-up, etc."></textarea>
          </div>

          <div class="alert alert-success" *ngIf="success()">Prescription saved.</div>
          <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>

          <button type="submit" class="btn btn-primary" [disabled]="saving() || form.invalid">
            <span *ngIf="!saving()">Save prescription</span>
            <span *ngIf="saving()">Saving…</span>
          </button>
        </form>
      </section>

      <!-- History -->
      <section>
        <h3 class="card-title mb-16">My prescriptions</h3>
        <ng-container *ngIf="!loading(); else loadingTpl">
          <div class="card" *ngFor="let p of prescriptions()" style="margin-bottom:12px">
            <div class="rx-head">
              <div>
                <div class="font-bold">{{ p.patient_name }}</div>
                <div class="text-muted" style="font-size:12px">{{ p.created_at | date:'medium' }}</div>
              </div>
              <span class="badge badge-info">Rx</span>
            </div>
            <p class="text-muted mt-8"><strong>Diagnosis:</strong> {{ p.diagnosis }}</p>
            <ul class="meds">
              <li *ngFor="let m of asArray(p.medicines)">
                <strong>{{ m.name }}</strong>
                <span *ngIf="m.dosage"> · {{ m.dosage }}</span>
                <span *ngIf="m.frequency"> · {{ m.frequency }}</span>
                <span *ngIf="m.duration"> · {{ m.duration }}</span>
              </li>
            </ul>
            <p *ngIf="p.advice" class="advice"><em>“{{ p.advice }}”</em></p>
          </div>
          <app-empty-state *ngIf="!prescriptions().length" title="No prescriptions yet" message="Write your first one to see it here."></app-empty-state>
        </ng-container>
        <ng-template #loadingTpl><app-loading></app-loading></ng-template>
      </section>
    </div>
  </div>
  `,
  styles: [`
    .med-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr auto;
      gap: 8px;
      margin-bottom: 8px;
    }
    @media (max-width: 700px) { .med-row { grid-template-columns: 1fr 1fr auto; } }

    .rx-head { display: flex; justify-content: space-between; align-items: center; }
    .meds { padding-left: 18px; margin: 8px 0; }
    .meds li { font-size: 13.5px; color: var(--color-text-muted); margin-bottom: 2px; }
    .advice { font-size: 13px; color: var(--color-text-muted); border-left: 3px solid var(--color-primary-soft); padding-left: 10px; margin-top: 8px; }
  `]
})
export class DoctorPrescriptionsComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly rx    = inject(PrescriptionService);
  private readonly appts = inject(AppointmentService);

  readonly prescriptions = signal<Prescription[]>([]);
  readonly eligibleAppts = signal<Appointment[]>([]);
  readonly loading       = signal(true);
  readonly saving        = signal(false);
  readonly success       = signal(false);
  readonly error         = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    appointment_id: ['', Validators.required],
    diagnosis:      ['', Validators.required],
    advice:         [''],
    medicines: this.fb.array([this.makeMedicine()])
  });

  get medicines(): FormArray { return this.form.get('medicines') as FormArray; }

  ngOnInit(): void {
    this.refresh();

    // Doctor can write prescriptions only for Approved/Completed appointments
    this.appts.myAppointments().subscribe(a => {
      this.eligibleAppts.set(a.filter(x => x.status === 'Approved' || x.status === 'Completed'));
    });
  }

  refresh(): void {
    this.rx.myPrescriptions().subscribe({
      next: p => { this.prescriptions.set(p); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  addMedicine(): void {
    this.medicines.push(this.makeMedicine());
  }

  removeMedicine(i: number): void {
    if (this.medicines.length > 1) this.medicines.removeAt(i);
  }

  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.saving.set(true);
    this.error.set(null);
    this.success.set(false);

    const raw = this.medicines.value as Medicine[];
    const medicines = raw.filter(m => m.name && m.name.trim().length > 0);

    this.rx.create({
      appointment_id: Number(this.form.value['appointment_id']),
      diagnosis: this.form.value['diagnosis'] as string,
      medicines,
      advice: this.form.value['advice'] as string
    }).subscribe({
      next: () => {
        this.form.reset({ medicines: [] });
        while (this.medicines.length) this.medicines.removeAt(0);
        this.medicines.push(this.makeMedicine());
        this.success.set(true);
        this.saving.set(false);
        this.refresh();
      },
      error: (err) => { this.error.set(err?.message || 'Failed to save.'); this.saving.set(false); }
    });
  }

  asArray(m: Medicine[] | string | undefined): Medicine[] {
    if (!m) return [];
    if (Array.isArray(m)) return m;
    try { return JSON.parse(m); } catch { return []; }
  }

  private makeMedicine(): FormGroup {
    return this.fb.group({
      name:      new FormControl('', { nonNullable: true }),
      dosage:    new FormControl(''),
      frequency: new FormControl(''),
      duration:  new FormControl('')
    });
  }
}