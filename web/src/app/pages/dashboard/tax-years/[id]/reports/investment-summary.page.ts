import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { ReportService } from '../../../../../services/report.service';

interface InvestmentGroup {
  contributions: any[];
  total: number;
}

interface InvestmentSummaryData {
  rrsp: InvestmentGroup;
  tfsa: InvestmentGroup;
}

@Component({
  selector: 'app-investment-summary',
  imports: [RouterLink, DecimalPipe, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [`
    @media print { .no-print { display: none !important; } }
  `],
  template: `
    <div class="min-h-screen bg-gray-50 p-6 print:bg-white print:p-0">
      <div class="max-w-3xl mx-auto">
        <div class="flex items-center justify-between mb-6 no-print">
          <div class="flex items-center gap-4">
            <a [routerLink]="['/dashboard/tax-years', taxYearId, 'reports']" class="text-gray-500 hover:text-gray-700 text-sm">&larr; Reports</a>
            <h1 class="text-3xl font-bold text-gray-900">Investment Summary</h1>
          </div>
          <button (click)="print()" class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 text-sm">
            Print / Save PDF
          </button>
        </div>

        @if (loading()) {
          <p class="text-gray-500">Loading...</p>
        } @else if (data()) {
          <div class="space-y-6">
            <!-- RRSP -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 class="text-lg font-semibold">RRSP Contributions</h2>
                <span class="text-2xl font-bold font-mono">\${{ data()!.rrsp.total | number:'1.2-2' }}</span>
              </div>
              @if (data()!.rrsp.contributions.length === 0) {
                <p class="p-6 text-gray-400 text-sm">No RRSP contributions.</p>
              } @else {
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Institution</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Currency</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">CAD</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Room Remaining</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (c of data()!.rrsp.contributions; track c.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm">{{ c.date | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ c.institution || '—' }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ c.amount | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm">{{ c.currency }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ (c.amountCad ?? c.amount) | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ c.roomRemaining != null ? (c.roomRemaining | number:'1.2-2') : '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>

            <!-- TFSA -->
            <div class="bg-white rounded-lg shadow overflow-hidden">
              <div class="bg-green-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 class="text-lg font-semibold">TFSA Contributions</h2>
                <span class="text-2xl font-bold font-mono">\${{ data()!.tfsa.total | number:'1.2-2' }}</span>
              </div>
              @if (data()!.tfsa.contributions.length === 0) {
                <p class="p-6 text-gray-400 text-sm">No TFSA contributions.</p>
              } @else {
                <table class="w-full">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Institution</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Amount</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Currency</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">CAD</th>
                      <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Room Remaining</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    @for (c of data()!.tfsa.contributions; track c.id) {
                      <tr class="hover:bg-gray-50">
                        <td class="px-4 py-2 text-sm">{{ c.date | date:'yyyy-MM-dd' }}</td>
                        <td class="px-4 py-2 text-sm text-gray-600">{{ c.institution || '—' }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ c.amount | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm">{{ c.currency }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ (c.amountCad ?? c.amount) | number:'1.2-2' }}</td>
                        <td class="px-4 py-2 text-sm text-right font-mono">{{ c.roomRemaining != null ? (c.roomRemaining | number:'1.2-2') : '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              }
            </div>

            <!-- Combined total -->
            <div class="bg-white rounded-lg shadow p-6 flex justify-between items-center">
              <span class="text-xl font-bold text-gray-900">Total Contributions</span>
              <span class="text-xl font-mono font-bold text-blue-700">
                \${{ (data()!.rrsp.total + data()!.tfsa.total) | number:'1.2-2' }}
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export default class InvestmentSummaryComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reportService = inject(ReportService);

  taxYearId = '';
  data = signal<InvestmentSummaryData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.taxYearId = this.route.snapshot.params['id'];
    this.load();
  }

  private async load() {
    this.loading.set(true);
    try {
      const d = await this.reportService.getInvestmentSummary(this.taxYearId);
      this.data.set(d);
    } finally {
      this.loading.set(false);
    }
  }

  print() { window.print(); }
}
