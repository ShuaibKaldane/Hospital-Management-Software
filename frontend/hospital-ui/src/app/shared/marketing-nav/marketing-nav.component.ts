import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'mkt-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
  <header class="mkt-nav">
    <div class="mkt-nav__inner">
      <a routerLink="/marketing" class="mkt-brand">
        <span class="mkt-brand__mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6V4z"/>
          </svg>
        </span>
        MediCare<span class="mkt-brand__plus">+</span>
      </a>

      <nav class="mkt-nav__links">
        <a routerLink="/marketing"          routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="mkt-nav__link">Home</a>
        <a routerLink="/marketing/pricing"  routerLinkActive="active" class="mkt-nav__link">Pricing</a>
        <a routerLink="/marketing/trial"    routerLinkActive="active" class="mkt-nav__link">Free trial</a>
        <a routerLink="/marketing/checkout" routerLinkActive="active" class="mkt-nav__link">Buy plan</a>
        <a routerLink="/register"            routerLinkActive="active" class="mkt-nav__link">Patient sign-up</a>
      </nav>

      <div class="mkt-nav__actions">
        <a routerLink="/login" class="mkt-nav__signin">Sign in</a>
        <a routerLink="/marketing/pricing" class="mkt-btn mkt-btn--primary mkt-btn--sm">
          Get started
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </a>
      </div>
    </div>
  </header>
  `
})
export class MarketingNavComponent {}
