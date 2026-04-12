import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div class="bg-white rounded-lg shadow max-w-md w-full p-8">
        <h1 class="text-2xl font-bold text-gray-900 mb-6">Log in</h1>

        <form (ngSubmit)="submit()" class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="email" name="email" type="email" required
                   [(ngModel)]="email"
                   class="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input id="password" name="password" type="password" required
                   [(ngModel)]="password"
                   class="w-full rounded border border-gray-300 px-3 py-2 text-sm" />
          </div>

          @if (error()) {
            <p class="text-sm text-red-600">{{ error() }}</p>
          }

          <button type="submit" [disabled]="loading()"
                  class="w-full bg-blue-600 text-white font-medium py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {{ loading() ? 'Signing in...' : 'Sign in' }}
          </button>
        </form>

        <p class="text-sm text-gray-500 mt-4">
          Don't have an account?
          <a routerLink="/register" class="text-blue-600 hover:underline">Register</a>
        </p>
      </div>
    </div>
  `,
})
export default class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal<string | null>(null);

  async submit() {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigateByUrl('/');
    } catch (err) {
      this.error.set((err as Error).message || 'Login failed');
    } finally {
      this.loading.set(false);
    }
  }
}
