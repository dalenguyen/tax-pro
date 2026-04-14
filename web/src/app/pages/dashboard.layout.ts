import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { authGuard } from '../services/auth.guard';
import { DashboardNavComponent } from '../components/dashboard-nav.component';

export const routeMeta = {
  canActivate: [authGuard],
};

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, DashboardNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-dashboard-nav />
    <router-outlet />
  `,
})
export default class DashboardLayoutComponent {}
