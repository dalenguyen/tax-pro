import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ApiKey } from '@cantax-fyi/types';

export const routeMeta = { title: 'Settings | Can Tax' };

@Component({
  selector: 'app-settings',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

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

        <!-- MCP API Keys Section -->
        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <div class="mb-4">
            <h2 class="text-lg font-semibold text-gray-900">MCP API Keys</h2>
            <p class="text-sm text-gray-500 mt-1">
              Use these keys to let Claude Code access your tax data via the Can Tax MCP server.
            </p>
          </div>

          <!-- New key form -->
          <div class="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Key name (e.g. My MacBook)"
              [value]="newKeyName()"
              (input)="newKeyName.set($any($event.target).value)"
              class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              (click)="generateKey()"
              [disabled]="generating() || !newKeyName().trim()"
              class="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {{ generating() ? 'Generating…' : 'Generate key' }}
            </button>
          </div>

          <!-- Newly created key — shown once -->
          @if (newPlaintext()) {
            <div class="bg-green-50 border border-green-200 rounded p-4 mb-4">
              <p class="text-sm font-medium text-green-800 mb-2">
                Copy this key now — it won't be shown again.
              </p>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-xs bg-white border border-green-200 rounded px-3 py-2 break-all font-mono">
                  {{ newPlaintext() }}
                </code>
                <button (click)="copyKey()" class="text-xs text-green-700 hover:text-green-900 font-medium whitespace-nowrap">
                  {{ copied() ? 'Copied!' : 'Copy' }}
                </button>
              </div>
              <p class="text-xs text-green-700 mt-2">
                Pass it to the MCP server with <code class="font-mono">--apiKey &lt;key&gt;</code>
              </p>
            </div>
          }

          <!-- Existing keys -->
          @if (keys().length === 0) {
            <p class="text-sm text-gray-400 italic">No API keys yet.</p>
          } @else {
            <ul class="divide-y divide-gray-100">
              @for (key of keys(); track key.id) {
                <li class="flex items-center justify-between py-3">
                  <div>
                    <p class="text-sm font-medium text-gray-900">{{ key.name }}</p>
                    <p class="text-xs text-gray-400">
                      Created {{ formatDate(key.createdAt) }}
                      @if (key.lastUsedAt) { · Last used {{ formatDate(key.lastUsedAt) }} }
                    </p>
                  </div>
                  <button (click)="revokeKey(key.id)"
                          class="text-xs text-red-600 hover:text-red-800 font-medium ml-4">
                    Revoke
                  </button>
                </li>
              }
            </ul>
          }
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
export default class SettingsComponent implements OnInit {
  auth = inject(AuthService);
  private http = inject(HttpClient);

  keys = signal<ApiKey[]>([]);
  newKeyName = signal('');
  generating = signal(false);
  newPlaintext = signal('');
  copied = signal(false);

  async ngOnInit() {
    await this.loadKeys();
  }

  async loadKeys() {
    const data = await firstValueFrom(this.http.get<ApiKey[]>('/api/api-keys'));
    this.keys.set(data ?? []);
  }

  async generateKey() {
    if (!this.newKeyName().trim() || this.generating()) return;
    this.generating.set(true);
    this.newPlaintext.set('');
    try {
      const res = await firstValueFrom(
        this.http.post<{ id: string; name: string; plaintext: string }>('/api/api-keys', {
          name: this.newKeyName().trim(),
        })
      );
      this.newPlaintext.set(res.plaintext);
      this.newKeyName.set('');
      await this.loadKeys();
    } finally {
      this.generating.set(false);
    }
  }

  async revokeKey(id: string) {
    await firstValueFrom(this.http.delete(`/api/api-keys/${id}`));
    this.keys.update((ks) => ks.filter((k) => k.id !== id));
    if (this.newPlaintext()) this.newPlaintext.set('');
  }

  async copyKey() {
    await navigator.clipboard.writeText(this.newPlaintext());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  formatDate(val: unknown): string {
    if (!val) return '';
    const ts = val as { _seconds?: number; seconds?: number; toDate?: () => Date };
    let d: Date;
    if (typeof ts.toDate === 'function') {
      d = ts.toDate();
    } else if (ts._seconds != null) {
      d = new Date(ts._seconds * 1000);
    } else if (ts.seconds != null) {
      d = new Date(ts.seconds * 1000);
    } else {
      d = new Date(val as string);
    }
    return d.toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
