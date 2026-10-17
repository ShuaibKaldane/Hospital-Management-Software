import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
  <header class="page-header">
    <div class="page-header-text">
      <h1>{{ title }}</h1>
      <p *ngIf="subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header-actions">
      <ng-content></ng-content>
    </div>
  </header>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle?: string;
}