import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'mkt-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
  <footer class="mkt-footer">

    <!-- Top: brand + newsletter + columns -->
    <div class="mkt-container">
      <div class="mkt-footer__top">

        <!-- Brand + newsletter -->
        <div class="mkt-footer__brand">
          <a routerLink="/marketing" class="mkt-brand">
            <span class="mkt-brand__mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z"/>
              </svg>
            </span>
            MediCare<span class="mkt-brand__plus">+</span>
          </a>

          <p class="mkt-footer__about">
            A modern Hospital Management System, built in India for Indian
            hospitals, clinics and practitioners.
          </p>

          <!-- Newsletter -->
          <form class="mkt-footer__news" (submit)="$event.preventDefault(); subscribe()">
            <label class="mkt-footer__news-label" for="footer-email">
              Get product updates
            </label>
            <div class="mkt-footer__news-row">
              <input id="footer-email" type="email" required
                     [(ngModel)]="email" name="email"
                     placeholder="you@hospital.com">
              <button type="submit" class="mkt-btn mkt-btn--primary mkt-btn--sm">
                Subscribe
              </button>
            </div>
            @if (subscribed) {
              <div class="mkt-footer__news-ok">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Thanks — you'll hear from us soon.
              </div>
            }
          </form>

          <!-- Compliance badges -->
          <div class="mkt-footer__badges">
            <div class="mkt-footer__badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2C20 17.5 12 22 12 22z"/><circle cx="12" cy="10" r="3"/></svg>
              Hosted in India
            </div>
            <div class="mkt-footer__badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ISO 27001 ready
            </div>
            <div class="mkt-footer__badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="9 12 11.5 14.5 16 9.5"/></svg>
              DPDP compliant
            </div>
          </div>
        </div>

        <!-- Link columns -->
        <div class="mkt-footer__cols">
          <div class="mkt-footer__col">
            <h4>Product</h4>
            <ul>
              <li><a routerLink="/marketing">Overview</a></li>
              <li><a routerLink="/marketing/pricing">Pricing</a></li>
              <li><a routerLink="/marketing#features">Features</a></li>
              <li><a routerLink="/marketing#roles">For everyone</a></li>
              <li><a routerLink="/register">Patient sign-up</a></li>
            </ul>
          </div>

          <div class="mkt-footer__col">
            <h4>For hospitals</h4>
            <ul>
              <li><a routerLink="/marketing/checkout" [queryParams]="{plan: 'basic'}">Basic plan</a></li>
              <li><a routerLink="/marketing/checkout" [queryParams]="{plan: 'professional'}">Professional</a></li>
              <li><a routerLink="/marketing/checkout" [queryParams]="{plan: 'enterprise'}">Enterprise</a></li>
              <li><a routerLink="/login">Admin sign-in</a></li>
              <li><a routerLink="/doctor/signup">Doctor sign-up</a></li>
            </ul>
          </div>

          <div class="mkt-footer__col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About us</a></li>
              <li><a href="#">Customers</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>

          <div class="mkt-footer__col">
            <h4>Get in touch</h4>
            <ul class="mkt-footer__contact">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <a href="mailto:hello@medicare-plus.in">hello&#64;medicare-plus.in</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <a href="tel:+919999999999">+91 99999 99999</a>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span>Bengaluru, Karnataka<br/>India — 560001</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Trust strip -->
      <div class="mkt-footer__trust">
        <span class="trust-label">Trusted by hospital administrators at</span>
        <div class="trust-hospitals">
          <span>Sunshine</span>
          <span class="dot"></span>
          <span>Apollo</span>
          <span class="dot"></span>
          <span>Care &amp; Cure</span>
          <span class="dot"></span>
          <span>Medanta</span>
          <span class="dot"></span>
          <span>Fortis</span>
          <span class="dot"></span>
          <span>Manipal</span>
        </div>
      </div>
    </div>

    <!-- Bottom legal bar -->
    <div class="mkt-footer__legal">
      <div class="mkt-container mkt-footer__legal-inner">
        <span class="mkt-footer__legal-copy">
          © {{ year }} MediCare+ Technologies Pvt. Ltd. &nbsp;·&nbsp;
          GSTIN 29ABCDE1234F1Z5 &nbsp;·&nbsp; CIN U85300KA2024PTC123456
        </span>

        <nav class="mkt-footer__legal-nav" aria-label="Legal">
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
          <a href="#">Refund policy</a>
          <a href="#">Security</a>
          <a href="#">Status</a>
        </nav>

        <div class="mkt-footer__social" aria-label="Social media">
          <a href="#" title="Twitter / X" aria-label="Twitter">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
          <a href="#" title="LinkedIn" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/></svg>
          </a>
          <a href="#" title="GitHub" aria-label="GitHub">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5a11.5 11.5 0 00-3.63 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.74 1.27 3.41.97.1-.76.4-1.27.74-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 015.78 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.39-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.79.55A11.5 11.5 0 0012 .5z"/></svg>
          </a>
          <a href="#" title="YouTube" aria-label="YouTube">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 00-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.6A3 3 0 001 7.2 31 31 0 00.5 12 31 31 0 001 16.8a3 3 0 002.1 2.1c1.9.6 8.9.6 8.9.6s7 0 8.9-.6a3 3 0 002.1-2.1A31 31 0 0023.5 12 31 31 0 0023 7.2zM9.75 15.5v-7l6 3.5z"/></svg>
          </a>
        </div>
      </div>
    </div>
  </footer>
  `
})
export class MarketingFooterComponent {
  readonly year = new Date().getFullYear();
  email = '';
  subscribed = false;

  subscribe(): void {
    if (this.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.subscribed = true;
      this.email = '';
      setTimeout(() => (this.subscribed = false), 4000);
    }
  }
}
