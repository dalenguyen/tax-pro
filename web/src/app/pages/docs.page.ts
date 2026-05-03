import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

export const routeMeta = {
  title: 'Can Tax | MCP Docs',
};

@Component({
  selector: 'app-docs',
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
          <a routerLink="/docs" class="text-blue-600 text-sm font-medium">Docs</a>
          <a routerLink="/login"
             class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
            Get Started
          </a>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 pt-32 pb-24">

      <!-- Header -->
      <div class="mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-3">Can Tax — Integration Docs</h1>
        <p class="text-lg text-gray-500">
          Connect Claude and other MCP-compatible AI assistants to your Canadian tax data.
        </p>
      </div>

      <!-- Overview -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
        <p class="text-gray-600 leading-relaxed mb-4">
          Can Tax exposes a <strong>Model Context Protocol (MCP)</strong> server that lets you manage your
          Canadian tax records via natural language. Ask Claude to log income, import expenses, record rental
          financials, track RRSP/TFSA contributions, and generate a full tax summary — without leaving your chat.
        </p>
        <p class="text-gray-600 leading-relaxed">
          The server runs on Google Cloud Run and is available over <strong>Streamable HTTP</strong> (recommended)
          and <strong>SSE</strong>. Authentication is via an API key you generate in your Can Tax account settings.
        </p>
      </section>

      <!-- Prerequisites -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Prerequisites</h2>
        <ol class="list-decimal list-inside space-y-2 text-gray-600">
          <li>A free <a href="https://cantax.fyi" class="text-blue-600 hover:underline">Can Tax account</a></li>
          <li>An MCP API key — generate one at <strong>Settings → MCP API Keys → Generate key</strong>. Copy it immediately; it is shown only once.</li>
        </ol>
      </section>

      <!-- Setup -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Setup</h2>

        <h3 class="text-lg font-semibold text-gray-800 mb-2">Option A — Streamable HTTP (recommended)</h3>
        <p class="text-gray-600 mb-3">
          Supported by Claude Code and any client with native <code class="bg-gray-100 px-1 rounded">streamable-http</code> support.
          No local install required.
        </p>
        <pre class="bg-gray-900 text-gray-100 rounded-xl p-5 text-sm overflow-x-auto mb-6">{{ streamableConfig }}</pre>

        <h3 class="text-lg font-semibold text-gray-800 mb-2">Option B — stdio proxy via npx</h3>
        <p class="text-gray-600 mb-3">
          For clients that only support command-based (stdio) MCP servers. Requires Node.js 22+.
          The <code class="bg-gray-100 px-1 rounded">&#64;cantax-fyi/tax-mcp</code> package acts as a local proxy
          that forwards requests to the Cloud Run server.
        </p>
        <pre class="bg-gray-900 text-gray-100 rounded-xl p-5 text-sm overflow-x-auto mb-2">{{ npxConfig }}</pre>
        <p class="text-gray-500 text-sm mb-6">
          If Claude Desktop picks up an older Node.js version, use
          <code class="bg-gray-100 px-1 rounded">"command": "/bin/bash"</code> with
          <code class="bg-gray-100 px-1 rounded">"args": ["-lc", "npx &#64;cantax-fyi/tax-mcp"]</code>
          so your shell profile loads the correct Node version.
        </p>

        <h3 class="text-lg font-semibold text-gray-800 mb-2">Step 3 — Restart your MCP client</h3>
        <p class="text-gray-600">
          In Claude Code run <code class="bg-gray-100 px-1 rounded">/mcp</code> — you should see
          <code class="bg-gray-100 px-1 rounded">cantax-fyi</code> listed with 31 tools.
        </p>
      </section>

      <!-- Tools -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Available Tools (25)</h2>

        <div class="space-y-8">
          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">Tax Years</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead><tr class="bg-gray-50"><th class="text-left px-3 py-2 border border-gray-200 font-medium">Tool</th><th class="text-left px-3 py-2 border border-gray-200 font-medium">Description</th></tr></thead>
                <tbody>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_tax_years</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List all tax years, newest first</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">create_tax_year</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Create a new tax year (2000–2100)</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">update_tax_year</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Update the notes on a tax year</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_tax_year</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a tax year and all its data</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">Business Income</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead><tr class="bg-gray-50"><th class="text-left px-3 py-2 border border-gray-200 font-medium">Tool</th><th class="text-left px-3 py-2 border border-gray-200 font-medium">Description</th></tr></thead>
                <tbody>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List income entries, optionally filter by source type</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">create_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Add a single income entry</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">update_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Update fields on an income entry (partial update)</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a single income entry by ID</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">bulk_import_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Batch-import multiple income entries</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">Business Expenses</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead><tr class="bg-gray-50"><th class="text-left px-3 py-2 border border-gray-200 font-medium">Tool</th><th class="text-left px-3 py-2 border border-gray-200 font-medium">Description</th></tr></thead>
                <tbody>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_expenses</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List expense entries, optionally filter by category</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">create_expense</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Add a single expense entry</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">update_expense</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Update fields on an expense entry (partial update)</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_expense</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a single expense entry by ID</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">bulk_import_expenses</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Batch-import multiple expense entries</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">Investments (RRSP / TFSA)</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead><tr class="bg-gray-50"><th class="text-left px-3 py-2 border border-gray-200 font-medium">Tool</th><th class="text-left px-3 py-2 border border-gray-200 font-medium">Description</th></tr></thead>
                <tbody>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_investments</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List RRSP/TFSA contributions</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">create_investment</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Record a new RRSP or TFSA contribution</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">update_investment</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Update fields on an investment contribution (partial update)</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_investment</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a single investment contribution by ID</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">Rental Properties</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead><tr class="bg-gray-50"><th class="text-left px-3 py-2 border border-gray-200 font-medium">Tool</th><th class="text-left px-3 py-2 border border-gray-200 font-medium">Description</th></tr></thead>
                <tbody>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_rental_properties</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List all rental properties for a tax year</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">create_rental_property</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Add a new rental property</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_rental_property</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a rental property and all its data</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_rental_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List income entries for a property</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">add_rental_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Record rental income for a property</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">update_rental_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Update fields on a rental income entry (partial update)</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_rental_income</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a single rental income entry</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_rental_expenses</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List expenses for a property</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">add_rental_expense</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Record a rental expense for a property</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">update_rental_expense</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Update fields on a rental expense entry (partial update)</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">delete_rental_expense</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Delete a single rental expense entry</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 class="text-base font-semibold text-gray-800 mb-2">Receipts & Reports</h3>
            <div class="overflow-x-auto">
              <table class="w-full text-sm border-collapse">
                <thead><tr class="bg-gray-50"><th class="text-left px-3 py-2 border border-gray-200 font-medium">Tool</th><th class="text-left px-3 py-2 border border-gray-200 font-medium">Description</th></tr></thead>
                <tbody>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">list_receipts</td><td class="px-3 py-2 border border-gray-200 text-gray-600">List receipts, optionally filter by status</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">get_receipt</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Get a single receipt by ID</td></tr>
                  <tr><td class="px-3 py-2 border border-gray-200 font-mono">get_tax_summary</td><td class="px-3 py-2 border border-gray-200 text-gray-600">Full tax summary with estimated federal tax</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Example prompts -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-6">Example Prompts</h2>
        <div class="space-y-3">
          <div class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-mono text-sm text-gray-700">
            Add a $1,200 USD Stripe income entry for 2024-03-15, exchange rate 1.36
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-mono text-sm text-gray-700">
            Import these expenses for 2024: GCP hosting $45 CAD Jan 1, Phone $80 CAD Jan 5
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-mono text-sm text-gray-700">
            Show me a full tax summary for 2024 including estimated federal tax
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-mono text-sm text-gray-700">
            Add $1,800 rent income for my Main St property in March 2024
          </div>
          <div class="bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 font-mono text-sm text-gray-700">
            Record a $6,000 RRSP contribution for 2024
          </div>
        </div>
      </section>

      <!-- Revoking -->
      <section class="mb-12">
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Revoking an API Key</h2>
        <p class="text-gray-600">
          Go to <strong>Settings → MCP API Keys</strong> and click <strong>Revoke</strong> next to the key.
          The server immediately rejects that key on all subsequent requests.
        </p>
      </section>

      <!-- Support -->
      <section>
        <h2 class="text-2xl font-semibold text-gray-900 mb-4">Support</h2>
        <p class="text-gray-600">
          Questions or issues? Email
          <a href="mailto:dale&#64;dalenguyen.me" class="text-blue-600 hover:underline">dale&#64;dalenguyen.me</a>.
        </p>
      </section>

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
export default class DocsComponent {
  streamableConfig = `{
  "mcpServers": {
    "cantax-fyi": {
      "type": "streamable-http",
      "url": "https://tax-mcp-371544889573.us-central1.run.app/mcp",
      "headers": {
        "x-api-key": "<YOUR_MCP_API_KEY>"
      }
    }
  }
}`;

  npxConfig = `{
  "mcpServers": {
    "cantax-fyi": {
      "command": "npx",
      "args": ["@cantax-fyi/tax-mcp"],
      "env": {
        "CANTAX_API_KEY": "<YOUR_MCP_API_KEY>"
      }
    }
  }
}`;
}
