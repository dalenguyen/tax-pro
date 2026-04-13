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
