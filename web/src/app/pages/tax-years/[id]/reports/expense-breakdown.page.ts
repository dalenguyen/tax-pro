import { Component, inject, OnInit, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe, PercentPipe } from '@angular/common';
import { ReportService } from '../../../../services/report.service';

interface ExpenseGroup {
  category: string;
  entries: any[];
  total: number;
}

interface ExpenseBreakdownData {
  groups: ExpenseGroup[];
  grandTotal: number;
}

@Component({
  selector: 'app-expense-breakdown',
  imports: [RouterLink, DecimalPipe, DatePipe, PercentPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @media print { .no-print { display: none !important; } }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6 no-print">
          <div class="flex items-center gap-4">
            <a [routerLink]="['/tax-years', taxYearId, 'reports']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Reports</a>
            <h1 class="text-3xl font-bold text-gray-900">Expense Breakdown</h1>
          </div>
          <button (click)="print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Print / Save PDF
          </button>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (data()) {
          <!-- Bar chart summary -->
          <div class="bg-white rounded-lg shadow p-6 mb-6">
            <h2 class="text-base font-semibold text-gray-700 mb-4">By Category</h2>
            <div class="space-y-3">
              @for (group of data()!.groups; track group.category) {
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="font-medium text-gray-700">{{ group.category }}</span>
                    <span class="text-gray-500">
                      \${{ group.total | number:'1.2-2' }}
                      ({{ data()!.grandTotal > 0 ? group.total / data()!.grandTotal : 0 | percent:'1.1-1' }})
                    </span>
                  </div>
                  <div class="w-full bg-gray-100 rounded-full h-2">
                    <div class="bg-red-400 h-2 rounded-full"
                         [style.width.%]="data()!.grandTotal > 0 ? (group.total / data()!.grandTotal) * 100 : 0">
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Detail tables -->
          <div class="space-y-6">
            @for (group of data()!.groups; track group.category) {
              <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="bg-red-50 px-6 py-3 flex justify-between items-center">
                  <h2 class="text-base font-semibold text-red-900">{{ group.category }}</h2>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-red-700">
                      {{ data()!.grandTotal > 0 ? group.total / data()!.grandTotal : 0 | percent:'1.1-1' }}
                    </span>
                    <span class="font-mono font-bold text-red-900">\${{ group.total | number:'1.2-2' }}</span>
                  </div>
                </div>
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Vendor</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Currency</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">CAD</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (entry of group.entries; track entry.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm">{{ entry.date | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ entry.vendor || '—' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ entry.description || '—' }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ entry.amount | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm">{{ entry.currency }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ (entry.amountCad ?? entry.amount) | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

            <div class="bg-white rounded-lg shadow p-6 flex justify-between items-center">
              <span class="text-xl font-bold text-gray-900">Grand Total</span>
              <span class="text-xl font-mono font-bold text-red-700">\${{ data()!.grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class ExpenseBreakdownComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  taxYearId = '';
  data = signal<ExpenseBreakdownData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try {
      const d = await this.reportService.getExpenseBreakdown(this.taxYearId);
      this.data.set(d);
    } finally {
      this.loading.set(false);
    }
  }

  print() { window.print(); }
}
