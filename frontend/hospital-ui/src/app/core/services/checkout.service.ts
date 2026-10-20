import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface CheckoutPayload {
  hospitalName: string;
  adminName:    string;
  adminEmail:   string;
  phone:        string;
  city:         string;
  address?:     string;
  /** 'basic' | 'pro' | 'enterprise' — backend uses 'pro' for Professional. */
  plan:         string;
  /** Subscription window in days. Default 30. */
  days?:        number;
}

/**
 * What POST /api/hospitals returns.
 */
export interface CheckoutResponse {
  adminEmail:           string;
  adminPassword:        string;
  hospitalId:           number;
  hospitalName:         string;
  city:                 string;
  address:              string;
  phone:                string;
  plan:                 string;
  trialExpiresAt:       string | null;
  subscriptionExpiresAt: string;
  loginUrl:             string;
}

@Injectable({ providedIn: 'root' })
export class CheckoutService {
  private readonly api = inject(ApiService);

  activate(payload: CheckoutPayload): Observable<CheckoutResponse> {
    return this.api.post<CheckoutResponse>('/hospitals', payload);
  }
}
