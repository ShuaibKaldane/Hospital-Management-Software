import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface TrialPayload {
  hospitalName: string;
  adminName:    string;
  adminEmail:   string;
  phone:        string;
  city:         string;
  address?:     string;
}

/**
 * What the backend returns from POST /api/trial.
 * Mirrors { adminEmail, adminPassword, hospitalId, hospitalName, trialExpiresAt, loginUrl }.
 */
export interface TrialResponse {
  adminEmail:     string;
  adminPassword:  string;
  hospitalId:     number | string;
  hospitalName:   string;
  trialExpiresAt: string;   // ISO timestamp
  loginUrl:       string;
}

@Injectable({ providedIn: 'root' })
export class TrialService {
  private readonly api = inject(ApiService);

  activate(payload: TrialPayload): Observable<TrialResponse> {
    return this.api.post<TrialResponse>('/trial', payload);
  }
}
