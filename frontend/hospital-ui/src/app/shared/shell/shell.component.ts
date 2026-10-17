import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <app-navbar />
      <main class="app-main">
        <router-outlet />
      </main>
    </div>
  `
})
export class ShellComponent {}