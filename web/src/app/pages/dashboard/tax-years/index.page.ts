import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaxYearService } from '../../../services/tax-year.service';

@Component({
  selector: 'app-tax-years',
  imports: [RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a routerLink="/dashboard" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Dashboard</a>
          <h1 class="text-3xl font-bold text-gray-900">Tax Years</h1>
        </div>

        <div class="bg-white rounded-lg shadow p-6 mb-6">
          <h2 class="text-lg font-semibold mb-4">Create Tax Year</h2>
          <form (ngSubmit)="onSubmit()" class="flex gap-4 items-end">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input type="number" [(ngModel)]="year" name="year"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-32"
                     [min]="2000" [max]="2099" required />
            </div>
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
              <input type="text" [(ngModel)]="notes" name="notes"
                     class="border border-gray-300 rounded px-3 py-2 text-sm w-full"
                     placeholder="Optional notes..." />
            </div>
            <button type="submit"
                    class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
                    [disabled]="taxYearService.loading()">
              Create
            </button>
          </form>
        </div>

        @if (taxYearService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (taxYearService.taxYears().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500">No tax years yet. Create one above.</p>
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Year</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (ty of taxYearService.taxYears(); track ty.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <a [routerLink]="['/dashboard/tax-years', ty.id]"
                         class="text-blue-600 hover:text-blue-800 font-semibold text-lg">
                        {{ ty.year }}
                      </a>
                    </td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ ty.notes || '—' }}</td>
                    <td class="px-4 py-3">
                      <button (click)="onDelete(ty.id)"
                              class="text-red-600 hover:text-red-800 text-sm">
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export default class TaxYearsIndexComponent implements OnInit {
  taxYearService = inject(TaxYearService);

  year = new Date().getFullYear();
  notes = '';

  ngOnInit() {
    this.taxYearService.loadTaxYears();
  }

  async onSubmit() {
    await this.taxYearService.createTaxYear({ year: this.year, notes: this.notes || undefined });
    this.notes = '';
  }

  async onDelete(id: string) {
    if (confirm('Delete this tax year?')) {
      await this.taxYearService.deleteTaxYear(id);
    }
  }
}
