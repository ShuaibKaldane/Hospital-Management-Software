import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GST_RATE, PLAN_ORDER, PLANS } from '../../../core/services/marketing-store.service';

@Component({
  selector: 'mkt-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <section class="mkt-section" style="padding-top:80px;">
    <div class="mkt-container">
      <div class="mkt-section__head" style="margin-bottom: 72px;">
        <span class="mkt-section__eyebrow">Pricing</span>
        <h2>Plans in Indian Rupees.<br/>No surprises.</h2>
        <p>All plans include core features. Upgrade, downgrade or cancel anytime.</p>
      </div>

      <div class="mkt-pricing">
        <!-- Free trial card (separate from PAID plans since it has no monthly fee) -->
        <div class="mkt-plan mkt-plan--trial">
          <span class="mkt-plan__trial-tag">7 days</span>

          <h3 class="mkt-plan__name">Free Trial</h3>
          <div class="mkt-plan__tag">Try MediCare+ for 7 days, no card required.</div>

          <div class="mkt-plan__price">
            <span class="amount num">₹0</span>
            <span class="per">/7 days</span>
          </div>

          <div class="mkt-plan__gst">
            No credit card &nbsp;·&nbsp; cancel anytime
          </div>

          <div class="mkt-plan__rule"></div>

          <ul class="mkt-plan__list">
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Up to 5 doctors</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Up to 50 patients</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Appointment booking &amp; reminders</span>
            </li>
            <li>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span>Email support</span>
            </li>
            <li class="is-off">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Salary &amp; payroll</span>
            </li>
            <li class="is-off">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              <span>Custom integrations</span>
            </li>
          </ul>

          <a routerLink="/marketing/trial"
             class="mkt-btn mkt-btn--block mkt-btn--lg mkt-btn--primary">
            Start free trial
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

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
        <details>
          <summary>
            <span class="mkt-faq__icon mkt-faq__icon--blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span class="mkt-faq__q">What happens after I pay?</span>
            <span class="mkt-faq__tag">Activation</span>
          </summary>
          <div class="mkt-faq__body">
            You'll instantly receive a downloadable text file containing your hospital's super-admin email
            and password. Sign in with those credentials at the login page and you're ready to go. No
            paperwork, no wait time — most teams are onboarding patients within an hour.
          </div>
        </details>

        <details>
          <summary>
            <span class="mkt-faq__icon mkt-faq__icon--sky">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12 a4 4 0 0 1 8 0"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M9 9 l1 -2 M15 9 l-1 -2"/></svg>
            </span>
            <span class="mkt-faq__q">Can patients see my hospital right away?</span>
            <span class="mkt-faq__tag">Discovery</span>
          </summary>
          <div class="mkt-faq__body">
            Yes. The moment your hospital is activated, it appears in the patient registration screen for
            everyone using MediCare+ to sign up as a patient. They can pick your hospital and start
            booking appointments the same day.
          </div>
        </details>

        <details>
          <summary>
            <span class="mkt-faq__icon mkt-faq__icon--cyan">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            </span>
            <span class="mkt-faq__q">How does billing work in INR?</span>
            <span class="mkt-faq__tag">Billing</span>
          </summary>
          <div class="mkt-faq__body">
            We bill monthly in Indian rupees. We accept UPI, net-banking, debit/credit cards and bank
            transfer. GST invoices are auto-generated every month and emailed to your registered address.
          </div>
        </details>

        <details>
          <summary>
            <span class="mkt-faq__icon mkt-faq__icon--violet">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11 V9 a4 4 0 0 1 4 -4 h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13 v2 a4 4 0 0 1 -4 4 h-14"/></svg>
            </span>
            <span class="mkt-faq__q">Can I upgrade or downgrade later?</span>
            <span class="mkt-faq__tag">Flexibility</span>
          </summary>
          <div class="mkt-faq__body">
            Yes — upgrade or downgrade from any plan at any time. We prorate the difference when you
            change plans, so you only pay for what you've used. No lock-in contracts, no penalties.
          </div>
        </details>

        <details>
          <summary>
            <span class="mkt-faq__icon mkt-faq__icon--success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span class="mkt-faq__q">Is my hospital's patient data safe?</span>
            <span class="mkt-faq__tag">Security</span>
          </summary>
          <div class="mkt-faq__body">
            All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Backups run every night
            with point-in-time recovery. We are DPDP-Act compliant and never share patient data with
            third parties — your data is yours, full stop.
          </div>
        </details>

        <details>
          <summary>
            <span class="mkt-faq__icon mkt-faq__icon--indigo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><polyline points="22 14 18 14 15 12 15 16"/></svg>
            </span>
            <span class="mkt-faq__q">Do you offer a free trial?</span>
            <span class="mkt-faq__tag">Trial</span>
          </summary>
          <div class="mkt-faq__body">
            Yes — the first 7 days are completely free on every plan. No credit card required to
            explore the demo. If you decide to continue, your subscription starts automatically.
          </div>
        </details>
      </div>

      <!-- Still have questions? CTA -->
      <div class="mkt-faq__more">
        <div class="mkt-faq__more-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15 a2 2 0 0 1 -2 2 H7 l-4 4 V5 a2 2 0 0 1 2 -2 h14 a2 2 0 0 1 2 2 z"/>
          </svg>
        </div>
        <div class="mkt-faq__more-body">
          <h3>Still have questions?</h3>
          <p>Our team responds within 1 hour during business hours. Reach out any way you like.</p>
          <div class="mkt-faq__more-actions">
            <a href="mailto:hello@medicare-plus.in" class="mkt-btn mkt-btn--primary mkt-btn--sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
              Email us
            </a>
            <a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}" class="mkt-btn mkt-btn--outline mkt-btn--sm">
              Start free trial
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================== CTA ============================== -->
  <section class="mkt-section mkt-section--alt">
    <div class="mkt-container">
      <div class="mkt-cta">
        <h2>Try it free for 7 days.</h2>
        <p>No credit card. No payment. Start your trial and explore the platform with full admin access.</p>
        <div style="display:flex; gap:12px; justify-content:center; flex-wrap:wrap;">
          <a routerLink="/marketing/trial" class="mkt-btn mkt-btn--primary mkt-btn--lg">
            Start 7-day free trial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left:6px;"><polyline points="20 6 9 17 4 12"/></svg>
          </a>
          <a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}" class="mkt-btn mkt-btn--accent mkt-btn--lg">
            Get Professional — ₹14,999 / month
          </a>
        </div>
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
