import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TaxYearService } from '../services/tax-year.service';
import { ReportService } from '../services/report.service';
import { TaxSummary, TaxYear } from '@can-tax-pro/types';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div class="mb-6 flex items-center gap-4">
          <h2 class="text-xl font-semibold">Tax Years</h2>
          <a routerLink="/tax-years" class="text-blue-600 hover:text-blue-800 text-sm">
            Manage Tax Years &rarr;
          </a>
        </div>

        @if (taxYearService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (taxYearService.taxYears().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500 mb-4">No tax years yet.</p>
            <a routerLink="/tax-years"
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
              <a [routerLink]="['/tax-years', selectedTaxYear()!.id, 'reports']"
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
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">RRSP Contributions</p>
                  <p class="text-2xl font-bold text-blue-600 mt-1">
                    \${{ summary()!.rrspContributions | number:'1.2-2' }}
                  </p>
                  <p class="text-xs text-gray-400 mt-1">CAD</p>
                </div>
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

  ngOnInit() {
    this.taxYearService.loadTaxYears();
  }

  async selectTaxYear(ty: TaxYear) {
    this.selectedTaxYear.set(ty);
    this.summary.set(null);
    this.summaryLoading.set(true);
    try {
      const data = await this.reportService.getSummary(ty.id);
      this.summary.set(data);
    } finally {
      this.summaryLoading.set(false);
    }
  }
}
