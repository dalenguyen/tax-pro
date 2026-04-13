# Landing Page & Routing Restructure

## Goal

Public landing page at `/` with modern design and auth-aware CTA. All protected routes moved under `/dashboard/*` with a single shared authGuard layout.

## Routing Restructure

### New file structure

```
pages/
  (home).page.ts          — public landing page, no guard
  login.page.ts           — unchanged
  register.page.ts        — unchanged
  dashboard.layout.ts     — NEW: passthrough layout with authGuard
  dashboard/
    index.page.ts         — moved from dashboard.page.ts
    tax-years.page.ts     — moved from tax-years.page.ts
    tax-years/            — moved entire folder
      [id]/...
    settings.page.ts      — moved from settings.page.ts
```

### Rules

- `dashboard.layout.ts` applies `authGuard` via `routeMeta.canActivate`; template is just `<router-outlet />`
- All individual pages under `dashboard/` remove their own `authGuard`
- All `routerLink="/tax-years"` and `routerLink="/dashboard"` references update to `/dashboard/tax-years` and `/dashboard` respectively

## Landing Page

### Nav bar (sticky top)

- Left: "Can Tax Pro" logo/wordmark
- Right (unauthenticated): "Login" ghost button + "Get Started" primary button
- Right (authenticated): "Dashboard →" button
- Simple shadow on scroll

### Hero section

- Background: dark gradient (slate-900 → blue-900)
- Badge: "🍁 Built for Canadians"
- H1: "Canadian Tax Preparation Made Simple"
- Tagline: "Track income, expenses, receipts and generate CRA-ready reports — all in one place"
- CTAs (unauthenticated): "Get Started" primary (→ `/register`) + "Login" ghost (→ `/login`)
- CTA (authenticated): "Go to Dashboard →" (→ `/dashboard`)

### Features section

- White background, centered heading: "Everything you need for tax season"
- 4-column grid on desktop, 2-col tablet, 1-col mobile
- Cards: icon + title + description
  1. 📊 Track Income — Record income from multiple sources
  2. 💸 Track Expenses — Categorize deductions automatically
  3. 🧾 Receipt Upload — AI-powered data extraction
  4. 📄 Tax Reports — T2125, summaries, and more

### How it works section

- Light gray background, centered heading: "Get started in minutes"
- 3 numbered steps in a row
  1. Create a tax year
  2. Add income, expenses & receipts
  3. Generate CRA-ready reports

### Footer (minimal)

- "© 2026 Can Tax Pro. Built for Canadian freelancers."

## Auth-aware CTA logic

`AuthService.isAuthenticated` signal drives conditional rendering. Wait for `AuthService.ready` before rendering CTAs to avoid flash of wrong state.

## Tech notes

- AnalogJS file-based routing — `dashboard.layout.ts` wraps all `/dashboard/*` children
- Tailwind CSS for all styling
- `ChangeDetectionStrategy.OnPush` on all components
- No new dependencies required
