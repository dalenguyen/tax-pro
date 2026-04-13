import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReportService } from '../../../../../services/report.service';

interface RentalProperty {
  id: string;
  address: string;
  incomes: any[];
  totalIncome: number;
  expenses: any[];
  totalExpenses: number;
  netIncome: number;
}

interface RentalStatementData {
  properties: RentalProperty[];
  grandTotalIncome: number;
  grandTotalExpenses: number;
  grandNetIncome: number;
}

@Component({
  selector: 'app-rental-statement',
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
            <h1 class="text-3xl font-bold text-gray-900">Rental Statement</h1>
          </div>
          <button (click)="print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Print / Save PDF
          </button>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (data()) {
          @if (data()!.properties.length === 0) {
            <div class="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No rental properties found.
            </div>
          } @else {
            <div class="space-y-8">
              @for (prop of data()!.properties; track prop.id) {
                <div class="bg-white rounded-lg shadow overflow-hidden">
                  <div class="bg-gray-800 text-white px-6 py-4">
                    <h2 class="text-lg font-semibold">{{ prop.address }}</h2>
                    <div class="flex gap-6 mt-1 text-sm text-gray-300">
                      <span>Income: \${{ prop.totalIncome | number:'1.2-2' }}</span>
                      <span>Expenses: \${{ prop.totalExpenses | number:'1.2-2' }}</span>
                      <span [class]="prop.netIncome >= 0 ? 'text-green-300 font-semibold' : 'text-red-300 font-semibold'">
                        Net: \${{ prop.netIncome | number:'1.2-2' }}
                      </span>
                    </div>
                  </div>

                  <div class="p-6 space-y-6">
                    <!-- Income -->
                    <div>
                      <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Income</h3>
                      @if (prop.incomes.length === 0) {
                        <p class="text-sm text-gray-400">No income entries.</p>
                      } @else {
                        <table class="w-full text-sm">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount (CAD)</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-100">
                            @for (inc of prop.incomes; track inc.id) {
                              <tr>
                                <td class="px-3 py-2">{{ inc.date | date:'yyyy-MM-dd' }}</td>
                                <td class="px-3 py-2 text-gray-600">{{ inc.description || '—' }}</td>
                                <td class="px-3 py-2 text-right font-mono">\${{ inc.amount | number:'1.2-2' }}</td>
                              </tr>
                            }
                          </tbody>
                          <tfoot class="bg-green-50">
                            <tr>
                              <td colspan="2" class="px-3 py-2 font-semibold text-green-800">Total Income</td>
                              <td class="px-3 py-2 text-right font-mono font-bold text-green-800">\${{ prop.totalIncome | number:'1.2-2' }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      }
                    </div>

                    <!-- Expenses -->
                    <div>
                      <h3 class="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Expenses</h3>
                      @if (prop.expenses.length === 0) {
                        <p class="text-sm text-gray-400">No expense entries.</p>
                      } @else {
                        <table class="w-full text-sm">
                          <thead class="bg-gray-50">
                            <tr>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Category</th>
                              <th class="px-3 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                              <th class="px-3 py-2 text-right text-xs font-medium text-gray-500">Amount (CAD)</th>
                            </tr>
                          </thead>
                          <tbody class="divide-y divide-gray-100">
                            @for (exp of prop.expenses; track exp.id) {
                              <tr>
                                <td class="px-3 py-2">{{ exp.date | date:'yyyy-MM-dd' }}</td>
                                <td class="px-3 py-2">
                                  <span class="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs">{{ exp.category }}</span>
                                </td>
                                <td class="px-3 py-2 text-gray-600">{{ exp.description || '—' }}</td>
                                <td class="px-3 py-2 text-right font-mono">\${{ exp.amount | number:'1.2-2' }}</td>
                              </tr>
                            }
                          </tbody>
                          <tfoot class="bg-red-50">
                            <tr>
                              <td colspan="3" class="px-3 py-2 font-semibold text-red-800">Total Expenses</td>
                              <td class="px-3 py-2 text-right font-mono font-bold text-red-800">\${{ prop.totalExpenses | number:'1.2-2' }}</td>
                            </tr>
                          </tfoot>
                        </table>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- Grand totals -->
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Grand Totals</h2>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Rental Income</span>
                    <span class="font-mono font-medium">\${{ data()!.grandTotalIncome | number:'1.2-2' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Total Rental Expenses</span>
                    <span class="font-mono font-medium text-red-600">(\${{ data()!.grandTotalExpenses | number:'1.2-2' }})</span>
                  </div>
                  <div class="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Net Rental Income</span>
                    <span [class]="data()!.grandNetIncome >= 0 ? 'font-mono text-green-700' : 'font-mono text-red-600'">
                      \${{ data()!.grandNetIncome | number:'1.2-2' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export default class RentalStatementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  taxYearId = '';
  data = signal<RentalStatementData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try {
      const d = await this.reportService.getRentalStatement(this.taxYearId);
      this.data.set(d);
    } finally {
      this.loading.set(false);
    }
  }

  print() { window.print(); }
}
