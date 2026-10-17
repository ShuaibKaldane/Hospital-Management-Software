import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-block" *ngIf="!inline; else inlineTpl">
      <div class="spinner" [style.width.px]="size" [style.height.px]="size"></div>
    </div>
    <ng-template #inlineTpl>
      <span class="spinner spinner-sm"></span>
    </ng-template>
  `
})
export class LoadingComponent {
  @Input() size = 32;
  @Input() inline = false;
}