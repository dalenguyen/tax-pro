import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports-index',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId]" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Reports</h1>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports', 'summary']"
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
            <div class="text-2xl mb-2">&#128196;</div>
            <h3 class="text-lg font-semibold text-gray-900">Tax Summary</h3>
            <p class="text-sm text-gray-500 mt-1">Complete overview of all income, expenses & deductions</p>
          </a>

          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports', 'income-statement']"
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
            <div class="text-2xl mb-2">&#128176;</div>
            <h3 class="text-lg font-semibold text-gray-900">Income Statement</h3>
            <p class="text-sm text-gray-500 mt-1">Income grouped by source type</p>
          </a>

          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports', 'expense-breakdown']"
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
            <div class="text-2xl mb-2">&#128179;</div>
            <h3 class="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
            <p class="text-sm text-gray-500 mt-1">Expenses grouped by category with percentages</p>
          </a>

          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports', 'rental-statement']"
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
            <div class="text-2xl mb-2">&#127968;</div>
            <h3 class="text-lg font-semibold text-gray-900">Rental Statement</h3>
            <p class="text-sm text-gray-500 mt-1">Per-property income & expense statement</p>
          </a>

          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports', 'investment-summary']"
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
            <div class="text-2xl mb-2">&#128200;</div>
            <h3 class="text-lg font-semibold text-gray-900">Investment Summary</h3>
            <p class="text-sm text-gray-500 mt-1">RRSP & TFSA contributions</p>
          </a>

          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports', 't2125']"
             class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
            <div class="text-2xl mb-2">&#128203;</div>
            <h3 class="text-lg font-semibold text-gray-900">T2125</h3>
            <p class="text-sm text-gray-500 mt-1">CRA Statement of Business Activities</p>
          </a>
        </div>
      </div>
    </div>
  `,
})
export default class ReportsIndexComponent implements OnInit {
  private route = inject(ActivatedRoute);
  taxYearId = '';

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
  }
}
