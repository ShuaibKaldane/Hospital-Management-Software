import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { MarketingStoreService, HospitalRecord } from './marketing-store.service';

/**
 * Lightweight facade over the backend hospital directory + the
 * marketing local-store. Merges both sources so any hospital added
 * via super admin OR marketing checkout shows up in the signup form.
 */
export interface HospitalOption {
  id:           string;
  hospitalName: string;
  city?:        string;
  planName?:    string;
}

interface BackendHospital {
  id: number;
  name: string;
  city: string | null;
  plan: string;
}

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private readonly store = inject(MarketingStoreService);
  private readonly api   = inject(ApiService);

  /** Map a stored hospital record → slim option for the sign-up form. */
  private readonly toOption = (h: HospitalRecord): HospitalOption => ({
    id:           h.id,
    hospitalName: h.hospitalName,
    city:         h.city,
    planName:     h.planName
  });

  /** Map a backend hospital row → slim option. */
  private readonly fromBackend = (h: BackendHospital): HospitalOption => ({
    id:           String(h.id),
    hospitalName: h.name,
    city:         h.city ?? undefined,
    planName:     h.plan
  });

  /** Reactive list of hospitals the patient/doctor can register with. */
  readonly hospitals = signal<HospitalOption[]>([]);

  constructor() {
    // Seed from local cache (marketing checkout path), then refresh from backend.
    this.hospitals.set(this.store.hospitals().map(this.toOption));

    // Cross-tab: marketing site purchase in another tab → refresh.
    window.addEventListener('storage', (e) => {
      if (e.key === 'medicare_hospitals') this.refresh();
    });
    // Same-tab: marketing checkout fired the custom event we listen for.
    window.addEventListener('medicare:hospitals-updated', () => this.refresh());

    // Pull the authoritative list from the backend.
    this.refresh();
  }

  /** Re-read both sources and merge. Backend records take priority on id collision. */
  refresh(): void {
    this.api.get<BackendHospital[]>('/hospitals').subscribe({
      next: (rows) => {
        const fromApi   = rows.map(this.fromBackend).filter(this.isNumericId);
        const fromStore = this.store.hospitals()
          .map(this.toOption)
          // The backend only accepts FK ids from `hospitals.id` (BIGINT).
          // Marketing localStorage entries use slug ids and would fail signup.
          .filter(this.isNumericId);

        // Dedupe by id; backend wins.
        const byId = new Map<string, HospitalOption>();
        for (const h of fromStore) byId.set(h.id, h);
        for (const h of fromApi)   byId.set(h.id, h);

        this.hospitals.set(Array.from(byId.values()));
      },
      error: () => {
        // Backend down — keep whatever we already have.
        this.hospitals.set(
          this.store.hospitals().map(this.toOption).filter(this.isNumericId)
        );
      }
    });
  }

  /** Keep only ids that look like a positive integer (DB-backed hospitals). */
  private readonly isNumericId = (h: HospitalOption): boolean => {
    const n = Number(h.id);
    return Number.isFinite(n) && n > 0 && String(n) === h.id;
  };

  getById(id: string): HospitalOption | undefined {
    return this.hospitals().find(h => h.id === id);
  }
}
