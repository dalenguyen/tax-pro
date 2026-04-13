import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { authGuard } from '../services/auth.guard';

export const routeMeta = {
  canActivate: [authGuard],
};

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export default class DashboardLayoutComponent {}
