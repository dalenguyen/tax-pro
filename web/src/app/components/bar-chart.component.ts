import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';

export interface BarDatum {
  label: string;
  value: number;
}

@Component({
  selector: 'app-bar-chart',
  imports: [DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (max() === 0) {
      <p class="text-sm text-gray-400">No data</p>
    } @else {
      <ul class="space-y-2">
        @for (row of rows(); track row.label) {
          <li>
            <div class="flex justify-between text-xs mb-1">
              <span class="font-medium text-gray-700 truncate pr-2">{{ row.label }}</span>
              <span class="text-gray-500 font-mono">\${{ row.value | number:'1.0-0' }}</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-2" role="progressbar">
              <div class="bg-red-500 h-2 rounded-full" [style.width.%]="row.pct"></div>
            </div>
          </li>
        }
      </ul>
    }
  `,
})
export class BarChartComponent {
  data = input.required<BarDatum[]>();

  max = computed(() => this.data().reduce((m, d) => Math.max(m, d.value), 0));

  rows = computed(() => {
    const max = this.max();
    return [...this.data()]
      .filter((d) => d.value > 0)
      .sort((a, b) => b.value - a.value)
      .map((d) => ({ ...d, pct: max > 0 ? (d.value / max) * 100 : 0 }));
  });
}
