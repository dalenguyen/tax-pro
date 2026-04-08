import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaxYearService } from '../services/tax-year.service';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div class="mb-6 flex items-center gap-4">
          <h2 class="text-xl font-semibold">Tax Years</h2>
          <a routerLink="/tax-years"
             class="text-blue-600 hover:text-blue-800 text-sm">
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
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            @for (ty of taxYearService.taxYears(); track ty.id) {
              <a [routerLink]="['/tax-years', ty.id]"
                 class="bg-white rounded-lg shadow p-6 hover:shadow-md transition cursor-pointer block">
                <h3 class="text-2xl font-bold text-gray-900">{{ ty.year }}</h3>
                @if (ty.notes) {
                  <p class="text-gray-500 mt-2 text-sm">{{ ty.notes }}</p>
                }
              </a>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export default class DashboardComponent implements OnInit {
  taxYearService = inject(TaxYearService);

  ngOnInit() {
    this.taxYearService.loadTaxYears();
  }
}
