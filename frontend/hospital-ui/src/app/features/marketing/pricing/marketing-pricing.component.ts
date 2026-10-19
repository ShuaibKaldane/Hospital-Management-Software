import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GST_RATE, PLAN_ORDER, PLANS } from '../../../core/services/marketing-store.service';

@Component({
  selector: 'mkt-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <section class="mkt-section" style="padding-top:64px;">
    <div class="mkt-container">
      <div class="mkt-section__head">
        <span class="mkt-section__eyebrow">Pricing</span>
        <h2>Plans in Indian Rupees.<br/>No surprises.</h2>
        <p>All plans include core hospital management features. Upgrade when you outgrow your current plan — downgrades are free, anytime.</p>
      </div>

      <div class="mkt-pricing">
        @for (id of order; track id) {
          @let plan = plans[id];
          @let isPopular = plan.popular;

          <div class="mkt-plan" [class.is-popular]="isPopular">
            @if (isPopular) { <span class="mkt-plan__badge">Most popular</span> }

            <h3 class="mkt-plan__name">{{ plan.name }}</h3>
            <div class="mkt-plan__tag">{{ plan.tagline }}</div>

            <div class="mkt-plan__price">
              <span class="currency">₹</span>
              <span class="amount">{{ plan.monthly | number:'1.0-0':'en-IN' }}</span>
              <span class="per">/month</span>
            </div>

            <div class="mkt-plan__gst">
              + {{ (gstRate * 100).toFixed(0) }}% GST &nbsp;&middot;&nbsp; billed monthly
            </div>

            <div class="mkt-plan__rule"></div>

            <ul class="mkt-plan__list">
              @for (f of plan.features; track f.text) {
                <li [class.is-off]="!f.on">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    @if (f.on) {
                      <polyline points="20 6 9 17 4 12"/>
                    } @else {
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    }
                  </svg>
                  <span>{{ f.text }}</span>
                </li>
              }
            </ul>

            <a [routerLink]="['/marketing/checkout']" [queryParams]="{plan: plan.id}"
               class="mkt-btn mkt-btn--block mkt-btn--lg"
               [class.mkt-btn--primary]="isPopular"
               [class.mkt-btn--outline]="!isPopular">
              @if (isPopular) {
                Get started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              } @else {
                Choose {{ plan.name }}
              }
            </a>
          </div>
        }
      </div>

      <div class="mkt-note mkt-text-center" style="margin-top:36px;">
        <strong>Every plan includes:</strong>
        Unlimited patient registrations &middot; Doctor &amp; staff management &middot;
        Appointment booking &middot; Digital prescriptions &middot;
        Basic reports &middot; Email &amp; chat support &middot; 99.9% uptime SLA.
      </div>
    </div>
  </section>

  <!-- ============================== FAQ ============================== -->
  <section class="mkt-section mkt-section--alt">
    <div class="mkt-container">
      <div class="mkt-section__head">
        <span class="mkt-section__eyebrow">Frequently asked</span>
        <h2>Questions hospitals ask us.</h2>
      </div>

      <div class="mkt-faq">
        <details open>
          <summary>What happens after I pay?</summary>
          <div class="mkt-faq__body">
            You'll instantly receive a downloadable text file containing your hospital's super-admin email
            and password. Sign in with those credentials at the login page and you're ready to go.
          </div>
        </details>
        <details>
          <summary>Can patients see my hospital right away?</summary>
          <div class="mkt-faq__body">
            Yes. The moment your hospital is activated, it appears in the patient registration screen for
            everyone using MediCare+ to sign up as a patient.
          </div>
        </details>
        <details>
          <summary>How does billing work in INR?</summary>
          <div class="mkt-faq__body">
            We bill monthly in Indian rupees. We accept UPI, net-banking, debit/credit cards and bank
            transfer. GST invoices are auto-generated every month.
          </div>
        </details>
        <details>
          <summary>Can I upgrade or downgrade later?</summary>
          <div class="mkt-faq__body">
            Yes — upgrade or downgrade from any plan at any time. We'll prorate the difference when you
            change plans.
          </div>
        </details>
        <details>
          <summary>Is my hospital's patient data safe?</summary>
          <div class="mkt-faq__body">
            All data is encrypted in transit (TLS 1.3) and at rest. Backups run every night. We never
            share patient data with third parties.
          </div>
        </details>
        <details>
          <summary>Do you offer a free trial?</summary>
          <div class="mkt-faq__body">
            Yes — first 7 days are free on every plan. No credit card required to explore the demo.
          </div>
        </details>
      </div>
    </div>
  </section>

  <!-- ============================== CTA ============================== -->
  <section class="mkt-section mkt-section--alt">
    <div class="mkt-container">
      <div class="mkt-cta">
        <h2>Still deciding?</h2>
        <p>Start with our most popular plan, <strong>Professional</strong>. Cancel anytime — no lock-in, no questions.</p>
        <a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}" class="mkt-btn mkt-btn--accent mkt-btn--lg">
          Get Professional — ₹14,999 / month
        </a>
      </div>
    </div>
  </section>
  `
})
export class MarketingPricingComponent {
  readonly plans  = PLANS;
  readonly order  = PLAN_ORDER;
  readonly gstRate = GST_RATE;
}
