import { Component, ChangeDetectionStrategy, inject, computed, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { authGuard } from '../services/auth.guard';
import { AuthService } from '../services/auth.service';
import { DashboardNavComponent } from '../components/dashboard-nav.component';

export const routeMeta = {
  canActivate: [authGuard],
};

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, DashboardNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (ready()) {
      <app-dashboard-nav />
      <router-outlet />
    } @else {
      <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }
  `,
})
export default class DashboardLayoutComponent {
  private platformId = inject(PLATFORM_ID);
  private auth = inject(AuthService);

  ready = computed(() => isPlatformBrowser(this.platformId) && this.auth.ready());
}
