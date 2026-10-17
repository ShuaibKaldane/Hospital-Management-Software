import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';

/**
 * Thin wrapper over HttpClient that:
 *  - prepends the API base URL
 *  - unwraps { success, message, data } responses
 *  - normalises errors
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, unknown>): Observable<T> {
    const httpParams = this.stringify(params);
    return this.http.get<ApiResponse<T>>(`${this.base}${path}`, { params: httpParams }).pipe(
      map((res): T => this.unwrap<T>(res)),
      catchError((err: unknown) => this.handleError(err))
    );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map((res): T => this.unwrap<T>(res)),
      catchError((err: unknown) => this.handleError(err))
    );
  }

  put<T>(path: string, body: unknown): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.base}${path}`, body).pipe(
      map((res): T => this.unwrap<T>(res)),
      catchError((err: unknown) => this.handleError(err))
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiResponse<T>>(`${this.base}${path}`).pipe(
      map((res): T => this.unwrap<T>(res)),
      catchError((err: unknown) => this.handleError(err))
    );
  }

  /** Multipart upload — for file submissions. */
  postForm<T>(path: string, form: FormData): Observable<T> {
    return this.http.post<ApiResponse<T>>(`${this.base}${path}`, form).pipe(
      map((res): T => this.unwrap<T>(res)),
      catchError((err: unknown) => this.handleError(err))
    );
  }

  /** Backend wraps data in { success, message, data }; some auth endpoints surface token/user at the top level. */
  private unwrap<T>(r: ApiResponse<T> | unknown): T {
    if (r && typeof r === 'object' && 'success' in r) {
      const wrapped = r as { success?: boolean; message?: string; data?: T };
      if (wrapped.success === false) {
        throw new Error(wrapped.message || 'Request failed');
      }
      if (wrapped.success === true && 'data' in wrapped) {
        return wrapped.data as T;
      }
    }
    return r as T;
  }

  private stringify(params?: Record<string, unknown>): Record<string, string> | undefined {
    if (!params) return undefined;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== '') out[k] = String(v);
    }
    return out;
  }

  /** Always emits an error, never a value, so downstream type stays clean. */
  private handleError(err: unknown): Observable<never> {
    let message = 'Something went wrong';
    let status = 0;

    if (err instanceof HttpErrorResponse) {
      status = err.status;
      const body = err.error as { message?: string } | null;
      message = body?.message || err.message || message;
    } else if (err instanceof Error) {
      message = err.message || message;
    }

    return throwError(() => ({ status, message }));
  }
}