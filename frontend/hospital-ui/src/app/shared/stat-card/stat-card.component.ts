import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="stat-card" [style.--accent]="accent">
    <div class="stat-icon" [innerHTML]="icon"></div>
    <div class="stat-body">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-trend" *ngIf="trend">{{ trend }}</div>
    </div>
  </div>
  `,
  styles: [`
    .stat-card {
      display: flex;
      gap: 14px;
      align-items: flex-start;
      padding: 18px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }
    .stat-card::before {
      content: '';
      position: absolute; inset: 0 auto 0 0;
      width: 4px;
      background: var(--accent, var(--color-primary));
    }
    .stat-icon {
      width: 48px; height: 48px;
      border-radius: var(--radius-md);
      background: color-mix(in srgb, var(--accent, var(--color-primary)) 12%, transparent);
      color: var(--accent, var(--color-primary));
      display: inline-flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon svg { width: 22px; height: 22px; stroke: currentColor; fill: none; stroke-width: 2; }

    .stat-body { flex: 1; min-width: 0; }
    .stat-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--color-text-subtle); font-weight: 600; }
    .stat-value { font-family: var(--font-display); font-size: 1.6rem; font-weight: 800; color: var(--color-text); margin-top: 2px; line-height: 1.1; word-break: break-word; }
    .stat-trend { font-size: 12px; color: var(--color-text-muted); margin-top: 4px; }
  `]
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: string | number | null = '';
  @Input() icon = '';
  @Input() accent = '#0E7490';
  @Input() trend?: string;
}