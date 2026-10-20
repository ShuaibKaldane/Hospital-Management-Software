import { Injectable, computed, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'medicare_theme';

/**
 * Global theme switcher. Reads/writes `data-theme` on <html> and persists
 * the chosen mode in localStorage. Components read `theme()` / `isDark()`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<Theme>(this.read());

  readonly theme  = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  /** Apply once at construction so toggle state survives component reloads. */
  constructor() {
    this.apply(this._theme());
  }

  toggle(): void {
    this.set(this._theme() === 'dark' ? 'light' : 'dark');
  }

  set(t: Theme): void {
    this._theme.set(t);
    this.apply(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  }

  private apply(t: Theme): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
  }

  private read(): Theme {
    if (typeof localStorage === 'undefined') return 'light';
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'dark' ? 'dark' : 'light';
  }
}
