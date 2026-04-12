import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { authGuard } from '../services/auth.guard';

export const routeMeta = { canActivate: [authGuard] };

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">Can Tax Pro</h1>
        <p class="text-lg text-gray-600 mb-8">Canadian Tax Preparation Made Simple</p>
        <a routerLink="/dashboard"
           class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Get Started
        </a>
      </div>
    </div>
  `,
})
export default class HomeComponent {}
