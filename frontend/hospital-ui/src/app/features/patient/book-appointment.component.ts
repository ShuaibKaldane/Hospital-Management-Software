import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorService } from '../../core/services/doctor.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { PaymentService } from '../../core/services/payment.service';
import { DoctorProfile } from '../../core/models/doctor.model';
import { PageHeaderComponent } from '../../shared/page-header/page-header.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DecimalPipe, PageHeaderComponent, LoadingComponent],
  template: `
  <div class="page">
    <app-page-header title="Book appointment" subtitle="Choose a doctor, pick a slot, and confirm."></app-page-header>

    <div class="grid grid-2" style="align-items:start">
      <section class="card">
        <ng-container *ngIf="!loading(); else loadingTpl">
          <form [formGroup]="form" (ngSubmit)="submit()">
            <div class="form-group">
              <label class="form-label">Doctor</label>
              <select class="form-control" formControlName="doctor_id" (change)="onDoctorChange()">
                <option value="">Select doctor</option>
                <option *ngFor="let d of doctors" [value]="d.user_id">{{ d.name }} · {{ d.category_name }}</option>
              </select>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date</label>
                <input class="form-control" type="date" formControlName="appointment_date" [min]="today">
              </div>
              <div class="form-group">
                <label class="form-label">Time</label>
                <input class="form-control" type="time" formControlName="appointment_time">
              </div>
            </div>

            <div class="alert alert-info" *ngIf="selectedDoctor() as d">
              <strong>Fee:</strong> ₹ {{ d.consultation_fee | number:'1.0-0' }} ·
              <strong>Experience:</strong> {{ d.experience }} years
            </div>

            <div class="alert alert-success" *ngIf="bookedId()">
              Appointment booked! Redirecting to payment…
            </div>
            <div class="alert alert-error" *ngIf="error()">{{ error() }}</div>

            <button type="submit" class="btn btn-primary btn-block btn-lg" [disabled]="saving() || form.invalid">
              <span *ngIf="!saving()">Confirm &amp; pay</span>
              <span *ngIf="saving()">Booking…</span>
            </button>
          </form>
        </ng-container>
        <ng-template #loadingTpl><app-loading></app-loading></ng-template>
      </section>

      <aside class="card">
        <h3 class="card-title mb-16">How it works</h3>
        <ol class="how">
          <li>Pick your preferred doctor.</li>
          <li>Choose an available date and time.</li>
          <li>We book the slot and take payment.</li>
          <li>Your doctor approves the appointment.</li>
        </ol>
        <p class="text-muted" style="font-size:13px;margin-top:16px">
          You'll be able to upload medical reports and view prescriptions from your dashboard.
        </p>
      </aside>
    </div>
  </div>
  `,
  styles: [`
    .how { padding-left: 18px; }
    .how li { margin-bottom: 8px; color: var(--color-text-muted); }
  `]
})
export class BookAppointmentComponent implements OnInit {
  private readonly fb    = inject(FormBuilder).nonNullable;
  private readonly docs  = inject(DoctorService);
  private readonly appts = inject(AppointmentService);
  private readonly pay   = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  doctors: DoctorProfile[] = [];
  readonly loading  = signal(true);
  readonly saving   = signal(false);
  readonly error    = signal<string | null>(null);
  readonly bookedId = signal<number | null>(null);

  readonly today = new Date().toISOString().slice(0, 10);

  form: FormGroup = this.fb.group({
    doctor_id:        ['', Validators.required],
    appointment_date: ['', Validators.required],
    appointment_time: ['', Validators.required]
  });

  selectedDoctor = signal<DoctorProfile | null>(null);

  ngOnInit(): void {
    this.docs.listDoctors({ status: 'ACTIVE', limit: 100 }).subscribe(ds => {
      this.doctors = ds;
      this.loading.set(false);

      // ?doctor=ID preselect
      const preset = this.route.snapshot.queryParamMap.get('doctor');
      if (preset) {
        this.form.patchValue({ doctor_id: Number(preset) });
        this.onDoctorChange();
      }
    });
  }

  onDoctorChange(): void {
    const id = Number(this.form.value['doctor_id']);
    this.selectedDoctor.set(this.doctors.find(d => d.user_id === id) || null);
  }

  submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();
    this.saving.set(true);
    this.error.set(null);

    this.appts.book({
      doctor_id: Number(this.form.value['doctor_id']),
      appointment_date: this.form.value['appointment_date'] as string,
      appointment_time: this.form.value['appointment_time'] as string
    }).subscribe({
      next: a => {
        this.bookedId.set(a.id);
        // Auto-charge using doctor's consultation fee
        this.pay.pay({
          appointment_id: a.id,
          payment_method: 'Card',
          amount: this.selectedDoctor()?.consultation_fee
        }).subscribe({
          next: () => {
            this.saving.set(false);
            setTimeout(() => this.router.navigate(['/patient/appointments']), 800);
          },
          error: () => {
            this.saving.set(false);
            setTimeout(() => this.router.navigate(['/patient/appointments']), 800);
          }
        });
      },
      error: (err) => { this.error.set(err?.message || 'Booking failed.'); this.saving.set(false); }
    });
  }
}