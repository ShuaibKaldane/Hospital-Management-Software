import { Injectable, computed, signal } from '@angular/core';

/**
 * Plan catalogue — single source of truth for the marketing site.
 * All prices are in **Indian Rupees (₹)**, billed per month.
 */
export type PlanId = 'basic' | 'professional' | 'enterprise';

export interface PlanFeature {
  text: string;
  on: boolean;
}

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Monthly price in INR (whole rupees, no paise). */
  monthly: number;
  /** Per-month effective price when paid annually. */
  annualPerMonth: number;
  popular: boolean;
  features: PlanFeature[];
}

export const PLANS: Readonly<Record<PlanId, Plan>> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    tagline: 'For small clinics & individual practitioners.',
    monthly: 4999,
    annualPerMonth: Math.round(4999 * 12 * 0.85 / 12),     // 15% off
    popular: false,
    features: [
      { text: 'Up to 5 doctors',                    on: true },
      { text: 'Up to 500 patients / month',         on: true },
      { text: 'Appointment booking & SMS reminders', on: true },
      { text: 'Basic dashboard & reports',          on: true },
      { text: 'Email support',                      on: true },
      { text: 'Multi-location management',          on: false },
      { text: 'Custom integrations',                on: false },
      { text: 'Dedicated account manager',          on: false }
    ]
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    tagline: 'For growing hospitals & specialty clinics.',
    monthly: 14999,
    annualPerMonth: Math.round(14999 * 12 * 0.83 / 12),   // ~17% off
    popular: true,
    features: [
      { text: 'Up to 25 doctors',                   on: true },
      { text: 'Unlimited patients',                 on: true },
      { text: 'Appointment, prescription & reports', on: true },
      { text: 'Advanced analytics & reports',       on: true },
      { text: 'Salary & payment management',        on: true },
      { text: 'Multi-location (up to 3)',           on: true },
      { text: 'Priority email + chat support',      on: true },
      { text: 'Dedicated account manager',          on: false }
    ]
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For hospital chains & large networks.',
    monthly: 49999,
    annualPerMonth: Math.round(49999 * 12 * 0.80 / 12),   // 20% off
    popular: false,
    features: [
      { text: 'Unlimited doctors & staff',          on: true },
      { text: 'Unlimited patients',                 on: true },
      { text: 'Full module access (all features)',  on: true },
      { text: 'Custom analytics & BI dashboards',    on: true },
      { text: 'Salary, payroll & finance suite',    on: true },
      { text: 'Unlimited locations',                on: true },
      { text: '24×7 priority phone support',        on: true },
      { text: 'Dedicated account manager',          on: true }
    ]
  }
};

export const PLAN_ORDER: PlanId[] = ['basic', 'professional', 'enterprise'];

/** Indian GST rate applied at checkout. */
export const GST_RATE = 0.18;

/** Persisted hospital record (mirrored to localStorage). */
export interface HospitalRecord {
  id: string;
  hospitalName: string;
  hospitalSlug: string;
  city?: string;
  address?: string;
  phone?: string;
  adminName?: string;
  adminEmail: string;
  adminPassword: string;
  planId: PlanId;
  planName: string;
  planPrice: number;
  billingCycle: 'monthly' | 'annual';
  transactionId: string;
  purchaseDate: string;          // ISO timestamp
  loginUrl?: string;
}

const STORAGE_KEY = 'medicare_hospitals';

/**
 * Static-site demo service that powers both the marketing checkout
 * and the patient signup screen. In production this would be backed
 * by a real API (e.g. `/api/hospitals`, `/api/checkout`).
 */
@Injectable({ providedIn: 'root' })
export class MarketingStoreService {
  /** Reactive list of activated hospitals (for the patient signup dropdown). */
  readonly hospitals = signal<HospitalRecord[]>(this.read());

  /** Re-read from storage and update the signal. */
  refresh(): void {
    this.hospitals.set(this.read());
  }

  /** Add a freshly purchased hospital. */
  addHospital(record: HospitalRecord): void {
    const list = this.read();
    list.push(record);
    this.write(list);
    this.refresh();

    // Notify same-tab listeners (e.g. the Angular patient sign-up form).
    window.dispatchEvent(
      new CustomEvent('medicare:hospitals-updated', { detail: list })
    );
  }

  /** Friendly-ish input → URL slug. */
  slugify(s: string): string {
    return (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  /** 12-char random password — guaranteed mixed character set. */
  generatePassword(length = 12): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghjkmnpqrstuvwxyz';
    const nums  = '23456789';
    const syms  = '@#$%&*!';
    const all   = upper + lower + nums + syms;

    const chars = [
      upper[Math.floor(Math.random() * upper.length)],
      lower[Math.floor(Math.random() * lower.length)],
      nums [Math.floor(Math.random() * nums.length)],
      syms [Math.floor(Math.random() * syms.length)]
    ];
    while (chars.length < length) {
      chars.push(all[Math.floor(Math.random() * all.length)]);
    }
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
  }

  /** Pretty transaction id like TXN-LX9K2M-4X7TQ. */
  generateTransactionId(): string {
    const ts  = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `TXN-${ts}-${rnd}`;
  }

  /** Format INR with Indian numbering (₹4,999 / ₹14,999). */
  formatINR(n: number): string {
    return '₹' + Math.round(n).toLocaleString('en-IN');
  }

  /** Effective monthly amount given a billing cycle. */
  monthlyFor(plan: Plan, cycle: 'monthly' | 'annual'): number {
    return cycle === 'annual' ? plan.annualPerMonth : plan.monthly;
  }

  /** GST amount for a given monthly figure. */
  gstFor(monthly: number): number {
    return Math.round(monthly * GST_RATE);
  }

  private read(): HospitalRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private write(list: HospitalRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}
