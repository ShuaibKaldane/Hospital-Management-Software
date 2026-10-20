import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
  <button type="button"
          class="theme-toggle"
          (click)="theme.toggle()"
          [attr.aria-label]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
          [title]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'">
    <!-- Sun shown in dark mode (action = go light) -->
    <svg *ngIf="theme.isDark()" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2"  x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2"  y1="12" x2="5"  y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
      <line x1="4.93"  y1="4.93"  x2="6.93"  y2="6.93"/>
      <line x1="17.07" y1="17.07" x2="19.07" y2="19.07"/>
      <line x1="4.93"  y1="19.07" x2="6.93"  y2="17.07"/>
      <line x1="17.07" y1="6.93"  x2="19.07" y2="4.93"/>
    </svg>
    <!-- Moon shown in light mode (action = go dark) -->
    <svg *ngIf="!theme.isDark()" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  </button>
  `
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
