import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/user.model';

const TOKEN_KEY = 'medicare_token';
const USER_KEY  = 'medicare_user';

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly _user  = signal<User | null>(this.readUser());
  private readonly _token = signal<string | null>(this.readToken());

  readonly user  = this._user.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);

  setSession(token: string, user: User): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._user.set(user);
  }

  clear(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  getRole(): string | null {
    return this._user()?.role ?? null;
  }

  private readToken(): string | null {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  }

  private readUser(): User | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}