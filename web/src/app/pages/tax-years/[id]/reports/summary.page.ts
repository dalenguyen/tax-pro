import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ReportService } from '../../../../services/report.service';
import { TaxSummary } from '@can-tax-pro/types';

@Component({
  selector: 'app-report-summary',
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @media print {
      .no-print { display: none !important; }
      .print-page { box-shadow: none !important; border: 1px solid #e5e7eb; }
    }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-6 no-print">
          <div class="flex items-center gap-4">
            <a [routerLink]="['/tax-years', taxYearId, 'reports']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Reports</a>
            <h1 class="text-3xl font-bold text-gray-900">Tax Summary</h1>
          </div>
          <button (click)="print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Print / Save PDF
          </button>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (data()) {
          <div class="bg-white rounded-lg shadow print-page p-8 space-y-8">
            <div class="text-center border-b pb-4">
              <h2 class="text-2xl font-bold text-gray-900">Tax Year {{ data()!.taxYear }}</h2>
              <p class="text-gray-500 text-sm mt-1">Income Tax Summary</p>
            </div>

            <!-- Business Income -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Business Income</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Gross Business Income</span>
                  <span class="font-mono font-medium">\${{ data()!.totalBusinessIncome | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Business Expenses</span>
                  <span class="font-mono font-medium text-red-600">(\${{ data()!.totalBusinessExpenses | number:'1.2-2' }})</span>
                </div>
                <div class="flex justify-between font-semibold border-t pt-2">
                  <span>Net Business Income</span>
                  <span [class]="data()!.netBusinessIncome >= 0 ? 'font-mono text-green-700' : 'font-mono text-red-600'">
                    \${{ data()!.netBusinessIncome | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </section>

            <!-- Rental Income -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Rental Income</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Gross Rental Income</span>
                  <span class="font-mono font-medium">\${{ data()!.totalRentalIncome | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Rental Expenses</span>
                  <span class="font-mono font-medium text-red-600">(\${{ data()!.totalRentalExpenses | number:'1.2-2' }})</span>
                </div>
                <div class="flex justify-between font-semibold border-t pt-2">
                  <span>Net Rental Income</span>
                  <span [class]="data()!.netRentalIncome >= 0 ? 'font-mono text-green-700' : 'font-mono text-red-600'">
                    \${{ data()!.netRentalIncome | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </section>

            <!-- Investments -->
            <section>
              <h3 class="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Investments</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">RRSP Contributions</span>
                  <span class="font-mono font-medium">\${{ data()!.rrspContributions | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">TFSA Contributions</span>
                  <span class="font-mono font-medium">\${{ data()!.tfsaContributions | number:'1.2-2' }}</span>
                </div>
              </div>
            </section>

            <!-- Totals -->
            <section class="bg-gray-50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Summary Totals</h3>
              <div class="space-y-3">
                <div class="flex justify-between text-lg">
                  <span class="font-medium text-gray-700">Total Income</span>
                  <span class="font-mono font-bold text-gray-900">\${{ data()!.totalIncome | number:'1.2-2' }}</span>
                </div>
                <div class="flex justify-between text-lg">
                  <span class="font-medium text-gray-700">Total Deductions</span>
                  <span class="font-mono font-bold text-red-600">(\${{ data()!.totalDeductions | number:'1.2-2' }})</span>
                </div>
                <div class="flex justify-between text-xl border-t pt-3">
                  <span class="font-bold text-gray-900">Net Taxable Income</span>
                  <span class="font-mono font-bold text-blue-700">
                    \${{ (data()!.totalIncome - data()!.totalDeductions) | number:'1.2-2' }}
                  </span>
                </div>
              </div>
            </section>
          </div>
        }
      </div>
    </div>
  `,
})
export default class ReportSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  taxYearId = '';
  data = signal<TaxSummary | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try {
      const d = await this.reportService.getSummary(this.taxYearId);
      this.data.set(d);
    } finally {
      this.loading.set(false);
    }
  }

  print() {
    window.print();
  }
}
