import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

export const routeMeta = {
  title: 'Can Tax | Privacy Policy',
};

@Component({
  selector: 'app-privacy',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Nav -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a routerLink="/" class="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="32" height="32" rx="6" fill="#2563eb"/>
            <path d="M16 3 L17.5 9.5 L22 8 L19.5 11.5 L24 13.5 L19.5 15 L21.5 21 L16.5 18.5 L16.5 27 L16 25.5 L15.5 27 L15.5 18.5 L10.5 21 L12.5 15 L8 13.5 L12.5 11.5 L10 8 L14.5 9.5 Z" fill="white"/>
          </svg>
          <span class="text-lg font-bold text-blue-600 tracking-tight">Can Tax</span>
        </a>
        <div class="flex items-center gap-6">
          <a routerLink="/docs" class="text-gray-500 hover:text-gray-900 text-sm font-medium transition">Docs</a>
          <a routerLink="/login"
             class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Get Started
          </a>
        </div>
      </div>
    </nav>

    <div class="max-w-3xl mx-auto px-6 pt-32 pb-24">

      <h1 class="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p class="text-gray-400 text-sm mb-10">Last updated: April 21, 2026</p>

      <div class="prose prose-gray max-w-none space-y-10 text-gray-600 leading-relaxed">

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">1. Who We Are</h2>
          <p>
            Can Tax ("we", "us", "our") is operated by Dale Nguyen. We provide a Canadian tax tracking
            web application and a Model Context Protocol (MCP) integration available at
            <a href="https://cantax.fyi" class="text-blue-600 hover:underline">cantax.fyi</a>.
            Questions about this policy can be sent to
            <a href="mailto:dale&#64;dalenguyen.me" class="text-blue-600 hover:underline">dale&#64;dalenguyen.me</a>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">2. Data We Collect</h2>
          <p class="mb-3">We collect only what is necessary to provide the service:</p>
          <ul class="list-disc list-inside space-y-2">
            <li><strong>Account data</strong> — email address and password (hashed) used to create your account.</li>
            <li><strong>Tax data</strong> — income entries, expense records, rental property details, RRSP/TFSA contributions, and receipts you explicitly add to your account.</li>
            <li><strong>API keys</strong> — hashed tokens you generate to authenticate MCP requests. The plaintext key is shown once and never stored.</li>
            <li><strong>Usage data</strong> — basic server logs (request timestamps, HTTP status codes) for debugging. No analytics or tracking pixels.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">3. How We Use Your Data</h2>
          <ul class="list-disc list-inside space-y-2">
            <li>To operate and provide the Can Tax service.</li>
            <li>To authenticate your MCP API requests.</li>
            <li>To generate tax summaries and reports you request.</li>
            <li>To respond to your support requests.</li>
          </ul>
          <p class="mt-3">We do not sell, rent, or share your personal or tax data with third parties for marketing or advertising.</p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">4. Data Storage & Retention</h2>
          <p class="mb-3">
            Your data is stored in <strong>Google Cloud Firestore</strong> (us-central1 region) and served via
            <strong>Google Cloud Run</strong>. Data is encrypted at rest and in transit (HTTPS/TLS).
          </p>
          <p>
            We retain your data for as long as your account is active. You may delete individual records at
            any time through the app or via MCP tools. To permanently delete your account and all associated
            data, email
            <a href="mailto:dale&#64;dalenguyen.me" class="text-blue-600 hover:underline">dale&#64;dalenguyen.me</a>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">5. MCP Integration</h2>
          <p class="mb-3">
            When you use the Can Tax MCP integration:
          </p>
          <ul class="list-disc list-inside space-y-2">
            <li>The server only accesses data that you (or your AI assistant acting on your behalf) explicitly request.</li>
            <li>No data is stored beyond your existing account records as a result of MCP requests.</li>
            <li>AI assistants (e.g., Claude) send your prompts to Anthropic's servers. Can Tax does not receive or store your conversation content — only the structured API calls made by the assistant.</li>
            <li>Can Tax does not integrate with any third-party AI model. All AI processing happens on Anthropic's infrastructure, not ours.</li>
          </ul>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">6. Cookies & Tracking</h2>
          <p>
            We use session cookies strictly for authentication. We do not use advertising cookies, third-party
            trackers, or analytics services (e.g., Google Analytics).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">7. Your Rights</h2>
          <p class="mb-3">You have the right to:</p>
          <ul class="list-disc list-inside space-y-2">
            <li>Access the data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your account and data.</li>
            <li>Export your tax data at any time.</li>
          </ul>
          <p class="mt-3">
            To exercise any of these rights, email
            <a href="mailto:dale&#64;dalenguyen.me" class="text-blue-600 hover:underline">dale&#64;dalenguyen.me</a>.
            We will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">8. Canadian Residents (PIPEDA)</h2>
          <p>
            Can Tax is built for Canadian users and operated in compliance with the
            <em>Personal Information Protection and Electronic Documents Act</em> (PIPEDA).
            We collect, use, and disclose personal information only with your consent or as permitted by law.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">9. Changes to This Policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be communicated by updating the
            "Last updated" date above and, where appropriate, by email. Continued use of the service after
            changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900 mb-3">10. Contact</h2>
          <p>
            Privacy questions or requests:
            <a href="mailto:dale&#64;dalenguyen.me" class="text-blue-600 hover:underline">dale&#64;dalenguyen.me</a>
          </p>
        </section>

      </div>
    </div>

    <!-- Footer -->
    <footer class="py-8 px-6 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
      <div class="flex justify-center gap-6 mb-2">
        <a routerLink="/docs" class="hover:text-gray-600 transition">Docs</a>
        <a routerLink="/privacy" class="hover:text-gray-600 transition">Privacy Policy</a>
      </div>
      © 2026 Can Tax. Built for Canadian freelancers.
    </footer>
  `,
})
export default class PrivacyComponent {}
