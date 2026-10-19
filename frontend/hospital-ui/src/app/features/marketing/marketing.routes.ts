import { Routes } from '@angular/router';

/**
 * Public, un-authenticated marketing & checkout routes.
 *  /marketing               → landing
 *  /marketing/pricing       → 3 plans
 *  /marketing/checkout      → hospital details + payment
 *  /marketing/success       → credentials + file download
 */
export const MARKETING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./shell/marketing-shell.component').then(m => m.MarketingShellComponent),
    children: [
      {
        path: '',
        pathMatch: 'full',
        loadComponent: () => import('./home/marketing-home.component').then(m => m.MarketingHomeComponent),
        data: { title: 'MediCare+ — Modern Hospital Management Software' }
      },
      {
        path: 'pricing',
        loadComponent: () => import('./pricing/marketing-pricing.component').then(m => m.MarketingPricingComponent),
        data: { title: 'Pricing — MediCare+' }
      },
      {
        path: 'checkout',
        loadComponent: () => import('./checkout/marketing-checkout.component').then(m => m.MarketingCheckoutComponent),
        data: { title: 'Checkout — MediCare+' }
      },
      {
        path: 'success',
        loadComponent: () => import('./success/marketing-success.component').then(m => m.MarketingSuccessComponent),
        data: { title: 'You\'re activated — MediCare+' }
      }
    ]
  }
];
