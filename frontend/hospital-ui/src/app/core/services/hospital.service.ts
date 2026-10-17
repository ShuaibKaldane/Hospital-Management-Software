import { Injectable, signal } from '@angular/core';
import { HospitalOption } from '../models/hospital.model';

const STORAGE_KEY = 'medicare_hospitals';

/**
 * Reads the list of activated hospitals that the marketing site
 * stored in localStorage after a successful plan purchase.
 *
 * Because this is a static-site purchase flow, the source of
 * truth for "which hospitals exist" is the buyer's browser.
 * When real backend APIs are wired in, swap the read source
 * for an `HttpClient.get<HospitalOption[]>('/hospitals')` call.
 */
@Injectable({ providedIn: 'root' })
export class HospitalService {
  /** Reactive list so any component can render a dropdown. */
  readonly hospitals = signal<HospitalOption[]>(this.read());

  constructor() {
    // Cross-tab update: if the user buys a plan in another tab, refresh here.
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY) this.refresh();
    });

    // Same-tab update from the marketing site checkout.
    window.addEventListener('medicare:hospitals-updated', () => this.refresh());
  }

  /** Force re-read from localStorage and update the signal. */
  refresh(): void {
    this.hospitals.set(this.read());
  }

  /** Look up a single hospital by id. */
  getById(id: string): HospitalOption | undefined {
    return this.hospitals().find(h => h.id === id);
  }

  private read(): HospitalOption[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.map((h: any) => ({
        id:            h.id            ?? '',
        hospitalName:  h.hospitalName  ?? h.name ?? '',
        hospitalSlug:  h.hospitalSlug  ?? '',
        city:          h.city          ?? '',
        state:         h.state         ?? '',
        planName:      h.planName      ?? '',
        transactionId: h.transactionId ?? ''
      }));
    } catch {
      return [];
    }
  }
}
