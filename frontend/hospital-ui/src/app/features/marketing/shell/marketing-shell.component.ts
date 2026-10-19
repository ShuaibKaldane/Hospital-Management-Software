import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MarketingNavComponent } from '../../../shared/marketing-nav/marketing-nav.component';
import { MarketingFooterComponent } from '../../../shared/marketing-footer/marketing-footer.component';

@Component({
  selector: 'mkt-shell',
  standalone: true,
  imports: [RouterOutlet, MarketingNavComponent, MarketingFooterComponent],
  template: `
  <div class="mkt-root">
    <mkt-nav />
    <main>
      <router-outlet />
    </main>
    <mkt-footer />
  </div>
  `
})
export class MarketingShellComponent {}
