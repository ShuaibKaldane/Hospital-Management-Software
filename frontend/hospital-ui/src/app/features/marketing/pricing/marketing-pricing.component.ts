import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GST_RATE, PLAN_ORDER, PLANS } from '../../../core/services/marketing-store.service';

@Component({
  selector: 'mkt-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketing-pricing.component.html',
  styleUrl: './marketing-pricing.component.css'
})
export class MarketingPricingComponent {
  readonly plans = PLANS;
  readonly order = PLAN_ORDER;
  readonly gstPercent = GST_RATE * 100;
  readonly trialFeatures = [
    { text: 'Up to 5 doctors', on: true },
    { text: 'Up to 50 patients', on: true },
    { text: 'Appointment booking & reminders', on: true },
    { text: 'Email support', on: true },
    { text: 'Salary & payroll', on: false },
    { text: 'Custom integrations', on: false }
  ];
}
