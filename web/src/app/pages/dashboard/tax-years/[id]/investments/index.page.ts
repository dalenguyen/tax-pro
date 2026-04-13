import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe, CurrencyPipe } from '@angular/common';
import { InvestmentService } from '../../../../../services/investment.service';
import { InvestmentAccountType } from '@can-tax-pro/types';

@Component({
  selector: 'app-investments-list',
  imports: [RouterLink, FormsModule, DatePipe, DecimalPipe, CurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <div class="max-w-6xl mx-auto">
        <div class="flex items-center gap-4 mb-6">
          <a [routerLink]="['/dashboard/tax-years', taxYearId]" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Back</a>
          <h1 class="text-3xl font-bold text-gray-900">Investments</h1>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-500">Total RRSP (CAD)</p>
            <p class="text-2xl font-bold text-gray-900 font-mono">{{ totalRrsp() | currency:'CAD':'symbol-narrow':'1.2-2' }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-500">Total TFSA (CAD)</p>
            <p class="text-2xl font-bold text-gray-900 font-mono">{{ totalTfsa() | currency:'CAD':'symbol-narrow':'1.2-2' }}</p>
          </div>
          <div class="bg-white rounded-lg shadow p-4">
            <p class="text-sm text-gray-500">Room Remaining</p>
            <p class="text-2xl font-bold text-gray-900 font-mono">{{ roomRemaining() | currency:'CAD':'symbol-narrow':'1.2-2' }}</p>
          </div>
        </div>

        <!-- Filter Tabs + Add Button -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex gap-1">
            @for (tab of tabs; track tab.value) {
              <button (click)="setFilter(tab.value)"
                      [class]="selectedTab === tab.value
                        ? 'bg-blue-600 text-white px-4 py-2 rounded text-sm'
                        : 'bg-white text-gray-700 px-4 py-2 rounded text-sm border border-gray-300 hover:bg-gray-50'">
                {{ tab.label }}
              </button>
            }
          </div>
          <a [routerLink]="['/dashboard/tax-years', taxYearId, 'investments', 'new']"
             class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
            Add Contribution
          </a>
        </div>

        @if (investmentService.loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (investmentService.contributions().length === 0) {
          <div class="bg-white rounded-lg shadow p-6 text-center">
            <p class="text-gray-500">No contributions yet.</p>
          </div>
        } @else {
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Type</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">Amount</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Currency</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">Rate</th>
                  <th class="px-4 py-3 text-right text-sm font-medium text-gray-500">CAD</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Institution</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Notes</th>
                  <th class="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                @for (c of investmentService.contributions(); track c.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-4 py-3 text-sm">{{ c.date | date:'yyyy-MM-dd' }}</td>
                    <td class="px-4 py-3 text-sm">
                      <span [class]="c.accountType === 'RRSP'
                        ? 'bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs'
                        : 'bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs'">
                        {{ c.accountType }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-sm text-right font-mono">{{ c.amount | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm">{{ c.currency }}</td>
                    <td class="px-4 py-3 text-sm text-right font-mono">{{ c.exchangeRate ?? '—' }}</td>
                    <td class="px-4 py-3 text-sm text-right font-mono">{{ (c.amountCad ?? c.amount) | number:'1.2-2' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ c.institution || '—' }}</td>
                    <td class="px-4 py-3 text-sm text-gray-600">{{ c.notes || '—' }}</td>
                    <td class="px-4 py-3 text-sm flex gap-2">
                      <a [routerLink]="['/dashboard/tax-years', taxYearId, 'investments', c.id]"
                         class="text-blue-600 hover:text-blue-800">Edit</a>
                      <button (click)="onDelete(c.id)"
                              class="text-red-600 hover:text-red-800">Delete</button>
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
export default class InvestmentsListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  investmentService = inject(InvestmentService);

  taxYearId = '';
  selectedTab = '';

  tabs = [
    { label: 'All', value: '' },
    { label: 'RRSP', value: InvestmentAccountType.RRSP },
    { label: 'TFSA', value: InvestmentAccountType.TFSA },
  ];

  totalRrsp = computed(() =>
    this.investmentService.contributions()
      .filter(c => c.accountType === InvestmentAccountType.RRSP)
      .reduce((sum, c) => sum + (c.amountCad ?? c.amount), 0)
  );

  totalTfsa = computed(() =>
    this.investmentService.contributions()
      .filter(c => c.accountType === InvestmentAccountType.TFSA)
      .reduce((sum, c) => sum + (c.amountCad ?? c.amount), 0)
  );

  roomRemaining = computed(() => {
    const last = this.investmentService.contributions().at(-1);
    return last?.roomRemaining ?? 0;
  });

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.investmentService.loadContributions(this.taxYearId);
  }

  setFilter(tab: string) {
    this.selectedTab = tab;
    this.investmentService.loadContributions(
      this.taxYearId,
      tab ? (tab as InvestmentAccountType) : undefined
    );
  }

  async onDelete(id: string) {
    if (confirm('Delete this contribution?')) {
      await this.investmentService.deleteContribution(this.taxYearId, id);
      await this.investmentService.loadContributions(
        this.taxYearId,
        this.selectedTab ? (this.selectedTab as InvestmentAccountType) : undefined
      );
    }
  }
}
