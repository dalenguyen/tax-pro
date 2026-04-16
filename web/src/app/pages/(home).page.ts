import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const routeMeta = {
  title: 'Can Tax | Canadian Tax Preparation Made Simple',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Nav -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span class="text-xl font-bold text-blue-600">Can Tax</span>
        @if (auth.ready()) {
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard"
               class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Dashboard &rarr;
            </a>
          } @else {
            <div class="flex items-center gap-3">
              <a routerLink="/login"
                 class="text-gray-600 hover:text-gray-900 text-sm font-medium transition">
                Login
              </a>
              <a routerLink="/register"
                 class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
                Get Started
              </a>
            </div>
          }
        }
      </div>
    </nav>

    <!-- Hero -->
    <section class="bg-gradient-to-br from-slate-900 to-blue-900 text-white pt-40 pb-28 px-6">
      <div class="max-w-3xl mx-auto text-center">
        <span class="inline-block bg-red-500/20 text-red-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-8 border border-red-400/30 tracking-wide">
          🍁 Built for Canadians
        </span>
        <h1 class="text-5xl sm:text-6xl font-bold leading-tight mb-6 tracking-tight">
          Canadian Tax Preparation Made Simple
        </h1>
        <p class="text-xl text-slate-300 mb-12 max-w-xl mx-auto leading-relaxed">
          Track income, expenses, receipts and generate CRA-ready reports — all in one place.
        </p>
        @if (auth.ready() && !auth.isAuthenticated()) {
          <a routerLink="/register"
             class="inline-block bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl hover:bg-blue-400 transition text-lg shadow-lg">
            Get Started — It's Free
          </a>
        }
      </div>
    </section>

    <!-- Features -->
    <section class="py-24 px-6 bg-white">
      <div class="max-w-5xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
          Everything you need for tax season
        </h2>
        <p class="text-center text-gray-500 mb-14 text-lg">
          Built for Canadian freelancers, contractors, and small business owners.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <div class="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
            <div class="text-3xl mb-4">📊</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Track Income</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Record income from employment, business, rental, and investment sources.
            </p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
            <div class="text-3xl mb-4">💸</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Track Expenses</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Categorize deductible business expenses and maximize your deductions.
            </p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
            <div class="text-3xl mb-4">🧾</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Receipt Upload</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Upload receipts and let AI extract the details automatically.
            </p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
            <div class="text-3xl mb-4">📄</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Tax Reports</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Generate T2125 forms, income statements, and expense breakdowns.
            </p>
          </div>
          <div class="bg-gray-50 rounded-2xl p-6 hover:shadow-md transition">
            <div class="text-3xl mb-4">🤖</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">MCP Server</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Connect any MCP-compatible AI client to your tax data for AI-powered insights.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="py-24 px-6 bg-gray-50">
      <div class="max-w-4xl mx-auto">
        <h2 class="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
          Get started in minutes
        </h2>
        <p class="text-center text-gray-500 mb-14 text-lg">
          Three steps to a cleaner tax season.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
              1
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Create a tax year</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Start a new tax year for the filing period you're working on.
            </p>
          </div>
          <div class="text-center">
            <div class="w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
              2
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Add income, expenses & receipts</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Log your financial activity throughout the year as it happens.
            </p>
          </div>
          <div class="text-center">
            <div class="w-14 h-14 rounded-full bg-blue-600 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
              3
            </div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Generate reports</h3>
            <p class="text-gray-500 text-sm leading-relaxed">
              Export CRA-ready summaries and T2125 forms when tax season arrives.
            </p>
          </div>
        </div>

        @if (auth.ready() && !auth.isAuthenticated()) {
          <div class="text-center mt-14">
            <a routerLink="/register"
               class="inline-block bg-blue-600 text-white font-semibold px-10 py-4 rounded-xl hover:bg-blue-700 transition text-lg shadow">
              Get Started — It's Free
            </a>
          </div>
        }
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 px-6 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
      © 2026 Can Tax. Built for Canadian freelancers.
    </footer>
  `,
})
export default class HomeComponent {
  auth = inject(AuthService);
}
