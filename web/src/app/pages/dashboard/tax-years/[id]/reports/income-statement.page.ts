import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReportService } from '../../../../../services/report.service';

interface IncomeGroup {
  sourceType: string;
  entries: any[];
  total: number;
}

interface IncomeStatementData {
  groups: IncomeGroup[];
  grandTotal: number;
}

@Component({
  selector: 'app-income-statement',
  imports: [RouterLink, DecimalPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @media print { .no-print { display: none !important; } }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center justify-between mb-6 no-print">
          <div class="flex items-center gap-4">
            <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Reports</a>
            <h1 class="text-3xl font-bold text-gray-900">Income Statement</h1>
          </div>
          <button (click)="print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Print / Save PDF
          </button>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (data()) {
          <div class="space-y-6">
            @for (group of data()!.groups; track group.sourceType) {
              <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="bg-blue-50 px-6 py-3 flex justify-between items-center">
                  <h2 class="text-base font-semibold text-blue-900">{{ group.sourceType }}</h2>
                  <span class="font-mono font-bold text-blue-900">\${{ group.total | number:'1.2-2' }}</span>
                </div>
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
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
              <span class="text-xl font-mono font-bold text-green-700">\${{ data()!.grandTotal | number:'1.2-2' }}</span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class IncomeStatementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  taxYearId = '';
  data = signal<IncomeStatementData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try {
      const d = await this.reportService.getIncomeStatement(this.taxYearId);
      this.data.set(d);
    } finally {
      this.loading.set(false);
    }
  }

  print() { window.print(); }
}
