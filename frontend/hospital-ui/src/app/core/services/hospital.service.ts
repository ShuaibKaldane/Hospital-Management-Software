import { Injectable, inject, signal } from '@angular/core';
import { MarketingStoreService, HospitalRecord } from './marketing-store.service';

/**
 * Lightweight facade over `MarketingStoreService` tuned for the patient
 * sign-up form: it exposes only the fields a patient needs to pick a
 * hospital, and stays in sync as marketing writes new hospitals.
 */
export interface HospitalOption {
  id:           string;
  hospitalName: string;
  city?:        string;
  planName?:    string;
}

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private readonly store = inject(MarketingStoreService);

  /** Map a stored hospital record → slim option for the sign-up form. */
  private readonly toOption = (h: HospitalRecord): HospitalOption => ({
    id:           h.id,
    hospitalName: h.hospitalName,
    city:         h.city,
    planName:     h.planName
  });

  /** Reactive list of hospitals the patient can register with. */
  readonly hospitals = signal<HospitalOption[]>(
    this.store.hospitals().map(this.toOption)
  );

  constructor() {
    // Cross-tab: marketing site purchase in another tab → refresh.
    window.addEventListener('storage', (e) => {
      if (e.key === 'medicare_hospitals') this.refresh();
    });
    // Same-tab: marketing checkout fired the custom event we listen for.
    window.addEventListener('medicare:hospitals-updated', () => this.refresh());
  }

  refresh(): void {
    this.hospitals.set(this.store.hospitals().map(this.toOption));
  }

  getById(id: string): HospitalOption | undefined {
    return this.hospitals().find(h => h.id === id);
  }
}
