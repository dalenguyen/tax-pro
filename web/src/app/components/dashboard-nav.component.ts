import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div class="flex items-center gap-6">
        <a routerLink="/dashboard" class="text-lg font-bold text-blue-600 tracking-tight">
          Can Tax Pro
        </a>
        <div class="flex items-center gap-4 text-sm">
          <a routerLink="/dashboard"
             routerLinkActive="text-blue-600 font-medium"
             [routerLinkActiveOptions]="{ exact: true }"
             class="text-gray-600 hover:text-gray-900">
            Dashboard
          </a>
          <a routerLink="/dashboard/tax-years"
             routerLinkActive="text-blue-600 font-medium"
             class="text-gray-600 hover:text-gray-900">
            Tax Years
          </a>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <a routerLink="/dashboard/settings"
           routerLinkActive="text-blue-600 font-medium"
           class="text-sm text-gray-600 hover:text-gray-900">
          Settings
        </a>
        @if (auth.currentUser()?.photoURL) {
          <img [src]="auth.currentUser()!.photoURL!" alt="Avatar"
               class="w-8 h-8 rounded-full object-cover" />
        } @else {
          <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-bold">
            {{ (auth.currentUser()?.displayName ?? auth.currentUser()?.email ?? 'U')[0].toUpperCase() }}
          </div>
        }
      </div>
    </nav>
  `,
})
export class DashboardNavComponent {
  auth = inject(AuthService);
}
