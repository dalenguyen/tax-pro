import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { authGuard } from '../services/auth.guard';
import { AuthService } from '../services/auth.service';

export const routeMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-settings',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a routerLink="/dashboard" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        <!-- Profile Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Profile</h2>
          <div class="space-y-3">
            <div class="flex items-center gap-4">
              @if (auth.currentUser()?.photoURL) {
                <img [src]="auth.currentUser()!.photoURL!" alt="Avatar"
                     class="w-14 h-14 rounded-full object-cover" />
              } @else {
                <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {{ (auth.currentUser()?.displayName ?? auth.currentUser()?.email ?? 'U')[0].toUpperCase() }}
                </div>
              }
              <div>
                <p class="font-medium text-gray-900">{{ auth.currentUser()?.displayName ?? '—' }}</p>
                <p class="text-sm text-gray-500">{{ auth.currentUser()?.email }}</p>
              </div>
            </div>
            <p class="text-sm text-gray-400 italic">Business name &amp; province coming soon.</p>
          </div>
        </div>

        <!-- Preferences Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Preferences</h2>
          <p class="text-sm text-gray-400 italic">Preferences coming soon.</p>
        </div>

        <!-- Account Section -->
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Account</h2>
          <button (click)="auth.logout()"
                  class="text-sm text-red-600 hover:text-red-800 font-medium">
            Sign out
          </button>
        </div>
      </div>
    </div>
  `,
})
export default class SettingsComponent {
  auth = inject(AuthService);
}
