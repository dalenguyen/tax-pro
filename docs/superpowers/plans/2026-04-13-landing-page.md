# Landing Page & Dashboard Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a modern public landing page at `/` and restructure all auth-protected routes under `/dashboard/*` behind a single shared `authGuard` layout.

**Architecture:** A new `dashboard.layout.ts` applies `authGuard` to all `/dashboard/*` children; individual pages drop their own guards. The home page is redesigned as a public marketing page with auth-aware CTA using `AuthService` signals.

**Tech Stack:** AnalogJS (file-based routing), Angular 17+ signals, Tailwind CSS, Firebase Auth

---

## File Map

**Create:**
- `web/src/app/pages/dashboard.layout.ts` — passthrough layout with authGuard
- `web/src/app/pages/dashboard/index.page.ts` — moved from `dashboard.page.ts`
- `web/src/app/pages/dashboard/tax-years.page.ts` — moved from `tax-years.page.ts`
- `web/src/app/pages/dashboard/tax-years/` — moved from `pages/tax-years/` (all sub-pages)
- `web/src/app/pages/dashboard/settings.page.ts` — moved from `settings.page.ts`

**Modify:**
- `web/src/app/pages/(home).page.ts` — redesigned landing page
- `web/src/app/pages/login.page.ts` — redirect to `/dashboard` after login

**Delete (after moves):**
- `web/src/app/pages/dashboard.page.ts`
- `web/src/app/pages/tax-years.page.ts`
- `web/src/app/pages/tax-years/` (entire folder)
- `web/src/app/pages/settings.page.ts`

---

### Task 1: Create dashboard layout with authGuard

**Files:**
- Create: `web/src/app/pages/dashboard.layout.ts`

- [ ] **Step 1: Create the layout file**

```typescript
// web/src/app/pages/dashboard.layout.ts
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { authGuard } from '../services/auth.guard';

export const routeMeta = {
  canActivate: [authGuard],
};

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export default class DashboardLayoutComponent {}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/pages/dashboard.layout.ts
git commit -m "feat(routing): add dashboard layout with authGuard"
```

---

### Task 2: Move dashboard page to dashboard/index

**Files:**
- Create: `web/src/app/pages/dashboard/index.page.ts`
- Delete: `web/src/app/pages/dashboard.page.ts`

- [ ] **Step 1: Move the file**

```bash
mkdir -p web/src/app/pages/dashboard
git mv web/src/app/pages/dashboard.page.ts web/src/app/pages/dashboard/index.page.ts
```

- [ ] **Step 2: Edit `dashboard/index.page.ts` — remove authGuard, fix imports, update routerLinks**

Remove the `authGuard` import and `canActivate` from `routeMeta`. Fix the relative import paths (one level deeper). Update routerLinks from `/tax-years` to `/dashboard/tax-years`.

Full updated file:

```typescript
import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TaxYearService } from '../../services/tax-year.service';
import { ReportService } from '../../services/report.service';
import { TaxSummary, TaxYear } from '@can-tax-pro/types';
import { PieChartComponent, PieSlice } from '../../components/pie-chart.component';
import { BarChartComponent, BarDatum } from '../../components/bar-chart.component';
import { LineChartComponent, LineSeries } from '../../components/line-chart.component';

export const routeMeta = { title: 'Dashboard | Can Tax Pro' };

interface MonthlyTrend {
  months: { month: string; income: number; expenses: number }[];
}

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe, PieChartComponent, BarChartComponent, LineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div class="mb-6 flex items-center gap-4">
          <h2 class="text-xl font-semibold">Tax Years</h2>
          <a routerLink="/dashboard/tax-years" class="text-blue-600 hover:text-blue-800 text-sm">
            Manage Tax Years &rarr;
          </a>
        </div>

        @if (taxYearService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (taxYearService.taxYears().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500 mb-4">No tax years yet.</p>
            <a routerLink="/dashboard/tax-years"
               class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Create Tax Year
            </a>
          </div>
        } @else {
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            @for (ty of taxYearService.taxYears(); track ty.id) {
              <button (click)="selectTaxYear(ty)"
                      [class]="selectedTaxYear()?.id === ty.id
                        ? 'bg-blue-600 text-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer block text-left w-full'
                        : 'bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer block text-left w-full'">
                <h3 class="text-2xl font-bold">{{ ty.year }}</h3>
                @if (ty.notes) {
                  <p class="mt-2 text-sm opacity-70">{{ ty.notes }}</p>
                }
              </button>
            }
          </div>

          @if (selectedTaxYear()) {
            <div class="mb-4 flex items-center justify-between">
              <h2 class="text-xl font-semibold text-gray-900">
                Summary — {{ selectedTaxYear()!.year }}
              </h2>
              <a [routerLink]="['/dashboard/tax-years', selectedTaxYear()!.id, 'reports']"
                 class="text-blue-600 hover:text-blue-800 text-sm">
                Full Reports &rarr;
              </a>
            </div>

            @if (summaryLoading()) {
              <p class="text-gray-500">Loading summary...</p>
            } @else if (summary()) {
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-5">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Income</p>
                  <p class="text-2xl font-bold text-gray-900 mt-1">
                    \${{ summary()!.totalIncome | number:'1.2-2' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">CAD</p>
                </div>
                <div class="bg-white rounded-lg shadow p-5">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Expenses</p>
                  <p class="text-2xl font-bold text-red-600 mt-1">
                    \${{ summary()!.totalBusinessExpenses | number:'1.2-2' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">CAD</p>
                </div>
                <div class="bg-white rounded-lg shadow p-5">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Business</p>
                  <p [class]="summary()!.netBusinessIncome >= 0 ? 'text-2xl font-bold text-green-600 mt-1' : 'text-2xl font-bold text-red-600 mt-1'">
                    \${{ summary()!.netBusinessIncome | number:'1.2-2' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">CAD</p>
                </div>
                <div class="bg-white rounded-lg shadow p-5">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Estimated Tax</p>
                  <p class="text-2xl font-bold text-amber-600 mt-1">
                    \${{ summary()!.estimatedTax | number:'1.2-2' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">Federal only · 2024 brackets</p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-5">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Deductions</p>
                  <p class="text-2xl font-bold text-gray-900 mt-1">
                    \${{ summary()!.totalDeductions | number:'1.2-2' }}
                  </p>
                </div>
                <div class="bg-white rounded-lg shadow p-5">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">RRSP Contributions</p>
                  <p class="text-2xl font-bold text-blue-600 mt-1">
                    \${{ summary()!.rrspContributions | number:'1.2-2' }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div class="bg-white rounded-lg shadow p-5">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">Income by Source</h3>
                  @if (chartsLoading()) {
                    <p class="text-sm text-gray-400">Loading...</p>
                  } @else {
                    <app-pie-chart [data]="incomeSlices()" />
                  }
                </div>
                <div class="bg-white rounded-lg shadow p-5">
                  <h3 class="text-sm font-semibold text-gray-700 mb-3">Expenses by Category</h3>
                  @if (chartsLoading()) {
                    <p class="text-sm text-gray-400">Loading...</p>
                  } @else {
                    <app-bar-chart [data]="expenseBars()" />
                  }
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-5 mb-6">
                <h3 class="text-sm font-semibold text-gray-700 mb-3">Monthly Trend</h3>
                @if (chartsLoading()) {
                  <p class="text-sm text-gray-400">Loading...</p>
                } @else {
                  <app-line-chart [labels]="trendLabels()" [series]="trendSeries()" />
                }
              </div>

              @if (summary()!.totalRentalIncome > 0 || summary()!.totalRentalExpenses > 0) {
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  <div class="bg-white rounded-lg shadow p-5">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Rental Income</p>
                    <p class="text-2xl font-bold text-gray-900 mt-1">
                      \${{ summary()!.totalRentalIncome | number:'1.2-2' }}
                    </p>
                  </div>
                  <div class="bg-white rounded-lg shadow p-5">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Rental Expenses</p>
                    <p class="text-2xl font-bold text-red-600 mt-1">
                      \${{ summary()!.totalRentalExpenses | number:'1.2-2' }}
                    </p>
                  </div>
                  <div class="bg-white rounded-lg shadow p-5">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Net Rental</p>
                    <p [class]="summary()!.netRentalIncome >= 0 ? 'text-2xl font-bold text-green-600 mt-1' : 'text-2xl font-bold text-red-600 mt-1'">
                      \${{ summary()!.netRentalIncome | number:'1.2-2' }}
                    </p>
                  </div>
                </div>
              }
            }
          }
        }
      </div>
    </div>
  `,
})
export default class DashboardComponent implements OnInit {
  taxYearService = inject(TaxYearService);
  private reportService = inject(ReportService);

  selectedTaxYear = signal<TaxYear | null>(null);
  summary = signal<TaxSummary | null>(null);
  summaryLoading = signal(false);

  incomeStatement = signal<{ groups: { sourceType: string; total: number }[] } | null>(null);
  expenseBreakdown = signal<{ groups: { category: string; total: number }[] } | null>(null);
  monthlyTrend = signal<MonthlyTrend | null>(null);
  chartsLoading = signal(false);

  incomeSlices = computed<PieSlice[]>(() =>
    (this.incomeStatement()?.groups ?? []).map((g) => ({ label: g.sourceType, value: g.total }))
  );

  expenseBars = computed<BarDatum[]>(() =>
    (this.expenseBreakdown()?.groups ?? []).map((g) => ({ label: g.category, value: g.total }))
  );

  trendLabels = computed(() => (this.monthlyTrend()?.months ?? []).map((m) => m.month.slice(5)));

  trendSeries = computed<LineSeries[]>(() => {
    const months = this.monthlyTrend()?.months ?? [];
    return [
      { label: 'Income', color: '#16a34a', points: months.map((m) => m.income) },
      { label: 'Expenses', color: '#dc2626', points: months.map((m) => m.expenses) },
    ];
  });

  ngOnInit() {
    this.taxYearService.loadTaxYears();
  }

  async selectTaxYear(ty: TaxYear) {
    this.selectedTaxYear.set(ty);
    this.summary.set(null);
    this.incomeStatement.set(null);
    this.expenseBreakdown.set(null);
    this.monthlyTrend.set(null);
    this.summaryLoading.set(true);
    this.chartsLoading.set(true);
    try {
      const [summary, income, expense, trend] = await Promise.all([
        this.reportService.getSummary(ty.id),
        this.reportService.getIncomeStatement(ty.id),
        this.reportService.getExpenseBreakdown(ty.id),
        this.reportService.getMonthlyTrend(ty.id),
      ]);
      this.summary.set(summary);
      this.incomeStatement.set(income);
      this.expenseBreakdown.set(expense);
      this.monthlyTrend.set(trend);
    } finally {
      this.summaryLoading.set(false);
      this.chartsLoading.set(false);
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add web/src/app/pages/dashboard/index.page.ts
git commit -m "feat(routing): move dashboard page under /dashboard route"
```

---

### Task 3: Move settings page

**Files:**
- Create: `web/src/app/pages/dashboard/settings.page.ts`
- Delete: `web/src/app/pages/settings.page.ts`

- [ ] **Step 1: Move the file**

```bash
git mv web/src/app/pages/settings.page.ts web/src/app/pages/dashboard/settings.page.ts
```

- [ ] **Step 2: Edit `dashboard/settings.page.ts` — remove authGuard, fix import paths**

Change the first two lines:
```typescript
// REMOVE these two lines:
// import { authGuard } from '../services/auth.guard';
// export const routeMeta = { title: 'Settings | Can Tax Pro', canActivate: [authGuard] };

// REPLACE with:
export const routeMeta = { title: 'Settings | Can Tax Pro' };
```

Also update service import paths (one level deeper):
```typescript
// Change:
import { AuthService } from '../services/auth.service';
import { ApiKey } from '@can-tax-pro/types';
// To:
import { AuthService } from '../../services/auth.service';
import { ApiKey } from '@can-tax-pro/types';
```

And the HttpClient import stays as-is (it's from `@angular/common/http`, not relative).

The `routerLink="/dashboard"` in the template stays unchanged (dashboard is still at `/dashboard`).

- [ ] **Step 3: Commit**

```bash
git add web/src/app/pages/dashboard/settings.page.ts
git commit -m "feat(routing): move settings page under /dashboard"
```

---

### Task 4: Move tax-years structure

**Files:**
- Create: `web/src/app/pages/dashboard/tax-years.page.ts` and `web/src/app/pages/dashboard/tax-years/` (entire subtree)
- Delete: `web/src/app/pages/tax-years.page.ts` and `web/src/app/pages/tax-years/`

- [ ] **Step 1: Move the tax-years layout file**

```bash
git mv web/src/app/pages/tax-years.page.ts web/src/app/pages/dashboard/tax-years.page.ts
```

- [ ] **Step 2: Edit `dashboard/tax-years.page.ts` — remove authGuard, fix imports**

Replace the entire file content:
```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet } from '@angular/router';

export const routeMeta = {
  title: 'Tax Years | Can Tax Pro',
};

@Component({
  selector: 'app-tax-years-layout',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export default class TaxYearsLayoutComponent {}
```

- [ ] **Step 3: Move the tax-years folder**

```bash
git mv web/src/app/pages/tax-years web/src/app/pages/dashboard/tax-years
```

- [ ] **Step 4: Update all routerLinks — `/tax-years` → `/dashboard/tax-years`**

```bash
# Update string literal router.navigate calls
find web/src/app/pages/dashboard/tax-years -name "*.ts" -exec \
  sed -i '' "s|'/tax-years'|'/dashboard/tax-years'|g" {} \;

# Update routerLink="/tax-years" attributes
find web/src/app/pages/dashboard/tax-years -name "*.ts" -exec \
  sed -i '' 's|routerLink="/tax-years"|routerLink="/dashboard/tax-years"|g' {} \;
```

- [ ] **Step 5: Fix import paths — add one extra `../` for each nesting level**

Files directly in `dashboard/tax-years/` (e.g. `index.page.ts`) — were 2 levels from `pages/`, now 3 levels:
```bash
sed -i '' "s|from '../../services/|from '../../../services/|g" \
  web/src/app/pages/dashboard/tax-years/index.page.ts
```

Files in `dashboard/tax-years/[id]/` — were 3 levels, now 4:
```bash
find web/src/app/pages/dashboard/tax-years/\[id\] -maxdepth 1 -name "*.ts" -exec \
  sed -i '' "s|from '../../../services/|from '../../../../services/|g" {} \;
```

Files in `dashboard/tax-years/[id]/*/` (income, expenses, etc.) — were 4 levels, now 5:
```bash
find web/src/app/pages/dashboard/tax-years/\[id\] -mindepth 2 -name "*.ts" -exec \
  sed -i '' "s|from '../../../../services/|from '../../../../../services/|g" {} \;
```

- [ ] **Step 6: Commit**

```bash
git add web/src/app/pages/dashboard/
git commit -m "feat(routing): move tax-years under /dashboard/tax-years"
```

---

### Task 5: Fix login redirect

**Files:**
- Modify: `web/src/app/pages/login.page.ts`

- [ ] **Step 1: Update redirect target after successful login**

In `login.page.ts`, change the navigation after `loginWithGoogle()`:

```typescript
// Change:
this.router.navigateByUrl('/');
// To:
this.router.navigateByUrl('/dashboard');
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/pages/login.page.ts
git commit -m "fix(auth): redirect to /dashboard after login"
```

---

### Task 6: Redesign home page as landing page

**Files:**
- Modify: `web/src/app/pages/(home).page.ts`

- [ ] **Step 1: Replace the entire file**

```typescript
import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const routeMeta = {
  title: 'Can Tax Pro | Canadian Tax Preparation Made Simple',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Nav -->
    <nav class="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <span class="text-xl font-bold text-blue-600">Can Tax Pro</span>
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
        @if (auth.ready()) {
          @if (auth.isAuthenticated()) {
            <a routerLink="/dashboard"
               class="inline-block bg-white text-blue-900 font-semibold px-10 py-4 rounded-xl hover:bg-blue-50 transition text-lg shadow-lg">
              Go to Dashboard &rarr;
            </a>
          } @else {
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/register"
                 class="inline-block bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl hover:bg-blue-400 transition text-lg shadow-lg">
                Get Started — It's Free
              </a>
              <a routerLink="/login"
                 class="inline-block border border-white/30 text-white font-semibold px-10 py-4 rounded-xl hover:bg-white/10 transition text-lg">
                Login
              </a>
            </div>
          }
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
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

        @if (!auth.isAuthenticated()) {
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
      © 2026 Can Tax Pro. Built for Canadian freelancers.
    </footer>
  `,
})
export default class HomeComponent {
  auth = inject(AuthService);
}
```

- [ ] **Step 2: Commit**

```bash
git add web/src/app/pages/\(home\).page.ts
git commit -m "feat(landing): redesign home page with hero, features, how-it-works"
```

---

### Task 7: Build verification

- [ ] **Step 1: Run the build**

```bash
pnpm nx build web
```

Expected: build completes with no errors. If TypeScript errors appear about import paths, fix the relative paths in the reported file(s) and re-run.

- [ ] **Step 2: Check for any remaining old route references**

```bash
grep -r "'/tax-years'" web/src/app/pages/dashboard --include="*.ts"
grep -r 'routerLink="/tax-years"' web/src/app/pages/dashboard --include="*.ts"
```

Expected: no matches. If any appear, update them to `'/dashboard/tax-years'`.

- [ ] **Step 3: Start the dev server and verify manually**

```bash
pnpm nx serve web
```

Verify:
- `/` renders landing page with nav, hero, features, how-it-works
- Unauthenticated: hero shows "Get Started" + "Login" buttons
- After login: hero shows "Go to Dashboard →" button; nav shows "Dashboard →"
- `/dashboard` loads the dashboard (redirects to `/login` if not authenticated)
- `/dashboard/tax-years` loads tax years list
- `/dashboard/settings` loads settings
- `/login` redirects to `/dashboard` after successful sign-in

- [ ] **Step 4: Commit any final fixes**

```bash
git add -A
git commit -m "fix(routing): correct any remaining path issues after restructure"
```
