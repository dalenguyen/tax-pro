import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TaxYearService } from '../../../services/tax-year.service';
import { TaxYear } from '@can-tax-pro/types';

@Component({
  selector: 'app-tax-year-detail',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a routerLink="/tax-years" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Tax Years</a>
          @if (taxYear()) {
            <h1 class="text-3xl font-bold text-gray-900">Tax Year {{ taxYear()!.year }}</h1>
          }
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (taxYear()) {
          @if (taxYear()!.notes) {
            <p class="text-gray-600 mb-6">{{ taxYear()!.notes }}</p>
          }

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <a [routerLink]="['/tax-years', taxYearId, 'income']"
               class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
              <div class="text-2xl mb-2">&#128176;</div>
              <h3 class="text-lg font-semibold text-gray-900">Income</h3>
              <p class="text-sm text-gray-500 mt-1">Track employment, business & rental income</p>
            </a>

            <a [routerLink]="['/tax-years', taxYearId, 'expenses']"
               class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
              <div class="text-2xl mb-2">&#128179;</div>
              <h3 class="text-lg font-semibold text-gray-900">Expenses</h3>
              <p class="text-sm text-gray-500 mt-1">Deductible business expenses</p>
            </a>

            <a [routerLink]="['/tax-years', taxYearId, 'rental']"
               class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
              <div class="text-2xl mb-2">&#127968;</div>
              <h3 class="text-lg font-semibold text-gray-900">Rental</h3>
              <p class="text-sm text-gray-500 mt-1">Rental property income & expenses</p>
            </a>

            <a [routerLink]="['/tax-years', taxYearId, 'investments']"
               class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
              <div class="text-2xl mb-2">&#128200;</div>
              <h3 class="text-lg font-semibold text-gray-900">Investments</h3>
              <p class="text-sm text-gray-500 mt-1">RRSP, TFSA contributions</p>
            </a>

            <a [routerLink]="['/tax-years', taxYearId, 'receipts']"
               class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
              <div class="text-2xl mb-2">&#129534;</div>
              <h3 class="text-lg font-semibold text-gray-900">Receipts</h3>
              <p class="text-sm text-gray-500 mt-1">Upload & manage receipts</p>
            </a>

            <a [routerLink]="['/tax-years', taxYearId, 'reports']"
               class="bg-white rounded-lg shadow p-6 hover:shadow-md transition block">
              <div class="text-2xl mb-2">&#128196;</div>
              <h3 class="text-lg font-semibold text-gray-900">Reports</h3>
              <p class="text-sm text-gray-500 mt-1">Generate tax summaries</p>
            </a>
          </div>
        } @else {
          <p class="text-gray-500">Tax year not found.</p>
        }
      </div>
    </div>
  `,
})
export default class TaxYearDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taxYearService = inject(TaxYearService);

  taxYearId = '';
  taxYear = signal<TaxYear | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.loadTaxYear();
  }

  private async loadTaxYear() {
    this.loading.set(true);
    try {
      const data = await this.taxYearService.getTaxYear(this.taxYearId);
      this.taxYear.set(data ?? null);
    } finally {
      this.loading.set(false);
    }
  }
}
