import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-dashboard-nav',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <a routerLink="/" class="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="6" fill="#2563eb"/>
          <path d="M16 3 L17.5 9.5 L22 8 L19.5 11.5 L24 13.5 L19.5 15 L21.5 21 L16.5 18.5 L16.5 27 L16 25.5 L15.5 27 L15.5 18.5 L10.5 21 L12.5 15 L8 13.5 L12.5 11.5 L10 8 L14.5 9.5 Z" fill="white"/>
        </svg>
        <span class="text-lg font-bold text-blue-600 tracking-tight">Can Tax</span>
      </a>
      <div class="flex items-center gap-4">
        <a routerLink="/dashboard"
           routerLinkActive="text-blue-600 font-medium"
           [routerLinkActiveOptions]="{ exact: true }"
           class="text-sm text-gray-600 hover:text-gray-900">
          Dashboard
        </a>
        <a routerLink="/dashboard/tax-years"
           routerLinkActive="text-blue-600 font-medium"
           class="text-sm text-gray-600 hover:text-gray-900">
          Tax Years
        </a>
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
